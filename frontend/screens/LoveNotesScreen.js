// Rastgele Sevgi Notu Ekranı
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function LoveNotesScreen() {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRandomNote();
  }, []);

  // Rastgele not getir
  const fetchRandomNote = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notes/random');
      setNote(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        Alert.alert('Bilgi', 'Henüz sevgi notu eklenmemiş 💌');
      } else {
        Alert.alert('Hata', 'Not yüklenemedi');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sevgi Notları 💌</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF69B4" />
        ) : note ? (
          <>
            <View style={styles.noteCard}>
              <Ionicons name="heart" size={40} color="#FF1493" style={styles.heartIcon} />
              <Text style={styles.noteText}>{note.text}</Text>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={fetchRandomNote}
            >
              <Ionicons name="refresh" size={24} color="#FFF" />
              <Text style={styles.buttonText}>Yeni Not Getir</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz not yok 😊</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={fetchRandomNote}
            >
              <Ionicons name="refresh" size={24} color="#FFF" />
              <Text style={styles.buttonText}>Yeniden Dene</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 İpucu: Backend'e sevgi notları ekleyerek{'\n'}
          bu ekranı daha özel hale getirebilirsin!
        </Text>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  header: {
    backgroundColor: '#FFB6C1',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noteCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  heartIcon: {
    marginBottom: 20,
  },
  noteText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    lineHeight: 30,
    fontStyle: 'italic',
  },
  refreshButton: {
    flexDirection: 'row',
    backgroundColor: '#FF69B4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFE5EC',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
