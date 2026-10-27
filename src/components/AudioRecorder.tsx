import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Upload, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string, language?: string) => void;
  onClose: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscriptionComplete, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition if available in browser for instant preview
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // will catch user voice

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          if (current) setLiveTranscript(current);
        };

        recognition.onerror = () => {
          // Non-blocking, server Gemini 3.5 Transcribe is authoritative
        };

        speechRecognitionRef.current = recognition;
      } catch {
        // Ignore if unsupported
      }
    }
  }, []);

  const startRecording = async () => {
    setError(null);
    setLiveTranscript('');
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await handleAudioProcess(audioBlob, mimeType);
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordDuration(0);

      // Start duration counter
      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);

      // Start speech recognition preview if available
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.start();
        } catch {
          // Ignore
        }
      }
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setError('Microphone access denied. Please grant microphone permissions or upload an audio file.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
    }
  };

  const handleAudioProcess = async (audioBlob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setError(null);

    try {
      // Convert Blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Data,
            mimeType: mimeType || 'audio/webm',
          }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          // If server transcribe had an issue and we got live transcript from browser, use it
          if (liveTranscript.trim()) {
            onTranscriptionComplete(liveTranscript.trim());
            onClose();
            return;
          }
          throw new Error(data.error || 'Audio transcription failed.');
        }

        const resultText = data.transcription || liveTranscript;
        if (!resultText.trim()) {
          setError('No clear speech was detected. Please try speaking closer to the microphone.');
          setIsTranscribing(false);
          return;
        }

        onTranscriptionComplete(resultText.trim(), data.detectedLanguage);
        onClose();
      };
    } catch (err: any) {
      console.error('Transcription failed:', err);
      if (liveTranscript.trim()) {
        onTranscriptionComplete(liveTranscript.trim());
        onClose();
        return;
      }
      setError(err.message || 'Failed to transcribe audio. Please verify your connection.');
      setIsTranscribing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setError('Please upload a valid audio file (.mp3, .wav, .m4a, .webm, .ogg).');
      return;
    }

    handleAudioProcess(file, file.type);
  };

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Voice Transcription Engine</h3>
          <p className="text-xs text-slate-400 mt-1">
            Speak in Urdu (اردو), Pashto (پښتو), or English. Powered by Gemini 3.5 Transcribe.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-6">
          {isTranscribing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
              <p className="text-sm font-medium text-emerald-300">Transcribing audio with AI...</p>
              <p className="text-xs text-slate-400">Detecting Urdu, Pashto, or English speech</p>
            </div>
          ) : isRecording ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <button
                  onClick={stopRecording}
                  className="relative flex items-center justify-center w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg cursor-pointer transition transform active:scale-95"
                >
                  <Square className="w-8 h-8 fill-current" />
                </button>
              </div>
              <div className="text-center">
                <span className="text-xl font-mono font-bold text-rose-400">{formatSecs(recordDuration)}</span>
                <p className="text-xs text-slate-400 mt-1">Recording... Click to Stop & Transcribe</p>
              </div>

              {liveTranscript && (
                <div className="w-full mt-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 max-h-24 overflow-y-auto">
                  <span className="text-[10px] uppercase font-semibold text-emerald-400 block mb-1">Live Audio Preview:</span>
                  "{liveTranscript}"
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={startRecording}
                className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg cursor-pointer transition transform active:scale-95 group"
              >
                <Mic className="w-8 h-8 group-hover:scale-110 transition" />
              </button>
              <p className="text-xs text-slate-300 font-medium">Click to Start Recording</p>

              <div className="flex items-center gap-2 w-full my-3">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-[10px] uppercase font-semibold text-slate-500">OR UPLOAD AUDIO</span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-800/40 hover:bg-slate-800/80 cursor-pointer text-xs text-slate-300 transition">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload Voice Message (.mp3, .wav, .m4a)</span>
                <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            End-to-End Encrypted
          </span>
          <span>SHEZI × MANI AI Voice</span>
        </div>
      </div>
    </div>
  );
};
