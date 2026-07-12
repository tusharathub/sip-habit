import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIconStyle: {
          width: 'auto',
          height: '100%',
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#ECEEF0',
          borderTopWidth: 1,
          height: 64 + (insets.bottom > 0 ? insets.bottom : 8),
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View 
              className={`items-center justify-center flex-col ${
                focused 
                  ? 'bg-[#D5E3FF] px-4 py-1.5 rounded-full' 
                  : 'px-4 py-1.5'
              }`}
            >
              <Ionicons
                name={focused ? 'grid' : 'grid-outline'}
                size={20}
                color={focused ? '#001B3C' : '#546A7E'}
              />
              <Text 
                className={`text-[10px] font-bold mt-0.5 ${
                  focused ? 'text-[#001B3C]' : 'text-[#546A7E]'
                }`}
              >
                Dashboard
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View 
              className={`items-center justify-center flex-col ${
                focused 
                  ? 'bg-[#D5E3FF] px-4 py-1.5 rounded-full' 
                  : 'px-4 py-1.5'
              }`}
            >
              <Ionicons
                name={focused ? 'add-circle' : 'add-circle-outline'}
                size={20}
                color={focused ? '#001B3C' : '#546A7E'}
              />
              <Text 
                className={`text-[10px] font-bold mt-0.5 ${
                  focused ? 'text-[#001B3C]' : 'text-[#546A7E]'
                }`}
              >
                Log
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View 
              className={`items-center justify-center flex-col ${
                focused 
                  ? 'bg-[#D5E3FF] px-4 py-1.5 rounded-full' 
                  : 'px-4 py-1.5'
              }`}
            >
              <Ionicons
                name={focused ? 'analytics' : 'analytics-outline'}
                size={20}
                color={focused ? '#001B3C' : '#546A7E'}
              />
              <Text 
                className={`text-[10px] font-bold mt-0.5 ${
                  focused ? 'text-[#001B3C]' : 'text-[#546A7E]'
                }`}
              >
                History
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View 
              className={`items-center justify-center flex-col ${
                focused 
                  ? 'bg-[#D5E3FF] px-4 py-1.5 rounded-full' 
                  : 'px-4 py-1.5'
              }`}
            >
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={20}
                color={focused ? '#001B3C' : '#546A7E'}
              />
              <Text 
                className={`text-[10px] font-bold mt-0.5 ${
                  focused ? 'text-[#001B3C]' : 'text-[#546A7E]'
                }`}
              >
                Profile
              </Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
