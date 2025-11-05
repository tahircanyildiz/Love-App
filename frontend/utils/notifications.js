// Push notification yardımcı fonksiyonları
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from '../config/api';

// Bildirim davranışını ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Push notification izinlerini al ve token oluştur
 * @returns {Promise<string|null>} Expo push token veya null
 */
export async function registerForPushNotificationsAsync() {
  let token = null;

  try {
    // Device kontrolü
    console.log('Device.isDevice:', Device.isDevice);
    console.log('Platform:', Platform.OS);

    if (!Device.isDevice) {
      const errorMsg = 'Fiziksel cihaz gerekli - emülatörde push notification çalışmaz';
      console.log(errorMsg);
      throw new Error(errorMsg);
    }

    // Mevcut izinleri kontrol et
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('Mevcut izin durumu:', existingStatus);
    let finalStatus = existingStatus;

    // İzin yoksa iste
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('Yeni izin durumu:', finalStatus);
    }

    if (finalStatus !== 'granted') {
      const errorMsg = 'Bildirim izni verilmedi';
      console.log(errorMsg);
      throw new Error(errorMsg);
    }

    // Expo push token al - ProjectId hardcoded (APK'da sorun olmaması için)
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || '8292bdd8-8da6-4156-ac10-1fc5ca01855f';
    console.log('ProjectId:', projectId);

    console.log('Push token alınıyor...');
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    token = tokenData.data;
    console.log('Push token başarıyla alındı:', token);

    // Android için notification channel oluştur
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF1493',
      });
      console.log('Android notification channel oluşturuldu');
    }

    return token;
  } catch (error) {
    console.error('Push notification registration error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Hata mesajını daha açıklayıcı hale getir
    throw error;
  }
}

/**
 * Push token'ı backend'e kaydet
 * @param {string} pushToken - Expo push token
 * @param {string} userName - Kullanıcı adı (zorunlu)
 * @param {string} deviceName - Cihaz adı (opsiyonel)
 */
export async function registerDeviceToken(pushToken, userName, deviceName = null) {
  try {
    if (!pushToken) {
      console.log('Push token yok, backend\'e kaydedilemiyor');
      return { success: false, error: 'No push token' };
    }

    if (!userName) {
      console.log('User name yok, backend\'e kaydedilemiyor');
      return { success: false, error: 'No user name' };
    }

    const response = await api.post('/devices/register', {
      pushToken,
      userName,
      deviceName: deviceName || Device.modelName || 'Unknown Device',
      platform: Platform.OS,
    });

    console.log('Device token backend\'e kaydedildi:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Device token kayıt hatası:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Bildirim gönder (backend üzerinden)
 * @param {string} senderToken - Gönderenin token'ı
 * @param {object} notification - Bildirim içeriği
 */
export async function sendNotification(senderToken, notification) {
  try {
    const response = await api.post('/notes/send-notification', {
      senderToken,
      text: notification.body,
    });

    console.log('Bildirim gönderildi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Bildirim gönderme hatası:', error);
    throw error;
  }
}

/**
 * Bildirim listener'ları kur
 * @param {function} onNotificationReceived - Bildirim geldiğinde çağrılacak fonksiyon
 * @param {function} onNotificationTapped - Bildirime tıklandığında çağrılacak fonksiyon
 * @returns {object} Cleanup fonksiyonları içeren obje
 */
export function setupNotificationListeners(
  onNotificationReceived,
  onNotificationTapped
) {
  // Uygulama açıkken gelen bildirimler
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Bildirim geldi:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    }
  );

  // Bildirime tıklandığında
  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Bildirime tıklandı:', response);
      if (onNotificationTapped) {
        onNotificationTapped(response);
      }
    });

  // Cleanup fonksiyonu
  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}
