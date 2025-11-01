// Anı Galerisi Ekranı
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function GalleryScreen() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPhotos();
    requestPermissions();
  }, []);

  // İzinleri al
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf yüklemek için galeri erişimi gerekli');
    }
  };

  // Fotoğrafları getir
  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/gallery');
      setPhotos(response.data);
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraflar yüklenemedi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fotoğraf seç ve yükle
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf seçilemedi');
      console.error(error);
    }
  };

  // Fotoğrafı yükle
  const uploadImage = async (uri) => {
    setUploading(true);
    try {
      // FormData oluştur
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri,
        name: filename,
        type,
      });

      // API'ye gönder
      const response = await api.post('/gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPhotos([response.data, ...photos]);
      Alert.alert('Başarılı', 'Fotoğraf yüklendi 🎉');
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf yüklenemedi');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // Fotoğraf sil
  const deletePhoto = async (id) => {
    Alert.alert('Sil', 'Bu fotoğrafı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/gallery/${id}`);
            setPhotos(photos.filter(photo => photo._id !== id));
            Alert.alert('Başarılı', 'Fotoğraf silindi');
          } catch (error) {
            Alert.alert('Hata', 'Fotoğraf silinemedi');
            console.error(error);
          }
        },
      },
    ]);
  };

  const renderPhoto = ({ item }) => (
    <TouchableOpacity
      style={styles.photoContainer}
      onLongPress={() => deletePhoto(item._id)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.photo} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Anılarımız 📸</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={pickImage}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Ionicons name="camera" size={24} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF69B4" />
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item._id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={60} color="#CCC" />
              <Text style={styles.emptyText}>Henüz fotoğraf yok</Text>
              <Text style={styles.emptySubtext}>
                Yukarıdaki kamera ikonuna tıklayarak{'\n'}
                anılarınızı eklemeye başlayın!
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Fotoğrafı silmek için üzerine uzun basın
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    backgroundColor: '#DDA0DD',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  uploadButton: {
    backgroundColor: '#8B4789',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    padding: 2,
  },
  photoContainer: {
    flex: 1,
    margin: 2,
    aspectRatio: 1,
  },
  photo: {
    flex: 1,
    borderRadius: 5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    color: '#999',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 15,
    backgroundColor: '#F5F5F5',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
