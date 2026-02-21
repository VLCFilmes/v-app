/**
 * vinicius.ai - App Mobile
 * 
 * Estúdio de gravação com teleprompter e câmera
 * 
 * @author vinicius.ai
 * @version 1.0.0
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  SplashScreen,
  LoginScreen,
  ChatScreen,
  HomeScreen,
  CameraScreen,
  TeleprompterScreen,
  PreviewScreen,
  ImportScreen,
  SettingsScreen,
} from './src/screens';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: '#0a0a0a' },
            }}
          >
            <Stack.Screen 
              name="Splash" 
              component={SplashScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen 
              name="Camera" 
              component={CameraScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen 
              name="Teleprompter" 
              component={TeleprompterScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen 
              name="Preview" 
              component={PreviewScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen 
              name="Import" 
              component={ImportScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
