/**
 * Transcription Service - STUB VERSION
 * 
 * Este arquivo é um stub que será implementado quando a integração
 * com Apple Speech Recognition estiver pronta.
 * 
 * Por enquanto, transcrição é feita no backend (Whisper).
 */

export interface TranscriptionProgress {
  phase: 'preparing' | 'transcribing' | 'processing' | 'complete';
  progress: number;
}

export interface TranscriptionResult {
  success: boolean;
  text?: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  error?: string;
}

export async function transcribeAudioFile(
  audioPath: string,
  language: string = 'pt-BR',
  onProgress?: (progress: TranscriptionProgress) => void,
): Promise<TranscriptionResult> {
  console.warn('[Transcription] Stub version - local transcription not available');
  console.warn('[Transcription] Use backend Whisper API instead');
  
  return {
    success: false,
    error: 'Local transcription not available - use backend API',
  };
}

export async function transcribeVideoFile(
  videoPath: string,
  language: string = 'pt-BR',
  onProgress?: (progress: TranscriptionProgress) => void,
): Promise<TranscriptionResult> {
  console.warn('[Transcription] Stub version - local transcription not available');
  
  return {
    success: false,
    error: 'Local transcription not available - use backend API',
  };
}
