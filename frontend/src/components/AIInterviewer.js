import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { MessageCircle, X, Send, Bot, User, Mic, MicOff, RefreshCw, Volume2, VolumeX, CheckCircle, FileText, BarChart3, AlertTriangle, ArrowLeft } from 'lucide-react';
import { startInterviewSession, processInterviewResponse, generateVoice, recognizeSpeech } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const AIInterviewer = memo(({ startup, investorProfile, onEnd }) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, loading, active, completed, error
  const [inputMessage, setInputMessage] = useState('');
  const [questionsRemaining, setQuestionsRemaining] = useState(0);
  const [isRecording, setIsRecording] = useState(false); 
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);

  const audioRef = useRef(new Audio());
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  
  // --- Voice Interaction Setup (MediaRecorder for STT) ---

  const startRecording = async () => {
    if (isRecording || isSpeaking) return;

    try {
      // Request audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize MediaRecorder (prefer opus codec for better quality/compression for STT)
      mediaRecorderRef.current = new MediaRecorder(stream, { 
          mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
              ? 'audio/webm;codecs=opus' 
              : 'audio/webm' 
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current.mimeType });
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());

        // Send Blob to FastAPI STT endpoint
        const recognitionResult = await recognizeSpeech(audioBlob);

        if (recognitionResult.success && recognitionResult.transcript) {
          setInputMessage(recognitionResult.transcript);
          handleSendMessage(recognitionResult.transcript);
        } else {
          setError(recognitionResult.error || "Could not understand speech. Please type your response.");
          setStatus('active'); // Revert status for manual try
          setInputMessage('');
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
      setInputMessage('Recording...');

    } catch (err) {
      console.error("Microphone access failed:", err);
      setError("Microphone access denied. Check your browser permissions.");
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        // onstop handler will handle setting isRecording=false and sending data
    }
  };
  
  const toggleRecording = () => {
      if (isRecording) {
          stopRecording();
      } else {
          startRecording();
      }
  };
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        audioRef.current.pause();
        audioRef.current.src = "";
    };
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Automatically start the interview when the component mounts
    if (status === 'idle') {
      handleStartInterview();
    }
  }, [status, handleStartInterview]);
  
  // --- Core Interview Logic ---

  const handleStartInterview = useCallback(async () => {
    setStatus('loading');
    setError(null);
    setMessages([]);
    
    // Check for MediaRecorder support
    if (!window.MediaRecorder || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Audio recording (STT) is not supported in your browser. Please use a modern browser (Chrome, Edge).");
        setStatus('error');
        return;
    }
    
    try {
      const startupData = {
        id: startup.id,
        companyName: startup.companyName || startup.name,
        industry: startup.industry,
        stage: startup.stage,
        description: startup.description,
        analysisData: startup.analysisData || {},
        documents: startup.documents || [],
        emailTranscript: startup.emailTranscript || '',
        callTranscript: startup.callTranscript || ''
      };
      
      const investorContext = {
          name: investorProfile.firmName || investorProfile.name,
          thesis: investorProfile.investmentThesis,
          isComplete: investorProfile.isComplete
      };

      // 2. Call backend to start session and generate questions
      const result = await startInterviewSession(startup.id, startupData, investorContext);
      
      setSessionId(result.session_id);
      setQuestionsRemaining(result.questions_remaining);
      setMessages(result.history);
      setStatus(result.status);
      
      // 3. Generate voice for the first question and play it
      await speak(result.current_question);
      setStatus('active');
      
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [startup, investorProfile]);

  const handleSendMessage = useCallback(async (text) => {
    if (!text.trim() || status === 'loading' || status === 'completed') return;

    // 1. Optimistically add user message
    const userMessage = { id: Date.now(), role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setStatus('loading');

    try {
      // 2. Call backend to process response and get next question
      const result = await processInterviewResponse(sessionId, text.trim());
      
      setQuestionsRemaining(result.questions_remaining);
      setMessages(result.history);
      
      // 3. Generate voice for the new question/closing message and play it
      if (result.status !== 'completed') {
          await speak(result.current_question);
          setStatus('active');
      } else {
          // Speak the final closing message
          const closingMessage = result.history.slice(-1)[0].content;
          await speak(closingMessage);
          // Auto end interview after speaking closing message
          setTimeout(() => handleEndInterview(result.history), 2000); 
      }
      
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [sessionId, status]);
  
  const handleEndInterview = useCallback((finalHistory = messages) => {
    // Stop any ongoing playback or recording
    audioRef.current.pause();
    audioRef.current.src = "";
    if (isRecording) {
        mediaRecorderRef.current?.stop();
    }
    // Notify the parent component with the final conversation history (transcript)
    onEnd(finalHistory);
  }, [messages, onEnd, isRecording]);


  // --- Voice Handlers (TTS Playback) ---
  
  const speak = useCallback(async (text) => {
    setIsSpeaking(true);
    
    try {
        // 1. Call backend for Base64 audio content
        const voiceResult = await generateVoice(text);
        
        if (voiceResult.success && voiceResult.audio_content) {
            const audioData = `data:${voiceResult.content_type};base64,${voiceResult.audio_content}`;
            
            // Playback using HTML5 Audio element reference
            audioRef.current.src = audioData;
            audioRef.current.onended = () => {
                setIsSpeaking(false);
            };
            audioRef.current.onerror = (e) => {
                console.error("Audio playback error:", e);
                setIsSpeaking(false);
                setError("Audio playback failed. Please check backend logs and Google Cloud TTS permissions.");
            };
            audioRef.current.play();
            
        } else {
            // Fallback if backend call fails (e.g., authentication error)
            setError(voiceResult.error || "Failed to generate audio, check console for details.");
            setIsSpeaking(false);
        }
    } catch (e) {
        console.error("Voice synthesis/playback failed:", e);
        setError("A critical voice service error occurred. Check browser and backend logs.");
        setIsSpeaking(false);
    }
  }, []);

  const renderMessage = (message) => (
      <div
          key={message.id || Date.now() + messages.indexOf(message)}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
      >
          <div
              className={`max-w-[80%] rounded-2xl p-3 shadow-md ${
                  message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
              }`}
          >
              <div className="flex items-start space-x-2">
                  {message.role === 'bot' && (
                      <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-600" />
                  )}
                  {message.role === 'user' && (
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0 text-white" />
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
          </div>
      </div>
  );

  const isInterviewReady = (startup.analysisData && Object.keys(startup.analysisData).length > 0) || (startup.emailTranscript || startup.callTranscript);
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <Bot className="h-10 w-10 text-purple-600" />
            <h1 className="text-3xl font-black text-gray-900">AI Interviewer</h1>
            <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                status === 'active' ? 'bg-green-100 text-green-800' : 
                status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                'bg-gray-100 text-gray-800'
            }`}>
                {status.toUpperCase()}
            </span>
          </div>
          <button
              onClick={() => handleEndInterview(messages)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Exit/Go Back</span>
          </button>
        </div>
        
        {/* Main Content Area */}
        {status === 'idle' && (
          <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-purple-100">
            <Bot className="h-20 w-20 text-purple-400 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900 mb-4">Start Founder Interview for {startup.companyName}</h3>
            <p className="text-lg text-gray-600 max-w-lg mx-auto mb-8">
              The AI will generate 5-7 critical, analysis-driven questions based on your submitted data and investor persona ({investorProfile.firmName}).
            </p>
            {isInterviewReady ? (
                <button
                    onClick={handleStartInterview}
                    className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Mic className="h-5 w-5" />
                    <span>Start Mock Investor Interview</span>
                  </button>
            ) : (
                <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg max-w-md mx-auto">
                    <p className="text-sm text-yellow-800 font-semibold">
                        ⚠️ Please run the **comprehensive analysis** or submit **transcript data** to enable a data-driven interview.
                    </p>
                </div>
            )}
          </div>
        )}

        {/* Loading Spinner for AI thinking/network delay */}
        {['loading', 'active'].includes(status) && (isSpeaking || isRecording || status === 'loading') && (
            <div className={`fixed inset-0 bg-black bg-opacity-10 z-10 transition-opacity duration-300 ${status === 'loading' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                 <div className="flex flex-col items-center justify-center h-full">
                    {status === 'loading' && (
                        <LoadingSpinner size="xl" text={isSpeaking ? "AI is Speaking..." : isRecording ? "Transcribing Audio..." : "AI is Thinking..."} />
                    )}
                 </div>
            </div>
        )}
        
        {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
                <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold text-red-800">Error</h3>
                        <p className="text-red-700">{error}</p>
                        <button onClick={handleStartInterview} className="mt-2 text-blue-600 hover:underline">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        {(status === 'active' || status === 'completed') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chat Panel */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col h-[70vh]">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map(renderMessage)}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Input Area */}
                    <div className="border-t border-gray-200 p-4">
                        <div className="flex items-center space-x-3">
                            {/* Voice Input Button */}
                            <button
                                onClick={toggleRecording}
                                disabled={isSpeaking || status === 'completed' || status === 'loading'}
                                className={`p-4 rounded-full shadow-lg transition-all duration-200 ${
                                    isRecording
                                        ? 'bg-red-500 text-white animate-pulse'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                }`}
                                title={isRecording ? 'Stop Recording and Transcribe' : 'Start Voice Recording'}
                            >
                                {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                            </button>
                            
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSendMessage(inputMessage);
                                    }
                                }}
                                placeholder={isRecording ? "Listening... Speak clearly" : "Type your response or click mic to speak..."}
                                disabled={isSpeaking || status === 'completed' || isRecording}
                                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                            />
                            
                            <button
                                onClick={() => handleSendMessage(inputMessage)}
                                disabled={!inputMessage.trim() || isSpeaking || status === 'completed' || isRecording}
                                className="p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                            >
                                <Send className="h-6 w-6" />
                            </button>
                        </div>
                        {isSpeaking && (
                            <div className="mt-2 text-center text-sm text-purple-600 font-semibold flex items-center justify-center space-x-2">
                                <Volume2 className="h-4 w-4 animate-pulse" />
                                <span>AI Speaking...</span>
                            </div>
                        )}
                        {status === 'completed' && (
                            <div className="mt-2 text-center text-sm text-blue-600 font-semibold flex items-center justify-center space-x-2">
                                <CheckCircle className="h-4 w-4" />
                                <span>Interview Complete. Review the transcript.</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Sidebar Summary */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Interview Stats */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-4">
                        <h3 className="text-xl font-black text-gray-900 flex items-center space-x-2">
                            <BarChart3 className="h-6 w-6 text-purple-600" />
                            <span>Session Summary</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-purple-50 p-4 rounded-xl">
                                <p className="text-sm font-bold text-gray-600">Questions Left</p>
                                <p className="text-3xl font-black text-purple-600">{questionsRemaining}</p>
                            </div>
                            <div className="bg-pink-50 p-4 rounded-xl">
                                <p className="text-sm font-bold text-gray-600">Total Turns</p>
                                <p className="text-3xl font-black text-pink-600">{messages.length}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 pt-2">
                            Session ID: {sessionId ? `${sessionId.substring(0, 8)}...` : 'N/A'}
                        </p>
                        {status === 'active' && (
                            <button
                                onClick={() => handleEndInterview(messages)}
                                className="w-full px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                            >
                                <X className="h-5 w-5" />
                                <span>End Interview Early</span>
                            </button>
                        )}
                    </div>
                    
                    {/* Transcript/Report Preview (only visible after completion) */}
                    {status === 'completed' && (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-4">
                            <h3 className="text-xl font-black text-gray-900 flex items-center space-x-2">
                                <FileText className="h-6 w-6 text-blue-600" />
                                <span>Final Transcript</span>
                            </h3>
                            <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50 text-sm text-gray-700">
                                {messages.map((msg, index) => (
                                    <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        <span className="font-bold capitalize">{msg.role}: </span>
                                        <span>{msg.content}</span>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={() => handleEndInterview(messages)}
                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold"
                            >
                                Finish & Go Back
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
});

export default AIInterviewer;