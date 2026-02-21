/**
 * Tela de Teleprompter do v-app
 * Câmera com overlay de texto rolando
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
  ScrollView,
  Animated,
  Dimensions,
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

type TeleprompterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Teleprompter'>;
  route: RouteProp<RootStackParamList, 'Teleprompter'>;
};

const DEMO_SCRIPT = `Olá, bem-vindos ao meu canal!

Hoje vamos falar sobre um assunto muito importante que vai mudar a forma como você cria conteúdo.

Antes de começar, não esqueça de se inscrever no canal e ativar o sininho para não perder nenhuma novidade.

Vamos lá!

Primeiro ponto: a consistência é fundamental. Você precisa postar regularmente para construir uma audiência.

Segundo ponto: a qualidade do áudio é mais importante que a qualidade do vídeo. Invista em um bom microfone.

Terceiro ponto: seja autêntico. As pessoas se conectam com pessoas reais, não com personagens perfeitos.

E por último: não desista. Os resultados levam tempo, mas eles vêm para quem persiste.

Muito obrigado por assistir! Até o próximo vídeo!`;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function TeleprompterScreen({ navigation, route }: TeleprompterScreenProps) {
  const cameraRef = useRef<Camera>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const { 
    cameraSettings, 
    teleprompterSettings,
    recording, 
    setRecording, 
    resetRecording,
  } = useAppStore();
  
  // Estado do teleprompter
  const [isScrolling, setIsScrolling] = useState(false);
  const [scriptText, setScriptText] = useState(DEMO_SCRIPT);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentScrollY = useRef(0);
  
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
      if (!hasCameraPermission) await requestCameraPermission();
      if (!hasMicPermission) await requestMicPermission();
    })();
  }, [hasCameraPermission, hasMicPermission, requestCameraPermission, requestMicPermission]);
  
  // Timer de gravação
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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording.isRecording, recording.isPaused]);
  
  // Auto-scroll do teleprompter
  useEffect(() => {
    if (isScrolling) {
      const pixelsPerSecond = 50 * teleprompterSettings.speed;
      const intervalMs = 50;
      const pixelsPerInterval = (pixelsPerSecond * intervalMs) / 1000;
      
      scrollIntervalRef.current = setInterval(() => {
        currentScrollY.current += pixelsPerInterval;
        scrollViewRef.current?.scrollTo({ 
          y: currentScrollY.current, 
          animated: false,
        });
      }, intervalMs);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }
    
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isScrolling, teleprompterSettings.speed]);
  
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
      setIsScrolling(true);
      
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
          setIsScrolling(false);
          navigation.navigate('Preview', { videoUri: video.path });
        },
        onRecordingError: (error) => {
          console.error('Recording error:', error);
          Alert.alert('Erro', 'Falha ao gravar vídeo');
          resetRecording();
          setIsScrolling(false);
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
    setIsScrolling(false);
    
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
  
  const toggleScroll = useCallback(() => {
    setIsScrolling((prev) => !prev);
  }, []);
  
  const resetScroll = useCallback(() => {
    currentScrollY.current = 0;
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);
  
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
      {/* Câmera */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        video={true}
        audio={true}
      />
      
      {/* Overlay do Teleprompter */}
      <View style={styles.teleprompterOverlay}>
        <View style={[
          styles.teleprompterBackground,
          { opacity: teleprompterSettings.backgroundOpacity },
        ]} />
        <ScrollView
          ref={scrollViewRef}
          style={styles.teleprompterScroll}
          contentContainerStyle={styles.teleprompterContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isScrolling}
          onScrollEndDrag={(e) => {
            currentScrollY.current = e.nativeEvent.contentOffset.y;
          }}
        >
          <View style={{ height: SCREEN_HEIGHT * 0.3 }} />
          <Text style={[
            styles.teleprompterText,
            { 
              fontSize: teleprompterSettings.fontSize,
              color: teleprompterSettings.textColor,
              transform: teleprompterSettings.mirrored 
                ? [{ scaleX: -1 }] 
                : [],
            },
          ]}>
            {scriptText}
          </Text>
          <View style={{ height: SCREEN_HEIGHT * 0.5 }} />
        </ScrollView>
        
        {/* Linha de leitura */}
        <View style={styles.readingLine} />
      </View>
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerButtonText}>✕</Text>
        </TouchableOpacity>
        
        {recording.isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={resetScroll}
        >
          <Text style={styles.headerButtonText}>↺</Text>
        </TouchableOpacity>
      </SafeAreaView>
      
      {/* Footer com controles */}
      <SafeAreaView style={styles.footer}>
        <View style={styles.speedControl}>
          <Text style={styles.speedLabel}>Velocidade: {teleprompterSettings.speed.toFixed(1)}x</Text>
          <View style={styles.speedButtons}>
            <TouchableOpacity 
              style={styles.speedButton}
              onPress={() => {
                const newSpeed = Math.max(0.5, teleprompterSettings.speed - 0.1);
                useAppStore.getState().setTeleprompterSettings({ speed: newSpeed });
              }}
            >
              <Text style={styles.speedButtonText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.speedButton}
              onPress={() => {
                const newSpeed = Math.min(3.0, teleprompterSettings.speed + 0.1);
                useAppStore.getState().setTeleprompterSettings({ speed: newSpeed });
              }}
            >
              <Text style={styles.speedButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.controls}>
          {/* Play/Pause scroll */}
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={toggleScroll}
          >
            <Text style={styles.controlButtonText}>
              {isScrolling ? '⏸' : '▶️'}
            </Text>
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
  teleprompterOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  teleprompterBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  teleprompterScroll: {
    flex: 1,
  },
  teleprompterContent: {
    paddingHorizontal: 24,
  },
  teleprompterText: {
    fontWeight: '500',
    lineHeight: 48,
    textAlign: 'center',
  },
  readingLine: {
    position: 'absolute',
    top: '30%',
    left: 24,
    right: 24,
    height: 2,
    backgroundColor: '#ff0000',
    opacity: 0.5,
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
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingTop: 16,
  },
  speedControl: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  speedLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginRight: 16,
  },
  speedButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  speedButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
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
