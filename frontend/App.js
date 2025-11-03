// Ana App dosyası - Navigation yapısı
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import CounterScreen from './screens/CounterScreen';
import TodoScreen from './screens/TodoScreen';
import LoveNotesScreen from './screens/LoveNotesScreen';
import GalleryScreen from './screens/GalleryScreen';
import LettersScreen from './screens/LettersScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
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
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#FF1493',
          tabBarInactiveTintColor: '#999',
          headerShown: false,
          tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
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
      </Tab.Navigator>
    </NavigationContainer>
  );
}
