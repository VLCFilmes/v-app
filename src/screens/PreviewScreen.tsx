/**
 * Tela de Preview do vídeo gravado
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Video from 'react-native-video';
import { RootStackParamList, UploadProgress } from '../types';

type PreviewScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Preview'>;
  route: RouteProp<RootStackParamList, 'Preview'>;
};

export default function PreviewScreen({ navigation, route }: PreviewScreenProps) {
  const { videoUri } = route.params;
  const [isPlaying, setIsPlaying] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleUpload = async () => {
    setIsUploading(true);
    setUploadProgress({
      phase: 'compressing',
      percent: 0,
      message: 'Preparando vídeo...',
    });
    
    try {
      // Simular progresso (substituir por upload real)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress({
          phase: i < 30 ? 'compressing' : i < 90 ? 'uploading' : 'confirming',
          percent: i,
          message: i < 30 
            ? 'Comprimindo vídeo...' 
            : i < 90 
              ? `Enviando... ${i}%` 
              : 'Finalizando...',
        });
      }
      
      setUploadProgress({
        phase: 'done',
        percent: 100,
        message: 'Enviado com sucesso!',
      });
      
      setTimeout(() => {
        Alert.alert(
          'Sucesso!',
          'Vídeo enviado para processamento.',
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
      }, 500);
      
    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar vídeo');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDiscard = () => {
    Alert.alert(
      'Descartar vídeo?',
      'O vídeo será excluído permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Descartar', 
          style: 'destructive',
          onPress: () => navigation.navigate('Home'),
        },
      ]
    );
  };
  
  const handleRetake = () => {
    navigation.goBack();
  };
  
  return (
    <View style={styles.container}>
      {/* Player de vídeo */}
      <Video
        source={{ uri: videoUri }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        repeat={true}
        paused={!isPlaying}
        onError={(e) => console.error('Video error:', e)}
      />
      
      {/* Overlay de controle */}
      <TouchableOpacity 
        style={styles.videoOverlay}
        activeOpacity={1}
        onPress={() => setIsPlaying(!isPlaying)}
      >
        {!isPlaying && (
          <View style={styles.playButton}>
            <Text style={styles.playButtonText}>▶️</Text>
          </View>
        )}
      </TouchableOpacity>
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleDiscard}
        >
          <Text style={styles.headerButtonText}>✕</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Preview</Text>
        
        <View style={styles.headerButton} />
      </SafeAreaView>
      
      {/* Footer */}
      <SafeAreaView style={styles.footer}>
        {uploadProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${uploadProgress.percent}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{uploadProgress.message}</Text>
          </View>
        )}
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleRetake}
            disabled={isUploading}
          >
            <Text style={styles.actionButtonIcon}>🔄</Text>
            <Text style={styles.actionButtonText}>Regravar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.uploadButton]}
            onPress={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.actionButtonIcon}>☁️</Text>
                <Text style={[styles.actionButtonText, styles.uploadButtonText]}>
                  Enviar
                </Text>
              </>
            )}
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
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 32,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingTop: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4a9eff',
  },
  progressText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    gap: 8,
  },
  actionButtonIcon: {
    fontSize: 20,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  uploadButton: {
    backgroundColor: '#4a9eff',
  },
  uploadButtonText: {
    color: '#ffffff',
  },
});
