/**
 * Tela de Importação de Vídeos da Galeria
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { RootStackParamList, UploadProgress } from '../types';

type ImportScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Import'>;
};

interface SelectedVideo {
  id: string;
  uri: string;
  fileName: string;
  fileSize: number;
  duration?: number;
  thumbnail?: string;
}

export default function ImportScreen({ navigation }: ImportScreenProps) {
  const [selectedVideos, setSelectedVideos] = useState<SelectedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    percent: number;
  } | null>(null);

  const selectVideos = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const result = await launchImageLibrary({
        mediaType: 'video',
        selectionLimit: 20,
        quality: 1,
      });
      
      if (result.didCancel) {
        setIsLoading(false);
        return;
      }
      
      if (result.errorCode) {
        Alert.alert('Erro', result.errorMessage || 'Erro ao acessar galeria');
        setIsLoading(false);
        return;
      }
      
      if (result.assets) {
        const videos: SelectedVideo[] = result.assets.map((asset: Asset, index) => ({
          id: `video-${Date.now()}-${index}`,
          uri: asset.uri || '',
          fileName: asset.fileName || `video-${index}.mp4`,
          fileSize: asset.fileSize || 0,
          duration: asset.duration,
          thumbnail: asset.uri,
        }));
        
        setSelectedVideos(videos);
      }
    } catch (error) {
      console.error('Error selecting videos:', error);
      Alert.alert('Erro', 'Falha ao selecionar vídeos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeVideo = useCallback((id: string) => {
    setSelectedVideos((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const uploadAllVideos = useCallback(async () => {
    if (selectedVideos.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um vídeo');
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: selectedVideos.length, percent: 0 });

    try {
      for (let i = 0; i < selectedVideos.length; i++) {
        const video = selectedVideos[i];
        const percent = Math.round(((i + 1) / selectedVideos.length) * 100);
        
        setUploadProgress({
          current: i + 1,
          total: selectedVideos.length,
          percent,
        });

        // Simular upload (substituir por upload real)
        console.log(`Uploading ${video.fileName}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // TODO: Implementar upload real para v-backend
        // await uploadToBackend(video);
      }

      Alert.alert(
        'Sucesso!',
        `${selectedVideos.length} vídeos enviados para processamento.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Erro', 'Falha ao enviar vídeos');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [selectedVideos, navigation]);

  const renderVideoItem = ({ item }: { item: SelectedVideo }) => (
    <View style={styles.videoItem}>
      <View style={styles.videoThumbnail}>
        {item.thumbnail ? (
          <Image 
            source={{ uri: item.thumbnail }} 
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.thumbnailPlaceholder}>🎬</Text>
        )}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
        </View>
      </View>
      
      <View style={styles.videoInfo}>
        <Text style={styles.videoName} numberOfLines={1}>
          {item.fileName}
        </Text>
        <Text style={styles.videoSize}>
          {formatFileSize(item.fileSize)}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeVideo(item.id)}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const totalSize = selectedVideos.reduce((acc, v) => acc + v.fileSize, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Importar Vídeos</Text>
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {selectedVideos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={styles.emptyTitle}>Nenhum vídeo selecionado</Text>
            <Text style={styles.emptySubtitle}>
              Selecione vídeos da sua galeria para enviar
            </Text>
            
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={selectVideos}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.selectButtonText}>Selecionar Vídeos</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Lista de vídeos */}
            <FlatList
              data={selectedVideos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item.id}
              style={styles.videoList}
              contentContainerStyle={styles.videoListContent}
            />

            {/* Footer com resumo e ações */}
            <View style={styles.footer}>
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
                  <Text style={styles.progressText}>
                    Enviando {uploadProgress.current} de {uploadProgress.total}...
                  </Text>
                </View>
              )}

              <View style={styles.summary}>
                <Text style={styles.summaryText}>
                  {selectedVideos.length} vídeos • {formatFileSize(totalSize)}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.addMoreButton}
                  onPress={selectVideos}
                  disabled={isUploading}
                >
                  <Text style={styles.addMoreButtonText}>+ Adicionar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
                  onPress={uploadAllVideos}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.uploadButtonText}>
                      ☁️ Enviar Todos
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
  },
  selectButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  videoList: {
    flex: 1,
  },
  videoListContent: {
    padding: 16,
    gap: 12,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  videoThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    fontSize: 24,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  videoInfo: {
    flex: 1,
  },
  videoName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  videoSize: {
    fontSize: 12,
    color: '#888',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,59,48,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 14,
    color: '#ff3b30',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
    backgroundColor: '#0a0a0a',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4a9eff',
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  summary: {
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  addMoreButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#222',
    alignItems: 'center',
  },
  addMoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  uploadButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4a9eff',
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
