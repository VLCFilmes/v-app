/**
 * Tela de câmera do v-app
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { 
  Camera, 
  useCameraDevice, 
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { RootStackParamList } from '../types';
import { useAppStore } from '../store';

type CameraScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Camera'>;
  route: RouteProp<RootStackParamList, 'Camera'>;
};

export default function CameraScreen({ navigation }: CameraScreenProps) {
  const cameraRef = useRef<Camera>(null);
  const { cameraSettings, recording, setRecording, resetRecording } = useAppStore();
  
  // Permissões
  const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } = useCameraPermission();
  const { hasPermission: hasMicPermission, requestPermission: requestMicPermission } = useMicrophonePermission();
  
  // Dispositivo de câmera
  const device = useCameraDevice(cameraSettings.position);
  
  // Timer de gravação
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Solicitar permissões
  useEffect(() => {
    (async () => {
      if (!hasCameraPermission) {
        await requestCameraPermission();
      }
      if (!hasMicPermission) {
        await requestMicPermission();
      }
    })();
  }, [hasCameraPermission, hasMicPermission, requestCameraPermission, requestMicPermission]);
  
  // Timer
  useEffect(() => {
    if (recording.isRecording && !recording.isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recording.isRecording, recording.isPaused]);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const startRecording = useCallback(async () => {
    if (!cameraRef.current) return;
    
    try {
      setRecording({ isRecording: true, isPaused: false });
      setRecordingTime(0);
      
      cameraRef.current.startRecording({
        onRecordingFinished: async (video) => {
          console.log('Recording finished:', video.path);
          
          // Salvar na galeria se configuração estiver ativa
          if (cameraSettings.saveToGallery) {
            try {
              await CameraRoll.saveAsset(video.path, { type: 'video' });
              console.log('Video saved to gallery');
            } catch (saveError) {
              console.warn('Failed to save to gallery:', saveError);
            }
          }
          
          setRecording({ isRecording: false, videoUri: video.path });
          navigation.navigate('Preview', { videoUri: video.path });
        },
        onRecordingError: (error) => {
          console.error('Recording error:', error);
          Alert.alert('Erro', 'Falha ao gravar vídeo');
          resetRecording();
        },
      });
    } catch (error) {
      console.error('Start recording error:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação');
      resetRecording();
    }
  }, [navigation, resetRecording, setRecording]);
  
  const stopRecording = useCallback(async () => {
    if (!cameraRef.current) return;
    
    try {
      await cameraRef.current.stopRecording();
    } catch (error) {
      console.error('Stop recording error:', error);
    }
  }, []);
  
  const toggleRecording = useCallback(() => {
    if (recording.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [recording.isRecording, startRecording, stopRecording]);
  
  // Verificar permissões e dispositivo
  if (!hasCameraPermission || !hasMicPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Precisamos de acesso à câmera e microfone
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={async () => {
              await requestCameraPermission();
              await requestMicPermission();
            }}
          >
            <Text style={styles.permissionButtonText}>Permitir Acesso</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Câmera não disponível</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        video={true}
        audio={true}
      />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        
        {recording.isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
          </View>
        )}
      </SafeAreaView>
      
      {/* Footer com controles */}
      <SafeAreaView style={styles.footer}>
        <View style={styles.controls}>
          {/* Flip camera */}
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => {
              const newPosition = cameraSettings.position === 'front' ? 'back' : 'front';
              useAppStore.getState().setCameraSettings({ position: newPosition });
            }}
          >
            <Text style={styles.controlButtonText}>🔄</Text>
          </TouchableOpacity>
          
          {/* Record button */}
          <TouchableOpacity 
            style={[
              styles.recordButton,
              recording.isRecording && styles.recordButtonActive,
            ]}
            onPress={toggleRecording}
          >
            <View style={[
              styles.recordButtonInner,
              recording.isRecording && styles.recordButtonInnerActive,
            ]} />
          </TouchableOpacity>
          
          {/* Settings */}
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#ffffff',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff0000',
    marginRight: 8,
  },
  recordingTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 24,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  recordButtonActive: {
    backgroundColor: 'rgba(255,0,0,0.3)',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff0000',
  },
  recordButtonInnerActive: {
    borderRadius: 8,
    width: 32,
    height: 32,
  },
});
