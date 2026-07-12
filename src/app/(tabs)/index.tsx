import React, { useEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addDrink, syncTodayIntake, updateStreak } from '../../store/slices/hydrationSlice';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  
  // Fetch data from Redux
  const todayIntake = useAppSelector((state) => state.hydration.todayIntake);
  const dailyGoal = useAppSelector((state) => state.settings.dailyGoal);
  const streak = useAppSelector((state) => state.hydration.streak);

  // Sync today's intake on mount (in case day shifted)
  useEffect(() => {
    dispatch(syncTodayIntake());
  }, [dispatch]);

  // Sync streak if goal is met
  useEffect(() => {
    dispatch(updateStreak({ dailyGoal }));
  }, [todayIntake, dailyGoal, dispatch]);

  // Calculate percentage (capped at 100)
  const percentage = Math.min(100, Math.round((todayIntake / dailyGoal) * 100)) || 0;
  const remaining = Math.max(0, dailyGoal - todayIntake);

  // Handle Quick Add click
  const handleQuickAdd = (amount: number, type: 'cup' | 'bottle' | 'large') => {
    dispatch(addDrink({ amount, containerType: type }));
  };

  return (
    <View 
      className="flex-1 bg-[#091522]" 
      style={{ paddingTop: insets.top }}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#12253A]">
        <View className="flex-row items-center gap-2">
          <Ionicons name="water" size={24} color="#00BDFF" />
          <Text className="text-xl font-bold text-[#00BDFF] tracking-tight">H2O Vitality</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-[#12253A] active:scale-95">
          <Ionicons name="notifications" size={20} color="#8A9CAE" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="px-6 pt-6"
      >
        {/* Visual Tracker Circle */}
        <View className="items-center my-6">
          <View className="w-72 h-72 md:w-80 md:h-80 rounded-full border border-white/10 bg-white/5 relative items-center justify-center overflow-hidden shadow-2xl">
            
            {/* Water Fill Layer */}
            <View 
              style={{
                height: `${percentage}%`,
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0, 189, 255, 0.45)',
              }}
            />
            
            {/* Second overlay layer for visual depth */}
            <View 
              style={{
                height: `${Math.max(0, percentage - 5)}%`,
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(156, 240, 255, 0.15)',
              }}
            />

            {/* Central Overlay Content */}
            <View className="z-10 items-center justify-center bg-black/10 w-[85%] h-[85%] rounded-full border border-white/5 shadow-inner">
              <Text className="text-xs font-semibold text-[#8A9CAE] tracking-wider uppercase mb-1">
                CURRENTLY AT
              </Text>
              <Text className="text-5xl font-bold text-white tracking-tight">
                {percentage}%
              </Text>
              <Text className="text-sm text-[#8A9CAE] mt-1 font-medium">
                {todayIntake} / {dailyGoal}ml
              </Text>
            </View>
          </View>

          {/* Motivation Text */}
          <View className="mt-6 items-center px-4">
            <Text className="text-xl font-bold text-white mb-1">
              {percentage >= 100 ? 'Goal Achieved! 🎉' : 'Stay Refreshed!'}
            </Text>
            <Text className="text-sm text-[#8A9CAE] text-center max-w-[280px]">
              {percentage >= 100 
                ? `Outstanding! You met your goal of ${dailyGoal}ml today.` 
                : `You're doing great! Just ${remaining}ml left to reach your goal.`}
            </Text>
            {streak > 0 && (
              <View className="flex-row items-center gap-1 mt-2 bg-[#12253A]/50 px-3 py-1 rounded-full border border-[#00BDFF]/10">
                <Ionicons name="flame" size={14} color="#FF9500" />
                <Text className="text-xs font-semibold text-[#FF9500]">
                  {streak} DAY STREAK
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Add Bento Card */}
        <View className="bg-[#12253A]/40 border border-[#162D44] rounded-3xl p-5 mb-6">
          <Text className="text-xs font-bold text-[#00BDFF] tracking-widest uppercase mb-4">
            QUICK ADD
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={() => handleQuickAdd(250, 'cup')}
              className="flex-1 flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-[#00BDFF]/10 border border-[#00BDFF]/20 active:scale-95"
            >
              <Ionicons name="wine" size={24} color="#00BDFF" />
              <Text className="text-xs font-bold text-[#00BDFF]">250ML</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => handleQuickAdd(500, 'bottle')}
              className="flex-1 flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-[#00BDFF]/20 border border-[#00BDFF]/30 active:scale-95"
            >
              <Ionicons name="water" size={24} color="#00BDFF" />
              <Text className="text-xs font-bold text-[#00BDFF]">500ML</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => handleQuickAdd(750, 'large')}
              className="flex-1 flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-[#9CF0FF]/15 border border-[#9CF0FF]/25 active:scale-95"
            >
              <Ionicons name="beer" size={24} color="#00BDFF" />
              <Text className="text-xs font-bold text-[#00BDFF]">750ML</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reminder Card */}
        <View className="bg-[#00BDFF]/5 border border-[#00BDFF]/15 rounded-3xl p-5 flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 rounded-2xl bg-[#00BDFF]/10 items-center justify-center">
              <Ionicons name="alarm" size={24} color="#00BDFF" />
            </View>
            <View>
              <Text className="text-base font-bold text-white">Next Reminder</Text>
              <Text className="text-xs text-[#8A9CAE] mt-0.5">In 30 minutes (2:45 PM)</Text>
            </View>
          </View>
          <TouchableOpacity className="border border-[#00BDFF] px-4 py-1.5 rounded-full active:scale-95">
            <Text className="text-xs font-bold text-[#00BDFF] tracking-wider uppercase">SNOOZE</Text>
          </TouchableOpacity>
        </View>

        {/* Hydration Tip Card */}
        <View className="bg-[#12253A]/30 border border-[#162D44] rounded-3xl p-5 relative overflow-hidden">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="bulb-outline" size={16} color="#FFD60A" />
            <Text className="text-xs font-bold text-[#FFD60A] tracking-wider uppercase">DAILY TIP</Text>
          </View>
          <Text className="text-sm font-semibold text-white/90 leading-relaxed">
            Adding a slice of lemon can improve digestion and flavor.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
