/**
 * Estado global do app (Zustand)
 */

import { create } from 'zustand';
import { 
  TeleprompterSettings, 
  CameraSettings, 
  RecordingState,
  Script,
  User,
} from '../types';
import { CONFIG } from '../config';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  
  // Scripts
  scripts: Script[];
  currentScript: Script | null;
  setScripts: (scripts: Script[]) => void;
  setCurrentScript: (script: Script | null) => void;
  
  // Camera
  cameraSettings: CameraSettings;
  setCameraSettings: (settings: Partial<CameraSettings>) => void;
  
  // Teleprompter
  teleprompterSettings: TeleprompterSettings;
  setTeleprompterSettings: (settings: Partial<TeleprompterSettings>) => void;
  
  // Recording
  recording: RecordingState;
  setRecording: (state: Partial<RecordingState>) => void;
  resetRecording: () => void;
}

const initialRecordingState: RecordingState = {
  isRecording: false,
  isPaused: false,
  duration: 0,
  videoUri: undefined,
};

export const useAppStore = create<AppState>((set) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  // Scripts
  scripts: [],
  currentScript: null,
  setScripts: (scripts) => set({ scripts }),
  setCurrentScript: (currentScript) => set({ currentScript }),
  
  // Camera
  cameraSettings: CONFIG.DEFAULT_CAMERA_SETTINGS,
  setCameraSettings: (settings) => 
    set((state) => ({ 
      cameraSettings: { ...state.cameraSettings, ...settings } 
    })),
  
  // Teleprompter
  teleprompterSettings: CONFIG.DEFAULT_TELEPROMPTER_SETTINGS,
  setTeleprompterSettings: (settings) => 
    set((state) => ({ 
      teleprompterSettings: { ...state.teleprompterSettings, ...settings } 
    })),
  
  // Recording
  recording: initialRecordingState,
  setRecording: (state) => 
    set((prev) => ({ 
      recording: { ...prev.recording, ...state } 
    })),
  resetRecording: () => set({ recording: initialRecordingState }),
}));
