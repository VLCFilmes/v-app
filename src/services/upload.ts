/**
 * Serviço de Upload com Chunks Paralelos
 * 
 * Implementa upload de vídeos em chunks de 5MB com 3 uploads paralelos.
 * Muito mais rápido que upload sequencial, especialmente em conexões 4G/5G.
 */

import RNFS from 'react-native-fs';
import { CONFIG } from '../config';

export interface UploadProgress {
  totalBytes: number;
  uploadedBytes: number;
  percentage: number;
  currentChunk: number;
  totalChunks: number;
  status: 'preparing' | 'uploading' | 'finalizing' | 'completed' | 'error';
}

export interface UploadResult {
  success: boolean;
  url?: string;
  assetId?: string;
  error?: string;
}

interface ChunkInfo {
  index: number;
  start: number;
  end: number;
  size: number;
}

const CHUNK_SIZE = CONFIG.CHUNK_SIZE; // 5MB
const PARALLEL_UPLOADS = 3;

export async function uploadVideoWithChunks(
  videoPath: string,
  projectId: string,
  accessToken: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  try {
    onProgress?.({
      totalBytes: 0,
      uploadedBytes: 0,
      percentage: 0,
      currentChunk: 0,
      totalChunks: 0,
      status: 'preparing',
    });

    const fileStat = await RNFS.stat(videoPath);
    const fileSize = fileStat.size;
    const fileName = videoPath.split('/').pop() || 'video.mp4';
    
    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
    const chunks: ChunkInfo[] = [];
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, fileSize);
      chunks.push({
        index: i,
        start,
        end,
        size: end - start,
      });
    }

    console.log(`[Upload] Starting chunked upload: ${fileName}, ${fileSize} bytes, ${totalChunks} chunks`);

    const initResponse = await fetch(`${CONFIG.API_BASE_URL}/upload/init-chunked`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        projectId,
        fileName,
        fileSize,
        totalChunks,
        contentType: 'video/mp4',
      }),
    });

    if (!initResponse.ok) {
      const error = await initResponse.text();
      throw new Error(`Failed to init upload: ${error}`);
    }

    const { uploadId, uploadUrls } = await initResponse.json();
    console.log(`[Upload] Got uploadId: ${uploadId}, ${uploadUrls.length} presigned URLs`);

    let uploadedChunks = 0;
    let uploadedBytes = 0;
    const etags: { partNumber: number; etag: string }[] = [];

    const uploadChunk = async (chunk: ChunkInfo): Promise<void> => {
      const chunkData = await RNFS.read(videoPath, chunk.size, chunk.start, 'base64');
      
      const response = await fetch(uploadUrls[chunk.index], {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': String(chunk.size),
        },
        body: Uint8Array.from(atob(chunkData), c => c.charCodeAt(0)),
      });

      if (!response.ok) {
        throw new Error(`Chunk ${chunk.index} upload failed: ${response.status}`);
      }

      const etag = response.headers.get('ETag');
      if (etag) {
        etags.push({ partNumber: chunk.index + 1, etag: etag.replace(/"/g, '') });
      }

      uploadedChunks++;
      uploadedBytes += chunk.size;
      
      onProgress?.({
        totalBytes: fileSize,
        uploadedBytes,
        percentage: Math.round((uploadedBytes / fileSize) * 100),
        currentChunk: uploadedChunks,
        totalChunks,
        status: 'uploading',
      });
    };

    onProgress?.({
      totalBytes: fileSize,
      uploadedBytes: 0,
      percentage: 0,
      currentChunk: 0,
      totalChunks,
      status: 'uploading',
    });

    for (let i = 0; i < chunks.length; i += PARALLEL_UPLOADS) {
      const batch = chunks.slice(i, i + PARALLEL_UPLOADS);
      await Promise.all(batch.map(uploadChunk));
    }

    onProgress?.({
      totalBytes: fileSize,
      uploadedBytes: fileSize,
      percentage: 100,
      currentChunk: totalChunks,
      totalChunks,
      status: 'finalizing',
    });

    etags.sort((a, b) => a.partNumber - b.partNumber);

    const completeResponse = await fetch(`${CONFIG.API_BASE_URL}/upload/complete-chunked`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        uploadId,
        projectId,
        fileName,
        parts: etags,
      }),
    });

    if (!completeResponse.ok) {
      const error = await completeResponse.text();
      throw new Error(`Failed to complete upload: ${error}`);
    }

    const result = await completeResponse.json();
    console.log(`[Upload] Complete! URL: ${result.url}`);

    onProgress?.({
      totalBytes: fileSize,
      uploadedBytes: fileSize,
      percentage: 100,
      currentChunk: totalChunks,
      totalChunks,
      status: 'completed',
    });

    return {
      success: true,
      url: result.url,
      assetId: result.assetId,
    };

  } catch (error) {
    console.error('[Upload] Error:', error);
    onProgress?.({
      totalBytes: 0,
      uploadedBytes: 0,
      percentage: 0,
      currentChunk: 0,
      totalChunks: 0,
      status: 'error',
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

export async function uploadVideoSimple(
  videoPath: string,
  projectId: string,
  accessToken: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  try {
    const fileStat = await RNFS.stat(videoPath);
    const fileName = videoPath.split('/').pop() || 'video.mp4';
    
    onProgress?.({
      totalBytes: fileStat.size,
      uploadedBytes: 0,
      percentage: 0,
      currentChunk: 0,
      totalChunks: 1,
      status: 'uploading',
    });

    const fileBase64 = await RNFS.readFile(videoPath, 'base64');
    
    const formData = new FormData();
    formData.append('file', {
      uri: videoPath,
      type: 'video/mp4',
      name: fileName,
    } as any);
    formData.append('projectId', projectId);

    const response = await fetch(`${CONFIG.API_BASE_URL}/upload/video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${error}`);
    }

    const result = await response.json();

    onProgress?.({
      totalBytes: fileStat.size,
      uploadedBytes: fileStat.size,
      percentage: 100,
      currentChunk: 1,
      totalChunks: 1,
      status: 'completed',
    });

    return {
      success: true,
      url: result.url,
      assetId: result.assetId,
    };

  } catch (error) {
    console.error('[Upload] Simple upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}
