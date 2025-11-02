// Yapılacaklar Listesi Ekranı (Tarih + Bildirimler)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
// import {
//   requestNotificationPermissions,
//   scheduleTaskNotification,
// } from '../utils/notifications';

dayjs.locale('tr');

export default function TodoScreen() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    // requestNotificationPermissions();
    fetchTodos();
  }, []);

  // Görevleri getir
  const fetchTodos = async () => {
    try {
      const response = await api.get('/todos');
      setTodos(response.data);
      await AsyncStorage.setItem('todos', JSON.stringify(response.data));
    } catch (error) {
      console.log('API hatası, local verileri yüklüyorum:', error);
      const localTodos = await AsyncStorage.getItem('todos');
      if (localTodos) {
        setTodos(JSON.parse(localTodos));
      }
    }
  };

  // Yeni görev ekle
  const addTodo = async () => {
    if (!newTask.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir görev yazın');
      return;
    }

    setLoading(true);
    const newTodoData = {
      title: newTask,
      task: newTask,
      date: selectedDate ? selectedDate.toISOString() : null,
    };

    try {
      const response = await api.post('/todos', newTodoData);
      const createdTodo = response.data;

      // Bildirim planla
      // if (createdTodo.date) {
      //   await scheduleTaskNotification(createdTodo);
      // }

      setTodos([createdTodo, ...todos]);
      setNewTask('');
      setSelectedDate(null);
      await AsyncStorage.setItem('todos', JSON.stringify([createdTodo, ...todos]));
    } catch (error) {
      Alert.alert('Hata', 'Görev eklenemedi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Görevi tamamlandı olarak işaretle
  const toggleTodo = async (id, currentStatus) => {
    try {
      const response = await api.patch(`/todos/${id}`, {
        completed: !currentStatus,
      });
      setTodos(todos.map((todo) => (todo._id === id ? response.data : todo)));
    } catch (error) {
      Alert.alert('Hata', 'Durum değiştirilemedi');
    }
  };

  // Görevi sil
  const deleteTodo = async (id) => {
    Alert.alert('Sil', 'Bu görevi silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/todos/${id}`);
            setTodos(todos.filter((todo) => todo._id !== id));
          } catch (error) {
            Alert.alert('Hata', 'Görev silinemedi');
          }
        },
      },
    ]);
  };

  // Görevi düzenle
  const openEditModal = (todo) => {
    setEditingTodo({
      ...todo,
      title: todo.title || todo.task,
    });
    setShowEditModal(true);
  };

  const updateTodo = async () => {
    if (!editingTodo.title?.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir görev yazın');
      return;
    }

    try {
      const response = await api.patch(`/todos/${editingTodo._id}`, {
        title: editingTodo.title,
        date: editingTodo.date,
      });

      // if (response.data.date) {
      //   await scheduleTaskNotification(response.data);
      // }

      setTodos(todos.map((todo) => (todo._id === editingTodo._id ? response.data : todo)));
      setShowEditModal(false);
      setEditingTodo(null);
    } catch (error) {
      Alert.alert('Hata', 'Görev güncellenemedi');
    }
  };

  // Tarih seç
  const onDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const onEditDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date && editingTodo) {
      setEditingTodo({ ...editingTodo, date: date.toISOString() });
    }
  };

  const renderTodo = ({ item }) => (
    <TouchableOpacity
      style={styles.todoItem}
      onLongPress={() => openEditModal(item)}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleTodo(item._id, item.completed)}
      >
        <Ionicons
          name={item.completed ? 'checkbox' : 'square-outline'}
          size={24}
          color={item.completed ? '#4CAF50' : '#999'}
        />
      </TouchableOpacity>

      <View style={styles.todoContent}>
        <Text
          style={[styles.todoText, item.completed && styles.completedText]}
        >
          {item.title || item.task}
        </Text>
        {item.date && (
          <Text style={styles.dateText}>
            📅 {dayjs(item.date).format('DD MMMM YYYY')}
          </Text>
        )}
      </View>

      <TouchableOpacity onPress={() => deleteTodo(item._id)}>
        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Yapılacaklar 📝</Text>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Yeni görev ekle..."
            value={newTask}
            onChangeText={setNewTask}
            onSubmitEditing={addTodo}
          />
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={selectedDate ? '#4ECDC4' : '#999'}
            />
            {selectedDate && (
              <Text style={styles.dateButtonText}>
                {dayjs(selectedDate).format('DD/MM')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={addTodo}
          disabled={loading}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {showDatePicker && !editingTodo && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      <FlatList
        data={todos}
        renderItem={renderTodo}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz görev yok 🎉</Text>
        }
      />

      {/* Düzenleme Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Görevi Düzenle</Text>

            <TextInput
              style={styles.modalInput}
              value={editingTodo?.title}
              onChangeText={(text) =>
                setEditingTodo({ ...editingTodo, title: text })
              }
              placeholder="Görev başlığı"
            />

            <TouchableOpacity
              style={styles.modalDateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#4ECDC4" />
              <Text style={styles.modalDateText}>
                {editingTodo?.date
                  ? dayjs(editingTodo.date).format('DD MMMM YYYY')
                  : 'Tarih seç'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && editingTodo && (
              <DateTimePicker
                value={
                  editingTodo.date ? new Date(editingTodo.date) : new Date()
                }
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onEditDateChange}
                minimumDate={new Date()}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowDatePicker(false);
                  setShowEditModal(false);
                  setEditingTodo(null);
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={updateTodo}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#B8E6F0',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 25,
    marginRight: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  dateButtonText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 15,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkbox: {
    marginRight: 12,
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    color: '#333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#999',
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  modalDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 20,
  },
  modalDateText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
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
    backgroundColor: '#4ECDC4',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
