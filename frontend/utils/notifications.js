// Bildirim yönetimi
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Bildirim davranışını ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Bildirim izni iste
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Bildirim izni reddedildi');
    return false;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
}

// Görev için bildirim planla (1 gün öncesi)
export async function scheduleTaskNotification(task) {
  if (!task.date) return null;

  const taskDate = new Date(task.date);
  const now = new Date();

  // 1 gün öncesi hesapla
  const oneDayBefore = new Date(taskDate);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  oneDayBefore.setHours(9, 0, 0, 0); // Sabah 9'da bildirim

  // Eğer bildirim zamanı geçmişse, planla
  if (oneDayBefore <= now) {
    console.log('Bildirim zamanı geçmiş, planlanmadı');
    return null;
  }

  const trigger = oneDayBefore;

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Yarın',
        body: task.title || task.task,
        data: { taskId: task._id },
      },
      trigger,
    });

    console.log(`✅ Bildirim planlandı: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('Bildirim planlama hatası:', error);
    return null;
  }
}

// Bildirimi iptal et
export async function cancelTaskNotification(notificationId) {
  if (!notificationId) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('✅ Bildirim iptal edildi');
  } catch (error) {
    console.error('Bildirim iptal hatası:', error);
  }
}

// Tüm bildirimleri iptal et
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ Tüm bildirimler iptal edildi');
  } catch (error) {
    console.error('Bildirim iptal hatası:', error);
  }
}

// Planlı bildirimleri listele (debug için)
export async function getScheduledNotifications() {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  console.log('Planlı bildirimler:', notifications);
  return notifications;
}
