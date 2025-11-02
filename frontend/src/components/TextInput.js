import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Mail, Phone, ArrowUpCircle, Mic, MicOff } from 'lucide-react';

const TextInput = ({ onAnalyze, placeholder, buttonText = 'Analyze' }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setText(prev => prev + finalTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (buttonText) {
      const storageKey = `draft_${buttonText.toLowerCase().replace(/\s+/g, '_')}`;
      const savedText = localStorage.getItem(storageKey);
      if (savedText && !text) {
        setText(savedText);
      }
    }
  }, [buttonText, text]);

  useEffect(() => {
    if (text && buttonText) {
      const storageKey = `draft_${buttonText.toLowerCase().replace(/\s+/g, '_')}`;
      localStorage.setItem(storageKey, text);
    }
  }, [text, buttonText]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAnalyze(text.trim());
      // Clear draft after successful submission
      if (buttonText) {
        const storageKey = `draft_${buttonText.toLowerCase().replace(/\s+/g, '_')}`;
        localStorage.removeItem(storageKey);
      }
    }
  };

  const handleClear = () => {
    setText('');
    if (buttonText) {
      const storageKey = `draft_${buttonText.toLowerCase().replace(/\s+/g, '_')}`;
      localStorage.removeItem(storageKey);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="text-input" className="flex items-center gap-3 text-lg md:text-xl font-semibold text-gray-800 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            {buttonText && buttonText.includes('Email') ? <Mail className="w-6 h-6 text-blue-600" /> : <Phone className="w-6 h-6 text-blue-600" />}
          </div>
          Content to Analyze
        </label>
        <div className="relative">
          <textarea
            ref={textareaRef}
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={12}
            className="w-full px-8 py-6 border-2 border-gray-200 rounded-3xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all duration-300 text-gray-700 placeholder-gray-400 text-lg leading-relaxed"
            aria-label="Content to analyze"
            aria-describedby="input-help"
          />
          {text.length > 0 && (
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-gray-500 bg-white/90 px-3 py-1 rounded-full shadow-sm">
                <span>{text.length} characters</span>
              </div>
            </div>
          )}
          {isSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute bottom-6 right-6 p-3 rounded-full transition-all duration-200 ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              title={isListening ? 'Stop voice input' : 'Start voice input'}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        <div id="input-help" className="text-sm text-gray-500 mt-2">
          {isSupported && (
            <span className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Voice input available - click the microphone icon
            </span>
          )}
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-3 text-base text-gray-500">
            <div className="p-1 bg-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-500" aria-hidden="true" />
            </div>
            <span>AI will analyze your content</span>
          </div>
          {text.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-base text-gray-500 hover:text-gray-700 font-medium transition-colors px-3 py-1 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Clear all text"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <button
          type="submit"
          disabled={!text.trim()}
          className="btn btn-primary flex items-center gap-4 px-10 py-5 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`${buttonText} - Submit for analysis`}
        >
          <ArrowUpCircle className="w-6 h-6" aria-hidden="true" />
          {buttonText}
        </button>
        
        <button
          type="button"
          onClick={handleClear}
          disabled={!text.trim()}
          className="btn btn-secondary px-8 py-5 text-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          aria-label="Clear all text"
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default TextInput;