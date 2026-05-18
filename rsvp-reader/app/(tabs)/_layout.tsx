// app/(tabs)/_layout.tsx
// Drei-Tab-Navigation: Reader, Bibliothek, Einstellungen.

import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme';

export default function TabLayout() {
  const scheme = useColorScheme();
  const c      = scheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown:           false,
        tabBarActiveTintColor:   c.text,
        tabBarInactiveTintColor: c.textTertiary,
        tabBarStyle: {
          backgroundColor: c.background,
          borderTopColor:  c.border,
          borderTopWidth:  0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Reader',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Bibliothek',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Einstellungen',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
