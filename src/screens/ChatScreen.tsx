/**
 * Tela principal do Chat (WebView carregando v-frontend)
 * 
 * O chatbot, editor de roteiros e toda a UI web rodam aqui.
 * Quando o usuário quer usar features nativas (câmera, teleprompter),
 * o WebView envia uma mensagem e abrimos a tela nativa correspondente.
 */

import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
  BackHandler,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Chat'>;
};

// URL do v-frontend (modo app usa subdomínio específico)
const CHAT_URL = __DEV__ 
  ? 'https://apptest.vinicius.ai'
  : 'https://app.vinicius.ai';

// User-Agent identifica o app nativo (ViniciusApp/) + simula Safari iOS
const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 ViniciusApp/1.0';

// JavaScript injetado no WebView para configurar a bridge
const INJECTED_JAVASCRIPT = `
  (function() {
    // Marca que estamos rodando dentro do app
    window.isViniciusApp = true;
    window.viniciusAppVersion = '1.0.0';
    window.viniciusAppPlatform = '${Platform.OS}';
    
    // Função para enviar mensagens para o app
    window.sendToApp = function(action, data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          action: action,
          data: data,
          timestamp: Date.now(),
        }));
      }
    };
    
    // Função para abrir câmera nativa
    window.openNativeCamera = function(options) {
      window.sendToApp('openCamera', options || {});
    };
    
    // Função para abrir teleprompter nativo
    window.openNativeTeleprompter = function(scriptId, scriptText) {
      window.sendToApp('openTeleprompter', { scriptId, scriptText });
    };
    
    // Função para importar vídeos da galeria
    window.openNativeGallery = function() {
      window.sendToApp('openGallery', {});
    };
    
    // Função para gravar com Camera Studio
    window.openNativeCameraStudio = function(options) {
      window.sendToApp('openCameraStudio', options || {});
    };
    
    // Notifica o app que a bridge está pronta
    window.sendToApp('bridgeReady', { platform: '${Platform.OS}' });
    
    // Log para debug
    console.log('[v-app] Bridge initialized. isViniciusApp =', window.isViniciusApp);
    
    true; // Required for injectedJavaScript
  })();
`;

export default function ChatScreen({ navigation }: ChatScreenProps) {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lidar com botão voltar do Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [canGoBack])
  );

  // Processar mensagens do WebView
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('[v-app] Message from WebView:', message);

      switch (message.action) {
        case 'bridgeReady':
          console.log('[v-app] Bridge ready on platform:', message.data?.platform);
          break;

        case 'openCamera':
          navigation.navigate('Camera', { 
            scriptId: message.data?.scriptId,
          });
          break;

        case 'openTeleprompter':
          navigation.navigate('Teleprompter', { 
            scriptId: message.data?.scriptId || 'default',
          });
          break;

        case 'openGallery':
          navigation.navigate('Import');
          break;

        case 'openCameraStudio':
          navigation.navigate('Camera', {
            scriptId: message.data?.scriptId,
          });
          break;

        case 'openSettings':
          navigation.navigate('Settings');
          break;

        default:
          console.log('[v-app] Unknown action:', message.action);
      }
    } catch (e) {
      console.error('[v-app] Failed to parse message:', e);
    }
  }, [navigation]);

  // Enviar mensagem para o WebView
  const sendToWebView = useCallback((action: string, data: any) => {
    const script = `
      window.dispatchEvent(new CustomEvent('viniciusAppMessage', {
        detail: ${JSON.stringify({ action, data })}
      }));
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
  }, []);

  // Quando voltar de uma tela nativa com vídeo gravado
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Se tiver um vídeo gravado, notificar o WebView
      // TODO: Implementar passagem de vídeo de volta
    });

    return unsubscribe;
  }, [navigation]);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('[v-app] WebView error:', nativeEvent);
    console.warn('[v-app] Error details:', JSON.stringify(nativeEvent, null, 2));
    setIsLoading(false);
    setError(`Erro: ${nativeEvent.description || nativeEvent.code || 'Conexão falhou'}`);
  }, []);

  const handleNavigationStateChange = useCallback((navState: any) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  const reload = useCallback(() => {
    setError(null);
    webViewRef.current?.reload();
  }, []);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>📡</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={reload}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
          
          <View style={styles.offlineActions}>
            <Text style={styles.offlineTitle}>Ou use offline:</Text>
            <TouchableOpacity 
              style={styles.offlineButton}
              onPress={() => navigation.navigate('Camera', {})}
            >
              <Text style={styles.offlineButtonText}>🎬 Gravar Vídeo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.offlineButton}
              onPress={() => navigation.navigate('Import')}
            >
              <Text style={styles.offlineButtonText}>📁 Importar da Galeria</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: CHAT_URL }}
        style={styles.webview}
        userAgent={USER_AGENT}
        onMessage={handleMessage}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('[v-app] HTTP error:', nativeEvent.statusCode, nativeEvent.url);
          if (nativeEvent.statusCode >= 400) {
            setError(`Erro HTTP ${nativeEvent.statusCode}`);
          }
        }}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        cacheEnabled={true}
        pullToRefreshEnabled={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4a9eff" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        )}
      />
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4a9eff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 32,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  offlineActions: {
    alignItems: 'center',
  },
  offlineTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  offlineButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  offlineButtonText: {
    fontSize: 16,
    color: '#ffffff',
  },
});
