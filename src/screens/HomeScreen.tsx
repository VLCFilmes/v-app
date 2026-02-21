/**
 * Tela inicial do v-app
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.logo}>vinicius.ai</Text>
        <Text style={styles.subtitle}>Estúdio de Gravação</Text>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => navigation.navigate('Camera', {})}
        >
          <Text style={styles.mainButtonIcon}>🎬</Text>
          <Text style={styles.mainButtonText}>Gravar Vídeo</Text>
          <Text style={styles.mainButtonSubtext}>Câmera livre</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.mainButton, styles.teleprompterButton]}
          onPress={() => navigation.navigate('Teleprompter', { scriptId: 'demo' })}
        >
          <Text style={styles.mainButtonIcon}>📝</Text>
          <Text style={styles.mainButtonText}>Teleprompter</Text>
          <Text style={styles.mainButtonSubtext}>Gravar com roteiro</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.mainButton, styles.importButton]}
          onPress={() => navigation.navigate('Import')}
        >
          <Text style={styles.mainButtonIcon}>📁</Text>
          <Text style={styles.mainButtonText}>Importar da Galeria</Text>
          <Text style={styles.mainButtonSubtext}>Enviar vídeos existentes</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.footerButtonText}>⚙️ Configurações</Text>
        </TouchableOpacity>
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
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 20,
  },
  mainButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  teleprompterButton: {
    borderColor: '#4a9eff',
  },
  importButton: {
    borderColor: '#34c759',
  },
  mainButtonIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  mainButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  mainButtonSubtext: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  footerButtonText: {
    fontSize: 16,
    color: '#888888',
  },
});
