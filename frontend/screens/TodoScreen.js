// Yapılacaklar Listesi Ekranı
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function TodoScreen() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  // Görevleri getir
  const fetchTodos = async () => {
    try {
      const response = await api.get('/todos');
      setTodos(response.data);
      // AsyncStorage'a kaydet (offline destek)
      await AsyncStorage.setItem('todos', JSON.stringify(response.data));
    } catch (error) {
      console.log('API hatası, local verileri yüklüyorum:', error);
      // API hatası durumunda local verilerini yükle
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
    try {
      const response = await api.post('/todos', { task: newTask });
      setTodos([response.data, ...todos]);
      setNewTask('');
      // Local'e kaydet
      await AsyncStorage.setItem('todos', JSON.stringify([response.data, ...todos]));
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
      setTodos(todos.map(todo => (todo._id === id ? response.data : todo)));
    } catch (error) {
      Alert.alert('Hata', 'Durum değiştirilemedi');
      console.error(error);
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
            setTodos(todos.filter(todo => todo._id !== id));
          } catch (error) {
            Alert.alert('Hata', 'Görev silinemedi');
            console.error(error);
          }
        },
      },
    ]);
  };

  const renderTodo = ({ item }) => (
    <View style={styles.todoItem}>
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
      <Text
        style={[
          styles.todoText,
          item.completed && styles.completedText,
        ]}
      >
        {item.task}
      </Text>
      <TouchableOpacity onPress={() => deleteTodo(item._id)}>
        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Yapılacaklar 📝</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Yeni görev ekle..."
          value={newTask}
          onChangeText={setNewTask}
          onSubmitEditing={addTodo}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={addTodo}
          disabled={loading}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={todos}
        renderItem={renderTodo}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz görev yok 🎉</Text>
        }
      />
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
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
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
  todoText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#999',
    marginTop: 50,
  },
});
