// Rastgele Sevgi Notu Ekranı
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  ScrollView,
} from 'react-native';
import api from '../config/api';
import { Ionicons } from '@expo/vector-icons';
import { getStoredPlayerId } from '../utils/playerIdHelper';

export default function LoveNotesScreen() {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [sendNoteText, setSendNoteText] = useState('');
  const [allNotes, setAllNotes] = useState([]);
  const [shownNoteIds, setShownNoteIds] = useState([]); // Gösterilen notların ID'leri
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchRandomNote();
  }, []);

  // Rastgele not getir (tüm notlar bitmeden tekrar etmesin)
  const fetchRandomNote = async () => {
    setLoading(true);
    try {
      // Tüm notları getir
      const response = await api.get('/notes');
      const notes = response.data;

      if (notes.length === 0) {
        Alert.alert('Bilgi', 'Henüz sevgi notu eklenmemiş 💌');
        setNote(null);
        setLoading(false);
        return;
      }

      // Henüz gösterilmemiş notları filtrele
      const unseenNotes = notes.filter(n => !shownNoteIds.includes(n._id));

      // Eğer tüm notlar gösterildiyse, listeyi sıfırla
      if (unseenNotes.length === 0) {
        setShownNoteIds([]);
        // Rastgele bir not seç
        const randomNote = notes[Math.floor(Math.random() * notes.length)];
        setNote(randomNote);
        setShownNoteIds([randomNote._id]);
      } else {
        // Henüz gösterilmemiş notlardan rastgele birini seç
        const randomNote = unseenNotes[Math.floor(Math.random() * unseenNotes.length)];
        setNote(randomNote);
        setShownNoteIds([...shownNoteIds, randomNote._id]);
      }
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

  // Tüm notları getir
  const fetchAllNotes = async () => {
    try {
      const response = await api.get('/notes');
      setAllNotes(response.data);
    } catch (error) {
      Alert.alert('Hata', 'Notlar yüklenemedi');
      console.error(error);
    }
  };

  // Yeni not ekle
  const addNote = async () => {
    if (!newNoteText.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir not yazın');
      return;
    }

    try {
      await api.post('/notes', { text: newNoteText });
      setNewNoteText('');
      setShowAddModal(false);
      Alert.alert('Başarılı', 'Not eklendi! 💌');
      fetchRandomNote(); // Yeni notu göstermek için refresh
    } catch (error) {
      Alert.alert('Hata', 'Not eklenemedi');
      console.error(error);
    }
  };

  // Not sil
  const deleteNote = async (id) => {
    Alert.alert('Sil', 'Bu notu silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/notes/${id}`);
            setAllNotes(allNotes.filter((n) => n._id !== id));
            Alert.alert('Başarılı', 'Not silindi');
            // Eğer silinen not gösterilen notsa, yeni bir not getir
            if (note && note._id === id) {
              fetchRandomNote();
            }
          } catch (error) {
            Alert.alert('Hata', 'Not silinemedi');
            console.error(error);
          }
        },
      },
    ]);
  };

  // Liste modalını aç
  const openListModal = () => {
    fetchAllNotes();
    setShowListModal(true);
  };

  // Sevgi notu gönder (bildirim ile)
  const sendLoveNote = async () => {
    if (!sendNoteText.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir not yazın');
      return;
    }

    try {
      setSending(true);

      // Player ID'yi al
      const playerId = await getStoredPlayerId();

      // Backend'e not ekle (bildirim otomatik gönderilecek)
      await api.post('/notes', {
        text: sendNoteText,
        senderPlayerId: playerId,
      });

      setSendNoteText('');
      setShowSendModal(false);
      Alert.alert('Gönderildi! 💕', 'Sevgi notunuz başarıyla gönderildi');
    } catch (error) {
      Alert.alert('Hata', 'Not gönderilemedi');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={openListModal}
        >
          <Ionicons name="eye-outline" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Sevgi Notları 💌</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSendModal(true)}
          >
            <Ionicons name="send" size={24} color="#FF1493" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={28} color="#333" />
          </TouchableOpacity>
        </View>
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

      {/* Add Note Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Sevgi Notu ✍️</Text>

            <TextInput
              style={styles.noteInput}
              placeholder="Sevgi notunuzu yazın..."
              value={newNoteText}
              onChangeText={setNewNoteText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewNoteText('');
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addNote}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Send Note Modal */}
      <Modal
        visible={showSendModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.sendModalHeader}>
              <Ionicons name="send" size={32} color="#FF1493" />
              <Text style={styles.modalTitle}>Sevgi Notu Gönder 💌</Text>
            </View>

            <Text style={styles.sendDescription}>
              Sevgilinize özel bir not gönderin. Bildirim olarak ulaşacak! 💕
            </Text>

            <TextInput
              style={styles.noteInput}
              placeholder="Mesajınızı yazın..."
              value={sendNoteText}
              onChangeText={setSendNoteText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowSendModal(false);
                  setSendNoteText('');
                }}
                disabled={sending}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={sendLoveNote}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#FFF" />
                    <Text style={styles.saveButtonText}> Gönder</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notes List Modal */}
      <Modal
        visible={showListModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowListModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.listModalContent}>
            <View style={styles.listModalHeader}>
              <Text style={styles.modalTitle}>Tüm Notlar 📝</Text>
              <TouchableOpacity onPress={() => setShowListModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={allNotes}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.notesList}
              renderItem={({ item }) => (
                <View style={styles.noteListItem}>
                  <Text style={styles.noteListText}>{item.text}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteNote(item._id)}
                  >
                    <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyListContainer}>
                  <Ionicons name="document-text-outline" size={60} color="#CCC" />
                  <Text style={styles.emptyListText}>Henüz not yok</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
  noteInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 120,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
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
  sendButton: {
    backgroundColor: '#FF1493',
    flexDirection: 'row',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sendModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 10,
  },
  sendDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  // List Modal Styles
  listModalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  listModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  notesList: {
    paddingBottom: 20,
  },
  noteListItem: {
    backgroundColor: '#FFF9F9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: '#FF69B4',
  },
  noteListText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    padding: 8,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyListText: {
    fontSize: 18,
    color: '#999',
    marginTop: 20,
  },
});
