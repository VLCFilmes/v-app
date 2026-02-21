/**
 * Tela de Configurações
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAppStore } from '../store';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { 
    cameraSettings, 
    teleprompterSettings,
    setCameraSettings,
    setTeleprompterSettings,
  } = useAppStore();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={styles.backButton} />
      </View>
      
      <ScrollView style={styles.content}>
        {/* Seção: Câmera */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Câmera</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Qualidade</Text>
            <View style={styles.segmentedControl}>
              {(['720p', '1080p', '4k'] as const).map((quality) => (
                <TouchableOpacity
                  key={quality}
                  style={[
                    styles.segmentedButton,
                    cameraSettings.quality === quality && styles.segmentedButtonActive,
                  ]}
                  onPress={() => setCameraSettings({ quality })}
                >
                  <Text style={[
                    styles.segmentedButtonText,
                    cameraSettings.quality === quality && styles.segmentedButtonTextActive,
                  ]}>
                    {quality}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>FPS</Text>
            <View style={styles.segmentedControl}>
              {([30, 60] as const).map((fps) => (
                <TouchableOpacity
                  key={fps}
                  style={[
                    styles.segmentedButton,
                    cameraSettings.fps === fps && styles.segmentedButtonActive,
                  ]}
                  onPress={() => setCameraSettings({ fps })}
                >
                  <Text style={[
                    styles.segmentedButtonText,
                    cameraSettings.fps === fps && styles.segmentedButtonTextActive,
                  ]}>
                    {fps}fps
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingLabel}>Salvar na Galeria</Text>
              <Text style={styles.settingHint}>Cópia dos vídeos gravados</Text>
            </View>
            <Switch
              value={cameraSettings.saveToGallery}
              onValueChange={(value) => setCameraSettings({ saveToGallery: value })}
              trackColor={{ false: '#333', true: '#34c759' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>
        
        {/* Seção: Teleprompter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teleprompter</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Tamanho da fonte</Text>
            <Text style={styles.settingValue}>{teleprompterSettings.fontSize}px</Text>
          </View>
          
          <View style={styles.slider}>
            {[24, 32, 40, 48, 56].map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sliderDot,
                  teleprompterSettings.fontSize === size && styles.sliderDotActive,
                ]}
                onPress={() => setTeleprompterSettings({ fontSize: size })}
              />
            ))}
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Espelhar texto</Text>
            <Switch
              value={teleprompterSettings.mirrored}
              onValueChange={(value) => setTeleprompterSettings({ mirrored: value })}
              trackColor={{ false: '#333', true: '#4a9eff' }}
              thumbColor="#ffffff"
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Opacidade do fundo</Text>
            <Text style={styles.settingValue}>
              {Math.round(teleprompterSettings.backgroundOpacity * 100)}%
            </Text>
          </View>
          
          <View style={styles.slider}>
            {[0.3, 0.5, 0.7, 0.9].map((opacity) => (
              <TouchableOpacity
                key={opacity}
                style={[
                  styles.sliderDot,
                  teleprompterSettings.backgroundOpacity === opacity && styles.sliderDotActive,
                ]}
                onPress={() => setTeleprompterSettings({ backgroundOpacity: opacity })}
              />
            ))}
          </View>
        </View>
        
        {/* Seção: Conta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>Fazer login</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>Termos de uso</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>Política de privacidade</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
        </View>
        
        {/* Versão */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>vinicius.ai v1.0.0 (beta)</Text>
        </View>
      </ScrollView>
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
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  settingValue: {
    fontSize: 16,
    color: '#888',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 2,
  },
  segmentedButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  segmentedButtonActive: {
    backgroundColor: '#4a9eff',
  },
  segmentedButtonText: {
    fontSize: 14,
    color: '#888',
  },
  segmentedButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  slider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sliderDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
  },
  sliderDotActive: {
    backgroundColor: '#4a9eff',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 16,
    color: '#4a9eff',
  },
  linkArrow: {
    fontSize: 18,
    color: '#4a9eff',
  },
  versionContainer: {
    padding: 24,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#666',
  },
});
