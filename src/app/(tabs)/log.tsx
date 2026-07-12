import React from 'react';
import { Text, View } from 'react-native';

export default function LogScreen() {
  return (
    <View className="flex-1 bg-[#091522] items-center justify-center">
      <Text className="text-3xl font-bold text-[#00BDFF] mb-2">Log Intake</Text>
      <Text className="text-base text-[#8A9CAE]">Track your hydration</Text>
    </View>
  );
}

