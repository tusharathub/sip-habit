import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { syncTodayIntake, updateStreak } from '../../store/slices/hydrationSlice';
import { addReminder, toggleReminderState, removeReminder, Reminder } from '../../store/slices/remindersSlice';
import { scheduleDailyReminder, cancelReminderNotification } from '../../utils/notifications';
import { updateWidgetData } from '../../../modules/water-widget';

// Reusable Snapping Scroll Picker (Mimics iOS Native Wheel Picker with Infinite Loop)
interface ScrollPickerProps {
  items: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  width?: number;
}

function ScrollPicker({ items, selectedValue, onValueChange, width = 70 }: ScrollPickerProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const itemHeight = 40;
  const containerHeight = 120;
  
  // Repeat items 3 times to support infinite scroll illusion
  const repeatedItems = [...items, ...items, ...items];
  const paddedItems = ['', ...repeatedItems, ''];
  const midIndexOffset = items.length; // Offset to middle copy
  
  // Flag to prevent double scrolling triggers
  const isJumping = useRef(false);

  useEffect(() => {
    if (isJumping.current) return;
    const selectedIndex = items.indexOf(selectedValue);
    if (selectedIndex !== -1 && scrollViewRef.current) {
      const targetIndex = selectedIndex + midIndexOffset;
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: targetIndex * itemHeight,
          animated: false,
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedValue, items]);

  const handleScroll = (event: any) => {
    if (isJumping.current) return;
    const yOffset = event.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset / itemHeight);
    
    if (index >= 0 && index < repeatedItems.length) {
      const originalIndex = index % items.length;
      const newValue = items[originalIndex];
      
      if (newValue !== selectedValue) {
        onValueChange(newValue);
      }

      // Silent Jump Trick: Snap back to the middle segment when approaching margins
      const lowerBound = items.length;
      const upperBound = items.length * 2;
      
      if (index < lowerBound || index >= upperBound) {
        isJumping.current = true;
        const targetIndex = originalIndex + midIndexOffset;
        
        // Jump without animation so it is completely invisible to the user
        scrollViewRef.current?.scrollTo({
          y: targetIndex * itemHeight,
          animated: false,
        });
        
        // Reset flag after a tiny delay
        setTimeout(() => {
          isJumping.current = false;
        }, 50);
      }
    }
  };

  return (
    <View style={{ height: containerHeight, width }} className="relative justify-center overflow-hidden">
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={{ paddingVertical: 0 }}
      >
        {paddedItems.map((item, idx) => (
          <View 
            key={idx} 
            style={{ height: itemHeight }} 
            className="justify-center items-center"
          >
            <Text 
              className={`text-2xl font-bold tracking-wider ${
                item === selectedValue ? 'text-[#001f24] scale-110' : 'text-[#8a9cae]/60'
              }`}
            >
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // Fetch data from Redux
  const todayIntake = useAppSelector((state) => state.hydration.todayIntake);
  const dailyGoal = useAppSelector((state) => state.settings.dailyGoal);
  const streak = useAppSelector((state) => state.hydration.streak);

  // Reminders Redux State
  const reminders = useAppSelector((state) => state.reminders.list);
  
  // Time Picker Modal States
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState('08');
  const [selectedMinute, setSelectedMinute] = useState('00');

  // Wave animation controllers
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;

  // Set up values arrays for picker (24-hour format)
  const hoursList = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutesList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // Initialize infinite wave animations on mount
  useEffect(() => {
    Animated.loop(
      Animated.timing(wave1Anim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(wave2Anim, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [wave1Anim, wave2Anim]);

  // Sync today's intake on mount
  useEffect(() => {
    dispatch(syncTodayIntake());
  }, [dispatch]);

  // Sync streak if goal is met
  useEffect(() => {
    dispatch(updateStreak({ dailyGoal }));
  }, [todayIntake, dailyGoal, dispatch]);

  // Synchronise home screen widget data on update
  useEffect(() => {
    updateWidgetData(todayIntake, dailyGoal);
  }, [todayIntake, dailyGoal]);

  const percentage = Math.min(100, Math.round((todayIntake / dailyGoal) * 100)) || 0;
  const remaining = Math.max(0, dailyGoal - todayIntake);

  // Toggle reminder
  const toggleReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    const nextEnabled = !reminder.enabled;
    let nextNotificationId = reminder.notificationId;

    if (nextEnabled) {
      // Schedule reminder
      const newNotificationId = await scheduleDailyReminder(reminder.time);
      nextNotificationId = newNotificationId;
    } else {
      // Cancel reminder
      if (reminder.notificationId) {
        await cancelReminderNotification(reminder.notificationId);
        nextNotificationId = null;
      }
    }

    dispatch(toggleReminderState({ id, enabled: nextEnabled, notificationId: nextNotificationId }));
  };

  // Add reminder from selected state
  const handleAddReminder = async () => {
    const timeStr = `${selectedHour}:${selectedMinute}`;
    const newId = Math.random().toString(36).substring(2, 9);
    
    // Automatically schedule since new reminder starts enabled
    const notificationId = await scheduleDailyReminder(timeStr);

    dispatch(addReminder({
      id: newId,
      time: timeStr,
      enabled: true,
      notificationId
    }));
    setShowTimePicker(false);
  };

  const deleteReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder && reminder.notificationId) {
      await cancelReminderNotification(reminder.notificationId);
    }
    dispatch(removeReminder(id));
  };

  const rotate1 = wave1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-28deg', '332deg'],
  });

  const rotate2 = wave2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-18deg', '342deg'],
  });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#F7F9FB]"
      style={{ paddingTop: insets.top }}
    >
      <StatusBar barStyle="dark-content" />
      
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white/80 border-b border-black/5">
        <View className="flex-row items-center gap-2">
          <Ionicons name="water-outline" size={24} color="#006875" />
          <Text className="text-xl font-bold text-[#006875] tracking-tight">Sip Habit</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="px-5 pt-6"
      >
        {/* Visual Tracker Circle */}
        <View className="items-center my-4">
          <View className="w-72 h-72 rounded-full border border-white/50 bg-[#e6e8ea]/20 relative items-center justify-center overflow-hidden shadow-xl shadow-cyan-500/10">
            
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
            
            <Animated.View 
              style={{
                height: `${percentage}%`,
                width: '160%',
                position: 'absolute',
                bottom: 0,
                left: '-30%',
                transform: [{ rotate: rotate1 }],
                backgroundColor: '#3a9fa9',
              }}
            />

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

        {/* Navigation Call-To-Action */}
        <View className="bg-white border border-[#eceef0] rounded-3xl p-5 mb-5 shadow-sm">
          <Text className="text-xs font-bold text-[#006875] tracking-widest uppercase mb-2">
            TRACK INTAKE
          </Text>
          <Text className="text-xs text-[#3b494c] mb-4 leading-normal">
            Ready to log what you drank? Choose container presets or enter custom amounts.
          </Text>
          <TouchableOpacity 
            onPress={() => router.push('/log')}
            className="bg-[#006875] flex-row items-center justify-center gap-2 py-3.5 rounded-2xl active:scale-95 shadow-sm"
          >
            <Ionicons name="add" size={20} color="white" />
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
              onPress={() => setShowTimePicker(true)}
              className="w-7 h-7 rounded-full bg-[#006875]/10 items-center justify-center active:scale-95"
            >
              <Ionicons name="add" size={18} color="#006875" />
            </TouchableOpacity>
          </View>

          {/* Reminders List */}
          <View style={{ gap: 6 }}>
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
            <View className="absolute inset-0 bg-black/45" />
            <View className="p-5 z-10">
              <Text className="text-[10px] font-bold text-white/70 tracking-wider uppercase mb-1">DAILY TIP</Text>
              <Text className="text-sm font-semibold text-white leading-snug">
                Adding a slice of lemon can improve digestion and flavor.
              </Text>
            </View>
          </ImageBackground>
        </View>
      </ScrollView>

      {/* Custom Snapping Wheel Time Picker Modal (iOS Style) */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white w-full rounded-3xl p-6 border border-[#eceef0] shadow-2xl items-center">
            
            <Text className="text-base font-bold text-[#006875] tracking-wide mb-6">
              ADD DAILY REMINDER
            </Text>

            {/* iOS-Style Snapping Wheel Area */}
            <View className="flex-row items-center justify-center bg-gray-50 border border-gray-100 rounded-2xl w-full h-[120px] mb-8 relative">
              
              {/* Highlight center bar indicator overlay */}
              <View 
                style={{ height: 40, top: 40 }}
                className="absolute left-4 right-4 border-y border-[#006875]/25 pointer-events-none"
              />

              {/* Scrollable Hours Wheel */}
              <ScrollPicker 
                items={hoursList} 
                selectedValue={selectedHour} 
                onValueChange={setSelectedHour} 
                width={80}
              />

              <Text className="text-2xl font-bold text-[#001f24] mx-4 -mt-1">:</Text>

              {/* Scrollable Minutes Wheel */}
              <ScrollPicker 
                items={minutesList} 
                selectedValue={selectedMinute} 
                onValueChange={setSelectedMinute} 
                width={80}
              />

            </View>

            {/* Actions Buttons */}
            <View className="flex-row gap-3 w-full">
              <TouchableOpacity 
                onPress={() => setShowTimePicker(false)}
                className="flex-1 py-3 bg-[#eceef0] rounded-xl items-center"
              >
                <Text className="text-xs font-bold text-[#3b494c]">CANCEL</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleAddReminder}
                className="flex-1 py-3 bg-[#006875] rounded-xl items-center animate-pulse"
              >
                <Text className="text-xs font-bold text-white">SAVE TIME</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}
