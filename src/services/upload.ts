/**
 * Upload Service - STUB VERSION
 * 
 * Este arquivo é um stub que será substituído quando as dependências
 * nativas (react-native-fs) estiverem instaladas via CocoaPods.
 * 
 * Por enquanto, uploads são feitos via WebView (web standard).
 */

export interface UploadProgress {
  phase: 'preparing' | 'uploading' | 'processing' | 'complete';
  progress: number;
  bytesUploaded: number;
  totalBytes: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadVideoWithChunks(
  videoPath: string,
  projectId: string,
  accessToken: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  console.warn('[Upload] Stub version - native chunked upload not available');
  console.warn('[Upload] Use WebView for uploads instead');
  
  return {
    success: false,
    error: 'Native upload not available - use WebView',
  };
}

export async function uploadVideoSimple(
  videoPath: string,
  projectId: string,
  accessToken: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  console.warn('[Upload] Stub version - native upload not available');
  
  return {
    success: false,
    error: 'Native upload not available - use WebView',
  };
}
