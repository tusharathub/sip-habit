import React from 'react';
import { Text, View } from 'react-native';

export default function HistoryScreen() {
  return (
    <View className="flex-1 bg-[#091522] items-center justify-center">
      <Text className="text-3xl font-bold text-[#00BDFF] mb-2">History & Analytics</Text>
      <Text className="text-base text-[#8A9CAE]">View your streaks and progress</Text>
    </View>
  );
}

