/**
 * Tipos TypeScript do v-app
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  token?: string;
}

export interface Script {
  id: string;
  title: string;
  voice: string;
  visuals?: string;
  conversationId?: string;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  videoUri?: string;
}

export interface TeleprompterSettings {
  speed: number; // 0.5 - 3.0
  fontSize: number; // 16 - 72
  textColor: string;
  backgroundColor: string;
  backgroundOpacity: number; // 0 - 1
  mirrored: boolean;
}

export interface CameraSettings {
  position: 'front' | 'back';
  flash: 'on' | 'off' | 'auto';
  quality: '720p' | '1080p' | '4k';
  fps: 30 | 60;
  saveToGallery: boolean;
}

export interface UploadProgress {
  phase: 'compressing' | 'uploading' | 'confirming' | 'done';
  percent: number;
  message: string;
}

export interface VideoSegment {
  uri: string;
  duration: number;
  timestamp: Date;
}

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Chat: undefined;
  Home: undefined;
  Camera: { scriptId?: string };
  Teleprompter: { scriptId: string };
  Preview: { videoUri: string };
  Import: undefined;
  Settings: undefined;
};
