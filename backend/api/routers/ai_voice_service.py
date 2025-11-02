import base64
import os
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import logging
from typing import Dict, Any, Optional

# --- Google Cloud Imports ---
from google.auth.exceptions import DefaultCredentialsError
from google.cloud import texttospeech
from google.cloud import speech
from google.cloud.texttospeech_v1.types import SynthesisInput, VoiceSelectionParams, AudioConfig, SsmlVoiceGender
# --- End Google Cloud Imports ---

logger = logging.getLogger(__name__)
router = APIRouter(tags=["ai-voice-service"])

# Initialize the Google Cloud TTS/STT Clients (done once)
try:
    tts_client = texttospeech.TextToSpeechClient()
    stt_client = speech.SpeechClient()
    logger.info("Google Cloud TTS/STT Clients initialized successfully.")
except DefaultCredentialsError as e:
    logger.warning(f"Google Cloud TTS/STT client initialization failed: {e}. Voice services will be unavailable.")
    tts_client = None
    stt_client = None
except Exception as e:
    logger.error(f"An unexpected error occurred during Google Cloud client initialization: {e}", exc_info=True)
    tts_client = None
    stt_client = None

# --- Pydantic Models ---

class VoiceRequest(BaseModel):
    text: str
    # Updated default voice to a high-quality Wavenet model
    voice_name: str = "en-US-Wavenet-F" 
    pitch: float = 0.0
    speaking_rate: float = 1.0

class VoiceResponse(BaseModel):
    success: bool
    audio_content: str # Base64 encoded audio bytes
    content_type: str = "audio/mpeg"

class SpeechToTextResponse(BaseModel):
    success: bool
    transcript: str
    confidence: Optional[float] = None
    error: Optional[str] = None

# --- TTS Endpoint ---

@router.post("/voice/generate", response_model=VoiceResponse)
async def generate_voice(request: VoiceRequest):
    """
    Generates voice audio from text using Google Cloud TTS.
    """
    if tts_client is None:
        raise HTTPException(status_code=503, detail="TTS service is unavailable. Check backend configuration.")
        
    if not request.text:
        raise HTTPException(status_code=400, detail="Text field cannot be empty.")
        
    try:
        synthesis_input = SynthesisInput(text=request.text)

        # Build the voice request using the new Wavenet default
        voice = VoiceSelectionParams(
            language_code="en-US",
            name=request.voice_name,
            ssml_gender=SsmlVoiceGender.FEMALE
        )

        audio_config = AudioConfig(
            audio_encoding=AudioConfig.AudioEncoding.MP3,
            pitch=request.pitch,
            speaking_rate=request.speaking_rate
        )

        response = tts_client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )

        audio_base64 = base64.b64encode(response.audio_content).decode('utf-8')

        return VoiceResponse(
            success=True,
            audio_content=audio_base64,
            content_type="audio/mpeg"
        )

    except Exception as e:
        logger.error(f"Error generating voice audio with Google TTS: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate voice audio: {str(e)}"
        )

# --- STT Endpoint ---

@router.post("/speech/recognize", response_model=SpeechToTextResponse)
async def recognize_speech(audio_file: UploadFile = File(...), sample_rate_hertz: int = Form(16000)):
    """
    Performs speech recognition on an uploaded audio file (MP3/WAV/WebM format).
    """
    if stt_client is None:
        raise HTTPException(status_code=503, detail="STT service is unavailable. Check backend configuration.")
        
    # NOTE: The frontend MediaRecorder usually produces webm/opus or mp3
    if audio_file.content_type not in ["audio/mpeg", "audio/wav", "audio/webm", "audio/mp3"]:
        raise HTTPException(status_code=400, detail=f"Unsupported media type: {audio_file.content_type}.")

    try:
        audio_content = await audio_file.read()
        
        audio = speech.RecognitionAudio(content=audio_content)

        # Determine encoding based on MIME type (required for Google Cloud STT)
        if "webm" in audio_file.content_type or "opus" in audio_file.content_type:
            encoding = speech.RecognitionConfig.AudioEncoding.OGG_OPUS
        elif "mp3" in audio_file.content_type or "mpeg" in audio_file.content_type:
             encoding = speech.RecognitionConfig.AudioEncoding.MP3
        elif "wav" in audio_file.content_type:
            encoding = speech.RecognitionConfig.AudioEncoding.LINEAR16
        else:
            encoding = speech.RecognitionConfig.AudioEncoding.ENCODING_UNSPECIFIED # Let API decide

        config = speech.RecognitionConfig(
            encoding=encoding,
            sample_rate_hertz=sample_rate_hertz,
            language_code="en-US",
            model="default"
        )

        # Perform the speech recognition
        response = stt_client.recognize(config=config, audio=audio)

        if response.results and response.results[0].alternatives:
            best_alternative = response.results[0].alternatives[0]
            return SpeechToTextResponse(
                success=True,
                transcript=best_alternative.transcript,
                confidence=best_alternative.confidence
            )
        else:
            return SpeechToTextResponse(
                success=False,
                transcript="",
                error="No speech recognized in the audio file."
            )

    except Exception as e:
        logger.error(f"Error recognizing speech with Google STT: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to recognize speech: {str(e)}"
        )