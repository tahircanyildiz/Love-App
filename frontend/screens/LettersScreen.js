// Aşk Mektupları Ekranı (Zaman Kapsülü)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import api from '../config/api';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { getStoredPlayerId } from '../utils/playerIdHelper';

dayjs.locale('tr');

export default function LettersScreen() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);

  // Create form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [openDate, setOpenDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  useEffect(() => {
    fetchLetters();
    requestPermissions();
  }, []);

  // İzinleri al
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf eklemek için galeri erişimi gerekli');
    }
  };

  // Mektupları getir
  const fetchLetters = async () => {
    setLoading(true);
    try {
      const response = await api.get('/letters');
      setLetters(response.data);
    } catch (error) {
      Alert.alert('Hata', 'Mektuplar yüklenemedi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fotoğraf seç
  const pickPhotos = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        // Maksimum 5 fotoğraf
        const newPhotos = result.assets.slice(0, 5 - selectedPhotos.length);
        setSelectedPhotos([...selectedPhotos, ...newPhotos]);
      }
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf seçilemedi');
      console.error(error);
    }
  };

  // Fotoğrafı kaldır
  const removePhoto = (index) => {
    setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index));
  };

  // Yeni mektup oluştur
  const createLetter = async () => {
    if (!title || !message || !openDate) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun');
      return;
    }

    // Geçmiş tarih kontrolü
    if (new Date(openDate) <= new Date()) {
      Alert.alert('Uyarı', 'Açılış tarihi gelecekte olmalıdır');
      return;
    }

    try {
      // FormData oluştur
      const formData = new FormData();
      formData.append('title', title);
      formData.append('message', message);
      formData.append('openDate', openDate.toISOString());

      // Fotoğrafları ekle
      selectedPhotos.forEach((photo, index) => {
        const filename = photo.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('photos', {
          uri: photo.uri,
          name: filename,
          type,
        });
      });

      // Player ID'yi ekle (bildirim için)
      const playerId = await getStoredPlayerId();
      if (playerId) {
        formData.append('senderPlayerId', playerId);
      }

      await api.post('/letters', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Listeyi yeniden fetch et (doğru sırayla gelmesi için)
      await fetchLetters();

      setShowCreateModal(false);
      setTitle('');
      setMessage('');
      setOpenDate(null);
      setSelectedPhotos([]);
      Alert.alert('Başarılı', 'Mektup zaman kapsülüne konuldu! 💌');
    } catch (error) {
      Alert.alert('Hata', 'Mektup oluşturulamadı');
      console.error(error);
    }
  };

  // Mektubu aç
  const openLetter = async (letter) => {
    const now = new Date();
    const letterOpenDate = new Date(letter.openDate);

    // Tarih kontrolü
    if (letterOpenDate > now) {
      const timeLeft = getTimeUntilOpen(letter);
      Alert.alert(
        'Henüz Değil! 🔒',
        `Bu mektup ${dayjs(letterOpenDate).format('DD MMMM YYYY HH:mm')} tarihinde açılabilir.\n\n${timeLeft} kaldı!`
      );
      return;
    }

    // Eğer daha önce açılmamışsa, backend'e bildir
    if (!letter.isOpened) {
      try {
        const response = await api.patch(`/letters/${letter._id}/open`);
        // Listeyi güncelle
        setLetters(
          letters.map((l) => (l._id === letter._id ? response.data : l))
        );
        setSelectedLetter(response.data);
      } catch (error) {
        Alert.alert('Hata', 'Mektup açılamadı');
        console.error(error);
        return;
      }
    } else {
      setSelectedLetter(letter);
    }

    setShowReadModal(true);
  };

  // Mektubu sil
  const deleteLetter = async (id) => {
    Alert.alert(
      'Sil',
      'Bu mektubu silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/letters/${id}`);
              setLetters(letters.filter((letter) => letter._id !== id));
              setShowReadModal(false);
              Alert.alert('Başarılı', 'Mektup silindi');
            } catch (error) {
              Alert.alert('Hata', 'Mektup silinemedi');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  // Tarih seç
  const onDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);

      if (event.type === 'set' && date) {
        setOpenDate(date);
        // Tarih seçildikten sonra saat picker'ı göster
        setTimeout(() => setShowTimePicker(true), 100);
      }
    } else {
      // iOS
      if (date) {
        setOpenDate(date);
      }
    }
  };

  // Saat seç
  const onTimeChange = (event, time) => {
    setShowTimePicker(false);

    if (event.type === 'set' && time && openDate) {
      // Seçilen saati mevcut tarihe ekle
      const newDate = new Date(openDate);
      newDate.setHours(time.getHours());
      newDate.setMinutes(time.getMinutes());
      setOpenDate(newDate);
    }
  };

  // Mektup durumu kontrolü
  const isLetterAvailable = (letter) => {
    return new Date(letter.openDate) <= new Date();
  };

  // Geri sayım hesapla
  const getTimeUntilOpen = (letter) => {
    const now = new Date();
    const openDate = new Date(letter.openDate);
    const diff = openDate - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} gün ${hours} saat`;
    } else if (hours > 0) {
      return `${hours} saat ${minutes} dakika`;
    } else if (minutes > 0) {
      return `${minutes} dakika`;
    } else {
      return 'Birkaç saniye';
    }
  };

  const renderLetter = ({ item }) => {
    const isAvailable = isLetterAvailable(item);
    const timeLeft = getTimeUntilOpen(item);

    return (
      <TouchableOpacity
        style={[
          styles.letterCard,
          item.isOpened && styles.letterCardOpened,
        ]}
        onPress={() => openLetter(item)}
      >
        <View style={styles.letterIcon}>
          <Ionicons
            name={item.isOpened ? 'mail-open' : isAvailable ? 'mail-unread' : 'lock-closed'}
            size={40}
            color={item.isOpened ? '#999' : isAvailable ? '#FF69B4' : '#CCC'}
          />
        </View>

        <View style={styles.letterContent}>
          <Text style={[styles.letterTitle, item.isOpened && styles.letterTitleOpened]}>
            {item.title}
          </Text>
          <Text style={styles.letterDate}>
            {isAvailable
              ? item.isOpened
                ? `Açıldı: ${dayjs(item.openedAt).format('DD MMM YYYY')}`
                : '✨ Açılabilir!'
              : `🔒 ${timeLeft} sonra`}
          </Text>
          <Text style={styles.letterOpenDate}>
            Açılış: {dayjs(item.openDate).format('DD MMMM YYYY HH:mm')}
          </Text>
        </View>

        {item.isOpened && (
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Aşk Mektupları 💌</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF69B4" />
        </View>
      ) : (
        <FlatList
          data={letters}
          renderItem={renderLetter}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="mail-outline" size={60} color="#CCC" />
              <Text style={styles.emptyText}>Henüz mektup yok</Text>
              <Text style={styles.emptySubtext}>
                Geleceğe bir aşk mektubu gönder!{'\n'}
                Belirli bir tarihte açılsın...
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Mektuplar belirlediğiniz tarihte açılabilir hale gelir
        </Text>
      </View>

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createModalContent}>
            <Text style={styles.modalTitle}>Yeni Aşk Mektubu ✍️</Text>

            <TextInput
              style={styles.titleInput}
              placeholder="Başlık"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={styles.messageInput}
              placeholder="Mesajınızı yazın..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#8B4789" />
              <Text style={styles.dateButtonText}>
                {openDate
                  ? `Açılış: ${dayjs(openDate).format('DD MMMM YYYY HH:mm')}`
                  : 'Açılış tarihini seç'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={openDate || new Date()}
                mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
                is24Hour={true}
              />
            )}

            {showTimePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={openDate || new Date()}
                mode="time"
                display="default"
                onChange={onTimeChange}
                is24Hour={true}
              />
            )}

            {/* Fotoğraf Ekleme */}
            <TouchableOpacity
              style={styles.photoButton}
              onPress={pickPhotos}
              disabled={selectedPhotos.length >= 5}
            >
              <Ionicons name="camera-outline" size={20} color="#8B4789" />
              <Text style={styles.photoButtonText}>
                Fotoğraf Ekle ({selectedPhotos.length}/5)
              </Text>
            </TouchableOpacity>

            {selectedPhotos.length > 0 && (
              <ScrollView horizontal style={styles.photoPreviewContainer}>
                {selectedPhotos.map((photo, index) => (
                  <View key={index} style={styles.photoPreview}>
                    <Image source={{ uri: photo.uri }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.createModalButtons}>
              <TouchableOpacity
                style={[styles.createModalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setTitle('');
                  setMessage('');
                  setOpenDate(null);
                  setShowDatePicker(false);
                  setShowTimePicker(false);
                  setSelectedPhotos([]);
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.createModalButton, styles.saveButton]}
                onPress={createLetter}
              >
                <Text style={styles.saveButtonText}>Gönder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Read Modal */}
      <Modal
        visible={showReadModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReadModal(false)}
      >
        <View style={styles.readModalOverlay}>
          <View style={styles.readModalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowReadModal(false)}
            >
              <Ionicons name="close" size={30} color="#333" />
            </TouchableOpacity>

            {selectedLetter && (
              <ScrollView contentContainerStyle={styles.readScrollContent}>
                <View style={styles.envelopeIcon}>
                  <Ionicons name="mail-open" size={60} color="#FF69B4" />
                </View>

                <Text style={styles.readTitle}>{selectedLetter.title}</Text>

                <View style={styles.readDateContainer}>
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text style={styles.readDate}>
                    {dayjs(selectedLetter.openDate).format('DD MMMM YYYY HH:mm')}
                  </Text>
                </View>

                <View style={styles.messageContainer}>
                  <Text style={styles.readMessage}>{selectedLetter.message}</Text>
                </View>

                {/* Fotoğraflar */}
                {selectedLetter.photos && selectedLetter.photos.length > 0 && (
                  <View style={styles.photosContainer}>
                    <Text style={styles.photosTitle}>Fotoğraflar</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {selectedLetter.photos.map((photo, index) => (
                        <Image
                          key={index}
                          source={{ uri: photo.imageUrl }}
                          style={styles.letterPhoto}
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteLetter(selectedLetter._id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FFF" />
                  <Text style={styles.deleteButtonText}>Mektubu Sil</Text>
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
    backgroundColor: '#FFB6C1',
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
  addButton: {
    backgroundColor: '#FF69B4',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
  },
  letterCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  letterCardOpened: {
    backgroundColor: '#F9F9F9',
  },
  letterIcon: {
    marginRight: 15,
  },
  letterContent: {
    flex: 1,
  },
  letterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  letterTitleOpened: {
    color: '#999',
  },
  letterDate: {
    fontSize: 14,
    color: '#FF69B4',
    fontWeight: '600',
    marginBottom: 3,
  },
  letterOpenDate: {
    fontSize: 12,
    color: '#999',
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
  // Create Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createModalContent: {
    width: '90%',
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
  titleInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    minHeight: 150,
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
  createModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  createModalButton: {
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
  saveButton: {
    backgroundColor: '#FF69B4',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Read Modal Styles
  readModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  readModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  readScrollContent: {
    alignItems: 'center',
  },
  envelopeIcon: {
    marginVertical: 20,
  },
  readTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  readDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  readDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  messageContainer: {
    width: '100%',
    backgroundColor: '#FFF9F9',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF69B4',
  },
  readMessage: {
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
  // Photo Styles
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 15,
  },
  photoButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  photoPreviewContainer: {
    maxHeight: 100,
    marginBottom: 15,
  },
  photoPreview: {
    position: 'relative',
    marginRight: 10,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  photosContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
  },
  photosTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  letterPhoto: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
});
