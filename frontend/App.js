// Ana App dosyası - Navigation yapısı
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  registerForPushNotificationsAsync,
  registerDeviceToken,
  setupNotificationListeners,
} from './utils/notifications';

// Screens
import CounterScreen from './screens/CounterScreen';
import TodoScreen from './screens/TodoScreen';
import LoveNotesScreen from './screens/LoveNotesScreen';
import GalleryScreen from './screens/GalleryScreen';
import LettersScreen from './screens/LettersScreen';
import SplashScreen from './screens/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [userName, setUserName] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    // Kullanıcı adını kontrol et
    checkUserName();

    // Android navigasyon barını gizle
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }

    // Notification listener'ları kur
    const cleanup = setupNotificationListeners(
      (notification) => {
        // Bildirim geldiğinde
        console.log('Yeni bildirim:', notification.request.content);
      },
      (response) => {
        // Bildirime tıklandığında
        const data = response.notification.request.content.data;
        console.log('Bildirim data:', data);

        // Bildirim tipine göre ekrana yönlendir
        // TODO: Navigation ref kullanarak ekranlara yönlendirme eklenebilir
      }
    );

    return cleanup;
  }, []);

  const checkUserName = async () => {
    try {
      const storedUserName = await AsyncStorage.getItem('userName');
      setUserName(storedUserName);

      // Eğer userName varsa push notification sistemini kur
      if (storedUserName) {
        initializePushNotifications(storedUserName);
      }
    } catch (error) {
      console.error('userName kontrol hatası:', error);
    } finally {
      setCheckingUser(false);
    }
  };

  const initializePushNotifications = async (userNameToUse) => {
    try {
      // Push token al
      const token = await registerForPushNotificationsAsync();

      if (token && userNameToUse) {
        // Token'ı backend'e kaydet (userName ile)
        await registerDeviceToken(token, userNameToUse);

        // Token'ı local storage'a kaydet (diğer ekranlarda kullanmak için)
        await AsyncStorage.setItem('pushToken', token);

        console.log('Push notification sistemi hazır!');
      }
    } catch (error) {
      console.error('Push notification init error:', error);
    }
  };

  const handleUserNameComplete = async (name) => {
    setUserName(name);
    // Push notification sistemini kur
    await initializePushNotifications(name);
  };

  // Kullanıcı adı kontrolü yapılıyor
  if (checkingUser) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      </SafeAreaView>
    );
  }

  // Kullanıcı adı yoksa welcome screen göster
  if (!userName) {
    return <WelcomeScreen onComplete={handleUserNameComplete} />;
  }

  // Splash screen gösteriliyor
  if (!isReady) {
    return <SplashScreen onReady={() => setIsReady(true)} />;
  }

  // Ana uygulama
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Counter') {
                iconName = focused ? 'heart' : 'heart-outline';
              } else if (route.name === 'Todo') {
                iconName = focused ? 'checkbox' : 'checkbox-outline';
              } else if (route.name === 'Notes') {
                iconName = focused ? 'mail' : 'mail-outline';
              } else if (route.name === 'Gallery') {
                iconName = focused ? 'images' : 'images-outline';
              } else if (route.name === 'Letters') {
                iconName = focused ? 'mail-open' : 'mail-open-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#FF1493',
            tabBarInactiveTintColor: '#999',
            headerShown: false,
            tabBarStyle: {
              paddingBottom: 8,
              paddingTop: 5,
              height: 65,
              borderTopWidth: 1,
              borderTopColor: '#F0F0F0',
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },
          })}
        >
        <Tab.Screen
          name="Counter"
          component={CounterScreen}
          options={{ tabBarLabel: 'Gün Sayacı' }}
        />
        <Tab.Screen
          name="Todo"
          component={TodoScreen}
          options={{ tabBarLabel: 'Yapılacaklar' }}
        />
        <Tab.Screen
          name="Notes"
          component={LoveNotesScreen}
          options={{ tabBarLabel: 'Notlar' }}
        />
        <Tab.Screen
          name="Gallery"
          component={GalleryScreen}
          options={{ tabBarLabel: 'Galeri' }}
        />
        <Tab.Screen
          name="Letters"
          component={LettersScreen}
          options={{ tabBarLabel: 'Mektuplar' }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ tabBarLabel: 'Ayarlar' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
    </SafeAreaView>
  );
}
