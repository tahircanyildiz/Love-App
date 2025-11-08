const axios = require('axios');

// OneSignal Credentials (.env dosyasından)
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;

/**
 * OneSignal'a bildirim gönder
 * @param {Array<string>} playerIds - Hedef player_id'ler
 * @param {Object} notification - Bildirim içeriği
 * @returns {Promise<Object>}
 */
async function sendNotificationToPlayers(playerIds, notification) {
  try {
    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: ONESIGNAL_APP_ID,
        include_player_ids: playerIds,
        headings: { en: notification.title },
        contents: { en: notification.body },
        data: notification.data || {},
        // Uygulama kapalıyken de bildirim göster
        content_available: true,
        priority: 10,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
        },
      }
    );

    return {
      success: true,
      recipients: response.data.recipients,
      id: response.data.id,
    };
  } catch (error) {
    console.error('OneSignal bildirim hatası:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
}

/**
 * Belirli bir cihaz dışındaki tüm cihazlara bildirim gönder
 * @param {string} senderPlayerId - Gönderen cihazın player_id'si (bu cihaza gönderilmeyecek)
 * @param {Object} notification - Bildirim içeriği
 * @param {string} senderName - Gönderenin adı (Tahir, Özge vs.)
 * @returns {Promise<Object>}
 */
async function notifyOtherDevices(senderPlayerId, notification, senderName = null) {
  try {
    const Device = require('../models/Device');

    // Gönderenin adını al (eğer verilmediyse)
    if (!senderName && senderPlayerId) {
      const sender = await Device.findOne({ playerId: senderPlayerId });
      senderName = sender?.userName || 'Birisi';
    }

    // Gönderen dışındaki tüm aktif cihazları bul
    const devices = await Device.find({
      isActive: true,
      playerId: { $ne: senderPlayerId }, // Göndereni hariç tut
    });

    if (devices.length === 0) {
      return {
        success: true,
        sent: 0,
        message: 'Bildirim gönderilecek başka cihaz yok',
      };
    }

    // Bildirimin başlığına gönderen adını ekle
    const modifiedNotification = {
      ...notification,
      title: notification.title.replace('Yeni', `💕 ${senderName}`),
    };

    // Tüm player_id'leri topla
    const playerIds = devices.map((d) => d.playerId);

    // OneSignal'a gönder
    const result = await sendNotificationToPlayers(playerIds, modifiedNotification);

    return {
      success: result.success,
      sent: result.recipients || 0,
      senderName,
      oneSignalId: result.id,
    };
  } catch (error) {
    console.error('notifyOtherDevices hatası:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  sendNotificationToPlayers,
  notifyOtherDevices,
};
