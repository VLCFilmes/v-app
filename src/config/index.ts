/**
 * Configurações do v-app
 */

export const CONFIG = {
  // API
  API_BASE_URL: __DEV__ 
    ? 'https://api.vinicius.ai' 
    : 'https://api.vinicius.ai',
  
  // Supabase
  SUPABASE_URL: 'https://supabase-api.vinicius.ai',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbmljaXVzbGltYSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzE2ODQwMDAwLCJleHAiOjE5NTY1NzEyMDB9.lDLNx2ejTwBbTmwhgKfJgtLRwYdfks54VUI0sG4vnXE',
  
  // Câmera
  DEFAULT_CAMERA_SETTINGS: {
    position: 'front' as const,
    flash: 'off' as const,
    quality: '1080p' as const,
    fps: 30 as const,
    saveToGallery: true,
  },
  
  // Teleprompter
  DEFAULT_TELEPROMPTER_SETTINGS: {
    speed: 1.0,
    fontSize: 32,
    textColor: '#FFFFFF',
    backgroundColor: '#000000',
    backgroundOpacity: 0.5,
    mirrored: false,
  },
  
  // Gravação
  MAX_RECORDING_DURATION: 30 * 60, // 30 minutos em segundos
  VIDEO_BITRATE: 8_000_000, // 8 Mbps para alta qualidade
  AUDIO_BITRATE: 128_000, // 128 kbps
  
  // Upload
  CHUNK_SIZE: 5 * 1024 * 1024, // 5MB chunks
  MAX_FILE_SIZE: 2 * 1024 * 1024 * 1024, // 2GB
};

export default CONFIG;
