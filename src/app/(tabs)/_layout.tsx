import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarButton: ({ ref, ...props }) => (
          <Pressable
            {...props}
            android_ripple={null}
            style={props.style}
          />
        ),
        tabBarIconStyle: {
          width: 'auto',
          height: '100%',
        },
        tabBarStyle: {
          backgroundColor: colors.cream,
          borderTopColor: colors.charcoal,
          borderTopWidth: 2.5,
          height: 64 + (insets.bottom > 0 ? insets.bottom : 8),
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          shadowColor: colors.charcoal,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 0,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View 
              style={focused ? {
                backgroundColor: colors.salmon,
                borderColor: colors.charcoal,
                borderWidth: 1.5,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 6,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                ...Platform.select({
                  ios: {
                    shadowColor: colors.charcoal,
                    shadowOffset: { width: 2, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 0,
                  },
                  android: { elevation: 3 },
                }),
              } : {
                paddingHorizontal: 16,
                paddingVertical: 6,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Ionicons
                name={focused ? 'grid' : 'grid-outline'}
                size={20}
                color={focused ? colors.charcoal : colors.muted}
              />
              <Text 
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  marginTop: 2,
                  color: focused ? colors.charcoal : colors.muted,
                }}
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
              style={focused ? {
                backgroundColor: colors.salmon,
                borderColor: colors.charcoal,
                borderWidth: 1.5,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 6,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                ...Platform.select({
                  ios: {
                    shadowColor: colors.charcoal,
                    shadowOffset: { width: 2, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 0,
                  },
                  android: { elevation: 3 },
                }),
              } : {
                paddingHorizontal: 16,
                paddingVertical: 6,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Ionicons
                name={focused ? 'add-circle' : 'add-circle-outline'}
                size={20}
                color={focused ? colors.charcoal : colors.muted}
              />
              <Text 
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  marginTop: 2,
                  color: focused ? colors.charcoal : colors.muted,
                }}
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
              style={focused ? {
                backgroundColor: colors.salmon,
                borderColor: colors.charcoal,
                borderWidth: 1.5,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 6,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                ...Platform.select({
                  ios: {
                    shadowColor: colors.charcoal,
                    shadowOffset: { width: 2, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 0,
                  },
                  android: { elevation: 3 },
                }),
              } : {
                paddingHorizontal: 16,
                paddingVertical: 6,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Ionicons
                name={focused ? 'analytics' : 'analytics-outline'}
                size={20}
                color={focused ? colors.charcoal : colors.muted}
              />
              <Text 
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  marginTop: 2,
                  color: focused ? colors.charcoal : colors.muted,
                }}
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
              style={focused ? {
                backgroundColor: colors.salmon,
                borderColor: colors.charcoal,
                borderWidth: 1.5,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 6,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                ...Platform.select({
                  ios: {
                    shadowColor: colors.charcoal,
                    shadowOffset: { width: 2, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 0,
                  },
                  android: { elevation: 3 },
                }),
              } : {
                paddingHorizontal: 16,
                paddingVertical: 6,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={20}
                color={focused ? colors.charcoal : colors.muted}
              />
              <Text 
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  marginTop: 2,
                  color: focused ? colors.charcoal : colors.muted,
                }}
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
