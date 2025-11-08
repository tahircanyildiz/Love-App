// playerId Helper - AsyncStorage'dan playerId almak için
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage'dan playerId al
 * @returns {Promise<string|null>}
 */
export async function getStoredPlayerId() {
  try {
    const playerId = await AsyncStorage.getItem('playerId');
    return playerId;
  } catch (error) {
    console.error('playerId alınamadı:', error);
    return null;
  }
}

/**
 * playerId'yi AsyncStorage'a kaydet
 * @param {string} playerId
 * @returns {Promise<boolean>}
 */
export async function savePlayerId(playerId) {
  try {
    await AsyncStorage.setItem('playerId', playerId);
    return true;
  } catch (error) {
    console.error('playerId kaydedilemedi:', error);
    return false;
  }
}
