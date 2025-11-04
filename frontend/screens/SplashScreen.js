import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import api from '../config/api';

export default function SplashScreen({ onReady }) {
  const [status, setStatus] = useState('Bağlanıyor...');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in animasyonu
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    checkConnection();
  }, []);

  const checkConnection = async () => {
    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        setStatus(
          attempts === 1
            ? 'Sunucuya bağlanılıyor...'
            : `Tekrar deneniyor... (${attempts}/${maxAttempts})`
        );

        // Health check
        await api.get('/notes', { timeout: 30000 });

        // Başarılı - küçük bir gecikme ekle ki kullanıcı mesajı görsün
        const elapsed = Date.now() - startTime;
        if (elapsed < 1500) {
          await new Promise((resolve) => setTimeout(resolve, 1500 - elapsed));
        }

        setStatus('Bağlantı başarılı!');

        // Fade out ve ana ekrana geç
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => onReady(), 100);
        });

        return;
      } catch (error) {
        console.log(`Bağlantı denemesi ${attempts} başarısız:`, error.message);

        if (attempts < maxAttempts) {
          // Bir sonraki deneme öncesi bekle
          setStatus('Sunucu uyanıyor, lütfen bekleyin...');
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } else {
          // Son deneme de başarısız - yine de devam et
          setStatus('Bağlantı kurulamadı, yine de devam ediliyor...');
          await new Promise((resolve) => setTimeout(resolve, 2000));

          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setTimeout(() => onReady(), 100);
          });
        }
      }
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>💞</Text>
        <Text style={styles.title}>Love App</Text>
        <ActivityIndicator
          size="large"
          color="#FF1493"
          style={styles.loader}
        />
        <Text style={styles.status}>{status}</Text>
        <Text style={styles.hint}>
          {status.includes('uyanıyor')
            ? 'Render sunucusu ilk açılışta biraz zaman alabilir'
            : ''}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF1493',
    marginBottom: 40,
  },
  loader: {
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
    paddingHorizontal: 30,
  },
});
