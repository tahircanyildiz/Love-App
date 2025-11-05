// Hoş Geldin Ekranı - İlk açılışta isim girişi
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WelcomeScreen({ onComplete }) {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedName = userName.trim();

    if (!trimmedName) {
      Alert.alert('Uyarı', 'Lütfen adınızı girin');
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert('Uyarı', 'İsminiz en az 2 karakter olmalı');
      return;
    }

    try {
      setLoading(true);

      // İsmi AsyncStorage'a kaydet
      await AsyncStorage.setItem('userName', trimmedName);

      // Ana ekrana geç
      onComplete(trimmedName);
    } catch (error) {
      console.error('İsim kaydetme hatası:', error);
      Alert.alert('Hata', 'İsim kaydedilemedi, lütfen tekrar deneyin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo / Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="heart" size={100} color="#FF1493" />
        </View>

        {/* Başlık */}
        <Text style={styles.title}>Hoş Geldiniz! 💕</Text>
        <Text style={styles.subtitle}>
          Couple App'e hoş geldiniz. Başlamak için lütfen adınızı girin.
        </Text>

        {/* İsim Girişi */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={24}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Adınızı girin (örn: Tahir, Özge)"
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={20}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            editable={!loading}
          />
        </View>

        {/* Devam Butonu */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>Devam Et</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>

        {/* Açıklama */}
        <Text style={styles.hint}>
          Bu isim bildirimlerinizde görünecektir
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF1493',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 25,
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
    fontSize: 18,
    color: '#333',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#FF1493',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  hint: {
    marginTop: 20,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
