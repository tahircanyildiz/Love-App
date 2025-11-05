// Ayarlar Ekranı - Debug bilgileri ve isim değiştirme
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerDeviceToken, registerForPushNotificationsAsync } from '../utils/notifications';

export default function SettingsScreen() {
  const [userName, setUserName] = useState('');
  const [newName, setNewName] = useState('');
  const [pushToken, setPushToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    userName: 'Yükleniyor...',
    pushToken: 'Yükleniyor...',
    platform: Platform.OS,
    deviceName: Platform.constants?.Model || 'Unknown',
  });

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      const storedUserName = await AsyncStorage.getItem('userName');
      const storedPushToken = await AsyncStorage.getItem('pushToken');

      setUserName(storedUserName || 'Bulunamadı');
      setPushToken(storedPushToken || 'Bulunamadı');

      setDebugInfo({
        userName: storedUserName || 'Kayıtlı değil',
        pushToken: storedPushToken
          ? `${storedPushToken.substring(0, 30)}...`
          : 'Kayıtlı değil',
        fullToken: storedPushToken || 'Kayıtlı değil',
        platform: Platform.OS,
        deviceName: Platform.constants?.Model || 'Unknown',
      });
    } catch (error) {
      Alert.alert('Hata', 'Bilgiler yüklenemedi: ' + error.message);
    }
  };

  const handleRetryPushToken = async () => {
    Alert.alert(
      'Push Token Yenile',
      'Push notification token\'ı yeniden almayı denemek istiyor musunuz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Yenile',
          onPress: async () => {
            try {
              setLoading(true);

              // Push token al
              let token;
              try {
                token = await registerForPushNotificationsAsync();
              } catch (tokenError) {
                Alert.alert(
                  'Push Token Hatası ❌',
                  'Token alınamadı:\n\n' + tokenError.message + '\n\n' +
                  'Olası çözümler:\n' +
                  '• Bildirim iznini kontrol edin\n' +
                  '• İnternet bağlantınızı kontrol edin\n' +
                  '• Telefonunuzda Google Play Services olduğundan emin olun\n' +
                  '• Uygulamayı kapatıp tekrar açın'
                );
                return;
              }

              if (!token) {
                Alert.alert(
                  'Hata',
                  'Push token alınamadı. Token boş döndü.\n\n' +
                  'Olası nedenler:\n' +
                  '1. Bildirim izni verilmemiş\n' +
                  '2. Fiziksel cihaz değil (emülatör)\n' +
                  '3. İnternet bağlantısı yok\n' +
                  '4. Google Play Services yok'
                );
                return;
              }

              // Token'ı backend'e kaydet
              const storedUserName = await AsyncStorage.getItem('userName');
              if (storedUserName) {
                const result = await registerDeviceToken(token, storedUserName);

                if (result.success) {
                  // Token'ı local storage'a kaydet
                  await AsyncStorage.setItem('pushToken', token);
                  await loadDebugInfo();

                  Alert.alert(
                    'Başarılı! ✅',
                    'Push token başarıyla alındı ve kaydedildi!\n\n' +
                    'Token: ' + token.substring(0, 30) + '...'
                  );
                } else {
                  Alert.alert(
                    'Kısmi Başarı ⚠️',
                    'Token alındı ama backend\'e kaydedilemedi:\n\n' + result.error
                  );
                }
              } else {
                Alert.alert('Hata', 'Kullanıcı adı bulunamadı');
              }
            } catch (error) {
              Alert.alert(
                'Beklenmeyen Hata ❌',
                'Bir hata oluştu:\n\n' +
                error.message + '\n\n' +
                'Hata detayı:\n' +
                (error.stack || 'Stack trace yok')
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleNameChange = async () => {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      Alert.alert('Uyarı', 'Lütfen yeni adınızı girin');
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert('Uyarı', 'İsminiz en az 2 karakter olmalı');
      return;
    }

    Alert.alert(
      'İsim Değiştir',
      `Adınızı "${trimmedName}" olarak değiştirmek istiyor musunuz?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Değiştir',
          onPress: async () => {
            try {
              setLoading(true);

              // AsyncStorage'ı güncelle
              await AsyncStorage.setItem('userName', trimmedName);

              // Backend'i güncelle
              const storedPushToken = await AsyncStorage.getItem('pushToken');
              if (storedPushToken) {
                await registerDeviceToken(storedPushToken, trimmedName);
              }

              setUserName(trimmedName);
              setNewName('');
              await loadDebugInfo();

              Alert.alert('Başarılı', 'Adınız güncellendi!');
            } catch (error) {
              console.error('İsim değiştirme hatası:', error);
              Alert.alert('Hata', 'İsim değiştirilemedi, lütfen tekrar deneyin');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleResetApp = () => {
    Alert.alert(
      'Uyarı',
      'Tüm ayarlar sıfırlanacak ve uygulama yeniden başlatılacak. Emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await AsyncStorage.clear();
              Alert.alert(
                'Başarılı',
                'Tüm ayarlar sıfırlandı. Lütfen uygulamayı yeniden başlatın.'
              );
            } catch (error) {
              console.error('Sıfırlama hatası:', error);
              Alert.alert('Hata', 'Sıfırlama başarısız oldu');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const copyToClipboard = (text, label) => {
    // Kopyalama işlemi için Alert göster (basit çözüm)
    Alert.alert(
      label,
      text,
      [{ text: 'Tamam' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Başlık */}
        <View style={styles.header}>
          <Ionicons name="settings" size={40} color="#FF1493" />
          <Text style={styles.title}>Ayarlar</Text>
        </View>

        {/* Mevcut Kullanıcı Bilgisi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kullanıcı Bilgileri</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color="#666" />
              <Text style={styles.infoLabel}>Adınız:</Text>
              <Text style={styles.infoValue}>{userName}</Text>
            </View>
          </View>
        </View>

        {/* İsim Değiştir */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İsim Değiştir</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="create-outline"
              size={24}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Yeni adınızı girin"
              value={newName}
              onChangeText={setNewName}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={20}
              editable={!loading}
            />
          </View>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleNameChange}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <Text style={styles.buttonText}>İsmi Güncelle</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Debug Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Bilgileri</Text>

          <TouchableOpacity
            style={styles.debugCard}
            onPress={() => copyToClipboard(debugInfo.userName, 'Kullanıcı Adı')}
          >
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Kullanıcı Adı:</Text>
              <Text style={styles.debugValue}>{debugInfo.userName}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.debugCard}
            onPress={() => copyToClipboard(pushToken, 'Push Token')}
          >
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Push Token:</Text>
              <Text style={styles.debugValue} numberOfLines={1}>
                {debugInfo.pushToken}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.debugCard}>
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Platform:</Text>
              <Text style={styles.debugValue}>{debugInfo.platform}</Text>
            </View>
          </View>

          <View style={styles.debugCard}>
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Cihaz:</Text>
              <Text style={styles.debugValue}>{debugInfo.deviceName}</Text>
            </View>
          </View>

          {/* Push Token Durumu */}
          {debugInfo.pushToken === 'Kayıtlı değil' && (
            <View style={styles.warningCard}>
              <Ionicons name="warning" size={24} color="#FF6B6B" />
              <Text style={styles.warningCardText}>
                Push token kayıtlı değil! Bildirimler çalışmayacak.
              </Text>
            </View>
          )}

          {/* Push Token Yenile Butonu */}
          <TouchableOpacity
            style={[styles.button, styles.refreshButton, loading && styles.buttonDisabled]}
            onPress={handleRetryPushToken}
            disabled={loading}
          >
            <Ionicons name="refresh" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Push Token Yenile</Text>
          </TouchableOpacity>
        </View>

        {/* Tehlikeli Alan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tehlikeli Alan</Text>
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleResetApp}
            disabled={loading}
          >
            <Ionicons name="trash" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Tüm Ayarları Sıfırla</Text>
          </TouchableOpacity>
          <Text style={styles.warningText}>
            ⚠️ Bu işlem tüm ayarlarınızı siler ve uygulamayı ilk haline döndürür
          </Text>
        </View>

        {/* Bilgi */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Couple App v1.0.0</Text>
          <Text style={styles.footerText}>💕 Made with love</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF1493',
    marginTop: 10,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FFB6C1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: '#333',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#FF1493',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    gap: 10,
  },
  buttonDisabled: {
    backgroundColor: '#FFB6C1',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debugLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  debugValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  dangerButton: {
    backgroundColor: '#FF4444',
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    marginTop: 15,
  },
  warningText: {
    fontSize: 12,
    color: '#FF4444',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    gap: 10,
  },
  warningCardText: {
    flex: 1,
    fontSize: 14,
    color: '#FF4444',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    marginVertical: 5,
  },
});
