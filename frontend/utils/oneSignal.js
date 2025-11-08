// OneSignal Utility Functions
import { OneSignal } from 'react-native-onesignal';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import api from '../config/api';

// OneSignal App ID (app.json'dan al)
const ONESIGNAL_APP_ID = Constants.expoConfig?.extra?.oneSignalAppId || '27cfe25a-b361-410e-95b3-54f40cd96206';

/**
 * OneSignal'ı başlat ve player_id al
 * @returns {Promise<string|null>} player_id veya null
 */
export async function initializeOneSignal() {
  try {
    // OneSignal'ı başlat
    OneSignal.initialize(ONESIGNAL_APP_ID);

    // Bildirim izni iste
    const permission = await OneSignal.Notifications.requestPermission(true);

    if (!permission) {
      console.log('Bildirim izni reddedildi');
      return null;
    }

    // Player ID al (biraz beklemek gerekebilir)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const deviceState = await OneSignal.User.pushSubscription.getIdAsync();
    const playerId = deviceState;

    if (!playerId) {
      console.log('Player ID alınamadı');
      return null;
    }

    console.log('OneSignal Player ID:', playerId);
    return playerId;
  } catch (error) {
    console.error('OneSignal başlatma hatası:', error);
    return null;
  }
}

/**
 * Cihazı backend'e kaydet
 * @param {string} playerId - OneSignal player_id
 * @param {string} userName - Kullanıcı adı (Tahir, Özge)
 * @returns {Promise<Object>}
 */
export async function registerDevice(playerId, userName) {
  try {
    if (!playerId || !userName) {
      throw new Error('playerId ve userName gerekli');
    }

    const deviceName = `${Device.brand} ${Device.modelName}` || 'Bilinmeyen Cihaz';
    const platform = Platform.OS;

    const response = await api.post('/devices/register', {
      playerId,
      userName,
      deviceName,
      platform,
    });

    console.log('Cihaz kaydedildi:', response.data);
    return {
      success: true,
      device: response.data.device,
    };
  } catch (error) {
    console.error('Cihaz kayıt hatası:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Bildirim listener'ları kur
 * @param {Function} onNotificationReceived - Bildirim geldiğinde çağrılacak
 * @param {Function} onNotificationOpened - Bildirime tıklandığında çağrılacak
 */
export function setupOneSignalListeners(onNotificationReceived, onNotificationOpened) {
  // Uygulama açıkken bildirim geldiğinde
  OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
    console.log('Bildirim geldi (foreground):', event.notification);
    if (onNotificationReceived) {
      onNotificationReceived(event.notification);
    }
  });

  // Bildirime tıklandığında (uygulama kapalı/arka planda)
  OneSignal.Notifications.addEventListener('click', (event) => {
    console.log('Bildirime tıklandı:', event.notification);
    if (onNotificationOpened) {
      onNotificationOpened(event.notification);
    }
  });
}

/**
 * Mevcut player_id'yi al
 * @returns {Promise<string|null>}
 */
export async function getPlayerId() {
  try {
    const playerId = await OneSignal.User.pushSubscription.getIdAsync();
    return playerId || null;
  } catch (error) {
    console.error('Player ID alınamadı:', error);
    return null;
  }
}
