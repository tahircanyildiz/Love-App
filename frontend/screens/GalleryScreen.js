// Anı Galerisi Ekranı (Tarih, Not ve Modal ile)
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
  Modal,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import api from '../config/api';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

export default function GalleryScreen() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Upload form states
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [photoNote, setPhotoNote] = useState('');
  const [photoDate, setPhotoDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  // Fotoğraf seç
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImageUri(result.assets[0].uri);
        setPhotoNote('');
        setPhotoDate(null);
        setShowUploadModal(true);
      }
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf seçilemedi');
      console.error(error);
    }
  };

  // Fotoğrafı yükle
  const uploadImage = async () => {
    if (!selectedImageUri) return;

    setUploading(true);
    setShowUploadModal(false);

    try {
      // FormData oluştur
      const formData = new FormData();
      const filename = selectedImageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: selectedImageUri,
        name: filename,
        type,
      });

      if (photoNote) {
        formData.append('note', photoNote);
      }
      if (photoDate) {
        formData.append('date', photoDate.toISOString());
      }

      // API'ye gönder
      const response = await api.post('/gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Fotoğrafları yeniden getir (sıralama için)
      await fetchPhotos();
      Alert.alert('Başarılı', 'Fotoğraf yüklendi 🎉');

      // Formu temizle
      setSelectedImageUri(null);
      setPhotoNote('');
      setPhotoDate(null);
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf yüklenemedi');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // Fotoğraf detayını göster
  const viewPhotoDetail = (photo) => {
    setSelectedPhoto(photo);
    setShowDetailModal(true);
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
            setShowDetailModal(false);
            Alert.alert('Başarılı', 'Fotoğraf silindi');
          } catch (error) {
            Alert.alert('Hata', 'Fotoğraf silinemedi');
            console.error(error);
          }
        },
      },
    ]);
  };

  // Tarih seç
  const onDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setPhotoDate(date);
    }
  };

  const renderPhoto = ({ item }) => (
    <TouchableOpacity
      style={styles.photoContainer}
      onPress={() => viewPhotoDetail(item)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.photo} />
      {item.date && (
        <View style={styles.dateTag}>
          <Text style={styles.dateTagText}>
            {dayjs(item.date).format('DD/MM/YY')}
          </Text>
        </View>
      )}
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
          💡 Fotoğrafı görüntülemek için üzerine tıklayın
        </Text>
      </View>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.uploadModalContent}>
            <Text style={styles.modalTitle}>Fotoğraf Yükle</Text>

            {selectedImageUri && (
              <Image
                source={{ uri: selectedImageUri }}
                style={styles.previewImage}
              />
            )}

            <TextInput
              style={styles.noteInput}
              placeholder="Not ekle (opsiyonel)"
              value={photoNote}
              onChangeText={setPhotoNote}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#8B4789" />
              <Text style={styles.dateButtonText}>
                {photoDate
                  ? dayjs(photoDate).format('DD MMMM YYYY')
                  : 'Tarih seç (opsiyonel)'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={photoDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}

            <View style={styles.uploadModalButtons}>
              <TouchableOpacity
                style={[styles.uploadModalButton, styles.cancelButton]}
                onPress={() => {
                  setShowUploadModal(false);
                  setSelectedImageUri(null);
                  setPhotoNote('');
                  setPhotoDate(null);
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadModalButton, styles.uploadConfirmButton]}
                onPress={uploadImage}
              >
                <Text style={styles.uploadConfirmButtonText}>Yükle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.detailModalOverlay}>
          <View style={styles.detailModalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetailModal(false)}
            >
              <Ionicons name="close" size={30} color="#FFF" />
            </TouchableOpacity>

            {selectedPhoto && (
              <ScrollView contentContainerStyle={styles.detailScrollContent}>
                <Image
                  source={{ uri: selectedPhoto.imageUrl }}
                  style={styles.detailImage}
                  resizeMode="contain"
                />

                {selectedPhoto.date && (
                  <View style={styles.detailDateContainer}>
                    <Ionicons name="calendar" size={20} color="#8B4789" />
                    <Text style={styles.detailDate}>
                      {dayjs(selectedPhoto.date).format('DD MMMM YYYY')}
                    </Text>
                  </View>
                )}

                {selectedPhoto.note && (
                  <View style={styles.detailNoteContainer}>
                    <Text style={styles.detailNote}>{selectedPhoto.note}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deletePhoto(selectedPhoto._id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FFF" />
                  <Text style={styles.deleteButtonText}>Fotoğrafı Sil</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    position: 'relative',
  },
  photo: {
    flex: 1,
    borderRadius: 5,
  },
  dateTag: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },
  dateTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
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
  // Upload Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadModalContent: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 20,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  uploadModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uploadModalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadConfirmButton: {
    backgroundColor: '#8B4789',
  },
  uploadConfirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Detail Modal Styles
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
  },
  detailModalContent: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  detailScrollContent: {
    padding: 20,
    paddingTop: 100,
    alignItems: 'center',
  },
  detailImage: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    marginBottom: 20,
  },
  detailDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 15,
  },
  detailDate: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    fontWeight: '600',
  },
  detailNoteContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    marginBottom: 20,
  },
  detailNote: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
