import React, { useEffect, useRef, useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Animated,
  Easing,
  Switch,
  TextInput,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { syncTodayIntake, updateStreak } from '../../store/slices/hydrationSlice';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface Reminder {
  id: string;
  time: string;
  enabled: boolean;
}

export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // Fetch data from Redux
  const todayIntake = useAppSelector((state) => state.hydration.todayIntake);
  const dailyGoal = useAppSelector((state) => state.settings.dailyGoal);
  const streak = useAppSelector((state) => state.hydration.streak);

  // Reminders Local State
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', time: '08:00 AM', enabled: true },
    { id: '2', time: '12:00 PM', enabled: true },
    { id: '3', time: '03:30 PM', enabled: false },
    { id: '4', time: '07:00 PM', enabled: true },
  ]);
  const [newReminderTime, setNewReminderTime] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Wave animation controllers
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;

  // Initialize infinite wave animations on mount
  useEffect(() => {
    // Wave 1: 8 seconds rotation loop
    Animated.loop(
      Animated.timing(wave1Anim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Wave 2: 12 seconds rotation loop
    Animated.loop(
      Animated.timing(wave2Anim, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [wave1Anim, wave2Anim]);

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

  // Toggle reminder enabled status
  const toggleReminder = (id: string) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  // Add a new reminder
  const addReminder = () => {
    if (!newReminderTime.trim()) return;
    const newId = Math.random().toString(36).substring(2, 9);
    setReminders(prev => [
      ...prev,
      { id: newId, time: newReminderTime, enabled: true },
    ]);
    setNewReminderTime('');
    setShowAddForm(false);
  };

  // Delete a reminder
  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  // Map animated values to rotations
  const rotate1 = wave1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-28deg', '332deg'],
  });

  const rotate2 = wave2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-18deg', '342deg'],
  });

  return (
    <View 
      className="flex-1 bg-[#F7F9FB]" 
      style={{ paddingTop: insets.top }}
    >
      <StatusBar barStyle="dark-content" />
      
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white/80 border-b border-black/5">
        <View className="flex-row items-center gap-2">
          <Ionicons name="water" size={24} color="#006875" />
          <Text className="text-xl font-bold text-[#006875] tracking-tight">H2O Vitality</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-[#eceef0] active:scale-95">
          <Ionicons name="notifications" size={20} color="#3b494c" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="px-5 pt-6"
      >
        {/* Visual Tracker Circle */}
        <View className="items-center my-4">
          <View className="w-72 h-72 rounded-full border border-white/50 bg-[#e6e8ea]/20 relative items-center justify-center overflow-hidden shadow-xl shadow-cyan-500/10">
            
            {/* Animated background wave layer */}
            <Animated.View 
              style={{
                height: `${percentage}%`,
                width: '160%',
                position: 'absolute',
                bottom: 0,
                left: '-30%',
                transform: [{ rotate: rotate2 }],
                backgroundColor: 'rgba(0, 229, 255, 0.25)',
              }}
            />
            
            {/* Animated primary diagonal wave fill layer */}
            <Animated.View 
              style={{
                height: `${percentage}%`,
                width: '160%',
                position: 'absolute',
                bottom: 0,
                left: '-30%',
                transform: [{ rotate: rotate1 }],
                backgroundColor: '#3a9fa9', // beautiful solid teal wave fill
              }}
            />

            {/* Central Overlay Content */}
            <View className="z-10 items-center justify-center bg-white/75 w-[84%] h-[84%] rounded-full border border-white/90 shadow-md">
              <Text className="text-[10px] font-bold text-[#00626e] tracking-wider uppercase mb-1">
                CURRENTLY AT
              </Text>
              <Text className="text-5xl font-extrabold text-[#001f24] tracking-tight">
                {percentage}%
              </Text>
              <Text className="text-xs text-[#00626e]/80 mt-1 font-semibold">
                {todayIntake} / {dailyGoal}ml
              </Text>
            </View>
          </View>

          {/* Motivation Text */}
          <View className="mt-6 items-center px-4">
            <Text className="text-xl font-bold text-[#191c1e] mb-1">
              {percentage >= 100 ? 'Goal Achieved! 🎉' : 'Stay Refreshed!'}
            </Text>
            <Text className="text-sm text-[#3b494c] text-center max-w-[280px]">
              {percentage >= 100 
                ? `Outstanding! You met your goal of ${dailyGoal}ml today.` 
                : `You're doing great. Just ${remaining}ml left to reach your daily goal.`}
            </Text>
            {streak > 0 && (
              <View className="flex-row items-center gap-1 mt-2 bg-[#d5e3ff] px-3 py-1 rounded-full border border-[#006875]/10">
                <Ionicons name="flame" size={14} color="#006875" />
                <Text className="text-xs font-bold text-[#006875]">
                  {streak} DAY STREAK
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Navigation Call-To-Action (Replaces Quick Add) */}
        <View className="bg-white border border-[#eceef0] rounded-3xl p-5 mb-5 shadow-sm">
          <Text className="text-xs font-bold text-[#006875] tracking-widest uppercase mb-2">
            TRACK INTAKE
          </Text>
          <Text className="text-xs text-[#3b494c] mb-4 leading-normal">
            Ready to log what you drank? Choose container presets or enter custom amounts.
          </Text>
          <TouchableOpacity 
            onPress={() => router.push('/log')}
            className="bg-[#006875] flex-row items-center justify-center gap-2 py-3.5 rounded-2xl active:scale-95 shadow-sm shadow-cyan-900/10"
          >
            <Ionicons name="add" size={20} color="#white" style={{ marginRight: 2 }} />
            <Text className="text-sm font-bold text-white uppercase tracking-wider">Log Intake Screen</Text>
          </TouchableOpacity>
        </View>

        {/* Reminders Bento Card (Multiple Reminders) */}
        <View className="bg-white border border-[#eceef0] rounded-3xl p-5 mb-5 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xs font-bold text-[#006875] tracking-widest uppercase">
              DAILY REMINDERS
            </Text>
            <TouchableOpacity 
              onPress={() => setShowAddForm(!showAddForm)}
              className="w-7 h-7 rounded-full bg-[#006875]/10 items-center justify-center active:scale-95"
            >
              <Ionicons name={showAddForm ? 'close' : 'add'} size={18} color="#006875" />
            </TouchableOpacity>
          </View>

          {/* Add Reminder Form */}
          {showAddForm && (
            <View className="flex-row gap-2 mb-4 bg-[#eceef0]/30 p-3 rounded-2xl border border-[#eceef0]">
              <TextInput
                value={newReminderTime}
                onChangeText={setNewReminderTime}
                placeholder="e.g. 09:15 PM"
                placeholderTextColor="#8a9cae"
                className="flex-1 text-sm text-[#191c1e] font-semibold py-1 px-2 bg-white rounded-lg border border-black/5"
              />
              <TouchableOpacity 
                onPress={addReminder}
                className="bg-[#006875] px-4 py-2 rounded-lg items-center justify-center"
              >
                <Text className="text-xs font-bold text-white uppercase">Add</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Reminders List */}
          <View className="space-y-3">
            {reminders.map((reminder) => (
              <View 
                key={reminder.id}
                className="flex-row items-center justify-between p-3 rounded-2xl bg-[#F7F9FB] border border-[#eceef0]"
              >
                <View className="flex-row items-center gap-3">
                  <View className={`w-9 h-9 rounded-xl items-center justify-center ${
                    reminder.enabled ? 'bg-[#00e5ff]/20' : 'bg-gray-200'
                  }`}>
                    <Ionicons 
                      name="alarm" 
                      size={18} 
                      color={reminder.enabled ? '#006875' : '#8a9cae'} 
                    />
                  </View>
                  <Text className={`text-sm font-bold ${
                    reminder.enabled ? 'text-[#191c1e]' : 'text-[#8a9cae] line-through'
                  }`}>
                    {reminder.time}
                  </Text>
                </View>

                <View className="flex-row items-center gap-3">
                  <Switch
                    value={reminder.enabled}
                    onValueChange={() => toggleReminder(reminder.id)}
                    trackColor={{ false: '#d1d5db', true: '#9cf0ff' }}
                    thumbColor={reminder.enabled ? '#006875' : '#f4f3f4'}
                  />
                  <TouchableOpacity 
                    onPress={() => deleteReminder(reminder.id)}
                    className="p-1"
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Hydration Tip Card */}
        <View className="rounded-3xl overflow-hidden h-40 shadow-sm">
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8IQasSEfxUZM8fElXgFTQr39jl9jNf2c1hSDSc93mGwr1owkSVmkUj2sHZywcVGBIe4cQ7nuHR0wa2dex0W8GnHiXVfFdo1epAoDchPP4ZRFx6QdDEfdKtPUpwcDSzihFHZF6QHZDTac0b-OlEJ8JUqtgKTGZJsRspT11t858pX4YAww43kMbI88nlW-XJpZoVKKSVj5_1Pv-32TMYFW0NZLi7FkWwfk0kS8VZlPdqm6Vj1j5lkICzZEpddnpQwQ2fuj_SUpjj2c' }}
            className="w-full h-full justify-end"
          >
            {/* Overlay */}
            <View className="absolute inset-0 bg-black/45" />
            
            {/* Content */}
            <View className="p-5 z-10">
              <Text className="text-[10px] font-bold text-white/70 tracking-wider uppercase mb-1">DAILY TIP</Text>
              <Text className="text-sm font-semibold text-white leading-snug">
                Adding a slice of lemon can improve digestion and flavor.
              </Text>
            </View>
          </ImageBackground>
        </View>
      </ScrollView>
    </View>
  );
}
