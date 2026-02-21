/**
 * Utilitários para comunicação WebView ↔ App
 * 
 * Este arquivo documenta a API de comunicação.
 * O código real de integração fica no v-frontend.
 */

// Mensagens que o WebView pode enviar para o App
export type WebViewToAppMessage = 
  | { action: 'openCamera'; data?: { scriptId?: string } }
  | { action: 'openTeleprompter'; data: { scriptId: string; scriptText?: string } }
  | { action: 'openGallery'; data?: {} }
  | { action: 'openCameraStudio'; data?: { scriptId?: string } }
  | { action: 'openSettings'; data?: {} }
  | { action: 'bridgeReady'; data: { platform: 'ios' | 'android' } };

// Mensagens que o App pode enviar para o WebView
export type AppToWebViewMessage =
  | { action: 'videoRecorded'; data: { videoUri: string; duration?: number } }
  | { action: 'videosImported'; data: { videos: Array<{ uri: string; fileName: string }> } }
  | { action: 'uploadComplete'; data: { assetId: string } }
  | { action: 'uploadError'; data: { error: string } };

/**
 * Código a ser adicionado no v-frontend para detectar o app:
 * 
 * ```typescript
 * // lib/viniciusApp.ts
 * 
 * export function isRunningInApp(): boolean {
 *   return typeof window !== 'undefined' && (window as any).isViniciusApp === true;
 * }
 * 
 * export function getAppPlatform(): 'ios' | 'android' | null {
 *   if (!isRunningInApp()) return null;
 *   return (window as any).viniciusAppPlatform || null;
 * }
 * 
 * export function openNativeCamera(options?: { scriptId?: string }) {
 *   if ((window as any).openNativeCamera) {
 *     (window as any).openNativeCamera(options);
 *   }
 * }
 * 
 * export function openNativeTeleprompter(scriptId: string, scriptText?: string) {
 *   if ((window as any).openNativeTeleprompter) {
 *     (window as any).openNativeTeleprompter(scriptId, scriptText);
 *   }
 * }
 * 
 * export function openNativeGallery() {
 *   if ((window as any).openNativeGallery) {
 *     (window as any).openNativeGallery();
 *   }
 * }
 * 
 * // Listener para mensagens do app
 * export function onAppMessage(callback: (message: AppToWebViewMessage) => void) {
 *   window.addEventListener('viniciusAppMessage', (event: any) => {
 *     callback(event.detail);
 *   });
 * }
 * ```
 */

export const BRIDGE_DOCUMENTATION = `
================================================================================
INTEGRAÇÃO v-frontend ↔ v-app
================================================================================

1. DETECTAR SE ESTÁ NO APP:
   
   if (window.isViniciusApp) {
     // Está rodando no app
   }

2. ABRIR CÂMERA NATIVA:
   
   window.openNativeCamera({ scriptId: '123' });

3. ABRIR TELEPROMPTER NATIVO:
   
   window.openNativeTeleprompter('scriptId', 'Texto do roteiro...');

4. ABRIR GALERIA PARA IMPORTAR:
   
   window.openNativeGallery();

5. RECEBER MENSAGENS DO APP:
   
   window.addEventListener('viniciusAppMessage', (event) => {
     const { action, data } = event.detail;
     if (action === 'videoRecorded') {
       // Vídeo gravado: data.videoUri
     }
   });

================================================================================
`;
