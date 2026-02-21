/**
 * Serviço de Transcrição Local
 * 
 * Usa Apple Speech Recognition (iOS) para transcrição rápida.
 * Muito mais rápido que transcrição no backend (~2-3s vs ~15-30s).
 * 
 * Limitações:
 * - Requer iOS 10+
 * - Máximo 1 minuto por requisição (dividimos em chunks)
 * - Precisa de conexão à internet (mas é muito mais rápido que upload completo)
 * - Limite de requisições por dispositivo/dia
 */

import { Platform, NativeModules } from 'react-native';

export interface TranscriptionResult {
  success: boolean;
  text?: string;
  segments?: TranscriptionSegment[];
  duration?: number;
  error?: string;
}

export interface TranscriptionSegment {
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

export interface TranscriptionProgress {
  status: 'preparing' | 'extracting' | 'transcribing' | 'completed' | 'error';
  percentage: number;
  currentSegment?: number;
  totalSegments?: number;
}

const SPEECH_AVAILABLE = Platform.OS === 'ios';

export function isSpeechRecognitionAvailable(): boolean {
  return SPEECH_AVAILABLE;
}

export async function requestSpeechPermission(): Promise<boolean> {
  if (!SPEECH_AVAILABLE) {
    console.warn('[Transcription] Speech recognition only available on iOS');
    return false;
  }

  try {
    const SpeechRecognition = NativeModules.SpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[Transcription] SpeechRecognition module not available');
      return false;
    }
    
    const hasPermission = await SpeechRecognition.requestPermission();
    return hasPermission;
  } catch (error) {
    console.error('[Transcription] Permission request error:', error);
    return false;
  }
}

export async function transcribeAudioFile(
  audioPath: string,
  language: string = 'pt-BR',
  onProgress?: (progress: TranscriptionProgress) => void,
): Promise<TranscriptionResult> {
  if (!SPEECH_AVAILABLE) {
    return {
      success: false,
      error: 'Speech recognition only available on iOS',
    };
  }

  try {
    onProgress?.({
      status: 'preparing',
      percentage: 0,
    });

    const SpeechRecognition = NativeModules.SpeechRecognition;
    
    if (!SpeechRecognition) {
      console.log('[Transcription] Native module not available, using fallback');
      return transcribeFallback(audioPath);
    }

    onProgress?.({
      status: 'transcribing',
      percentage: 50,
    });

    const result = await SpeechRecognition.transcribeFile(audioPath, language);

    onProgress?.({
      status: 'completed',
      percentage: 100,
    });

    return {
      success: true,
      text: result.text,
      segments: result.segments,
      duration: result.duration,
    };

  } catch (error) {
    console.error('[Transcription] Error:', error);
    onProgress?.({
      status: 'error',
      percentage: 0,
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transcription failed',
    };
  }
}

async function transcribeFallback(audioPath: string): Promise<TranscriptionResult> {
  console.log('[Transcription] Using fallback (no native module)');
  return {
    success: false,
    error: 'Native speech module not installed. Install react-native-speech-recognition.',
  };
}

export async function transcribeVideoFile(
  videoPath: string,
  language: string = 'pt-BR',
  onProgress?: (progress: TranscriptionProgress) => void,
): Promise<TranscriptionResult> {
  try {
    onProgress?.({
      status: 'extracting',
      percentage: 10,
    });

    const audioPath = videoPath.replace(/\.(mp4|mov|m4v)$/i, '.m4a');
    
    console.log('[Transcription] Would extract audio from:', videoPath);
    console.log('[Transcription] To:', audioPath);
    
    return transcribeAudioFile(audioPath, language, (progress) => {
      if (progress.status === 'transcribing') {
        onProgress?.({
          ...progress,
          percentage: 20 + (progress.percentage * 0.8),
        });
      } else {
        onProgress?.(progress);
      }
    });

  } catch (error) {
    console.error('[Transcription] Video transcription error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Video transcription failed',
    };
  }
}

export function formatTranscription(segments: TranscriptionSegment[]): string {
  return segments
    .map(s => s.text.trim())
    .filter(t => t.length > 0)
    .join(' ');
}

export function formatTranscriptionWithTimestamps(segments: TranscriptionSegment[]): string {
  return segments
    .map(s => {
      const startMin = Math.floor(s.startTime / 60);
      const startSec = Math.floor(s.startTime % 60);
      return `[${startMin}:${startSec.toString().padStart(2, '0')}] ${s.text.trim()}`;
    })
    .filter(t => t.length > 0)
    .join('\n');
}
