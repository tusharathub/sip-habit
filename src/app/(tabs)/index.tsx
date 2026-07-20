import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
import { updateWidgetData } from '../../../modules/water-widget';
import { useToast } from '../../components/Toast';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { syncTodayIntake, updateStreak } from '../../store/slices/hydrationSlice';
import { addReminder, removeReminder, toggleReminderState } from '../../store/slices/remindersSlice';
import { colors, sketchButtonPrimary, sketchButtonSecondary, sketchCard, sketchCardInner, sketchPill } from '../../theme';
import { cancelReminderNotification, scheduleDailyReminder } from '../../utils/notifications';




// Reusable Snapping Scroll Picker (Mimics iOS Native Wheel Picker with Infinite Loop)
interface ScrollPickerProps {
  items: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  width?: number;
}

function ScrollPicker({ items, selectedValue, onValueChange, width = 70 }: ScrollPickerProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const itemHeight = 50;
  const containerHeight = 150;
  
  const repeatedItems = [...items, ...items, ...items];
  const paddedItems = ['', ...repeatedItems, ''];
  const midIndexOffset = items.length;
  const currentY = useRef(0);
  const isJumping = useRef(false);

  useEffect(() => {
    if (isJumping.current) return;
    const selectedIndex = items.indexOf(selectedValue);
    if (selectedIndex !== -1 && scrollViewRef.current) {
      const targetIndex = selectedIndex + midIndexOffset;
      const targetY = targetIndex * itemHeight;
      if (Math.abs(currentY.current - targetY) > 5) {
        scrollViewRef.current.scrollTo({
          y: targetY,
          animated: false,
        });
        currentY.current = targetY;
      }
    }
  }, [selectedValue, items]);

  const handleScroll = (event: any) => {
    currentY.current = event.nativeEvent.contentOffset.y;
  };

  const handleScrollEnd = (event: any) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    currentY.current = yOffset;
    const index = Math.round(yOffset / itemHeight);
    
    if (index >= 0 && index < repeatedItems.length) {
      const originalIndex = index % items.length;
      const newValue = items[originalIndex];
      
      if (newValue !== selectedValue) {
        onValueChange(newValue);
      }

      const lowerBound = items.length;
      const upperBound = items.length * 2;
      
      if (index < lowerBound || index >= upperBound) {
        isJumping.current = true;
        const targetIndex = originalIndex + midIndexOffset;
        const targetY = targetIndex * itemHeight;
        scrollViewRef.current?.scrollTo({
          y: targetY,
          animated: false,
        });
        currentY.current = targetY;
        setTimeout(() => {
          isJumping.current = false;
        }, 50);
      }
    }
  };

  return (
    <View style={{ height: containerHeight, width, justifyContent: 'center', overflow: 'hidden' }}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: 0 }}
      >
        {paddedItems.map((item, idx) => (
          <View 
            key={idx} 
            style={{ height: itemHeight, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text 
              style={{
                fontSize: 24,
                fontWeight: '700',
                letterSpacing: 1,
                color: item === selectedValue ? colors.charcoal : colors.mutedLight,
                transform: [{ scale: item === selectedValue ? 1.1 : 1 }],
              }}
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
  const { showToast } = useToast();

  
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
    showToast({
      message: `Reminder set for ${timeStr} ⏰`,
      type: 'success',
    });
  };

  const handlePresetAdd = (hoursOffset: number) => {
    const now = new Date();
    now.setHours(now.getHours() + hoursOffset);
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    setSelectedHour(h);
    setSelectedMinute(m);
  };

  const openTimePicker = () => {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    setSelectedHour(h);
    setSelectedMinute(m);
    setShowTimePicker(true);
  };

  const deleteReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      if (reminder.notificationId) {
        await cancelReminderNotification(reminder.notificationId);
      }
      dispatch(removeReminder(id));
      showToast({
        message: `Reminder for ${reminder.time} deleted`,
        type: 'info',
      });
    }
  };

  const rotate1 = wave1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotate2 = wave2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const wave1Bottom = -490 + (percentage / 100) * 280;
  const wave2Bottom = -470 + (percentage / 100) * 280;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.cream, paddingTop: insets.top }}
    >
      <StatusBar barStyle="dark-content" />
      
      {/* Top Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 2.5,
        borderBottomColor: colors.charcoal,
        backgroundColor: colors.cream,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="water-outline" size={24} color={colors.teal} />
          <Text style={{ fontSize: 22, fontWeight: '900', color: colors.charcoal, letterSpacing: -0.5 }}>Sip Habit</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20, paddingTop: 1 }}
      >
        {/* Visual Tracker Circle */}
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <View 
            style={{
              width: 280,
              height: 280,
              borderRadius: 140,
              borderWidth: 3,
              borderColor: colors.charcoal,
              backgroundColor: colors.creamLight,
              position: 'relative',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              ...Platform.select({
                ios: {
                  shadowColor: colors.charcoal,
                  shadowOffset: { width: 5, height: 5 },
                  shadowOpacity: 0.35,
                  shadowRadius: 0,
                },
                android: { elevation: 8 },
              }),
            }}
          >
            
            <Animated.View 
              style={{
                width: 460,
                height: 460,
                borderRadius: 185,
                position: 'absolute',
                bottom: wave2Bottom,
                left: -90,
                transform: [{ rotate: rotate2 }],
                backgroundColor: colors.tealSoft,
              }}
            />
            
            <Animated.View 
              style={{
                width: 480,
                height: 480,
                borderRadius: 195,
                position: 'absolute',
                bottom: wave1Bottom,
                left: -100,
                transform: [{ rotate: rotate1 }],
                backgroundColor: colors.teal,
              }}
            />

            <View 
              style={{
                zIndex: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(245, 240, 232, 0.85)',
                width: '82%',
                height: '82%',
                borderRadius: 120,
                borderWidth: 2,
                borderColor: colors.charcoal,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '800', color: colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
                CURRENTLY AT
              </Text>
              <Text style={{ fontSize: 48, fontWeight: '900', color: colors.charcoal, letterSpacing: -1 }}>
                {percentage}%
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4, fontWeight: '700' }}>
                {todayIntake} / {dailyGoal}ml
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 8, alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.charcoal, marginBottom: 4 }}>
              {percentage >= 100 ? 'Goal Achieved! 🎉' : 'Stay Refreshed!'}
            </Text>
            <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center', maxWidth: 280 }}>
              {percentage >= 100 
                ? `Outstanding! You met your goal of ${dailyGoal}ml today.` 
                : `You're doing great. Just ${remaining}ml left to reach your daily goal.`}
            </Text>
            {streak > 0 && (
              <View 
                style={[sketchPill, { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 }]}
              >
                <Ionicons name="flame" size={14} color={colors.charcoal} />
                <Text style={{ fontSize: 11, fontWeight: '800', color: colors.charcoal }}>
                  {streak} DAY STREAK
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Navigation Call-To-Action */}
        <View style={[sketchCard, { padding: 20, marginBottom: 10 }]}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            TRACK INTAKE
          </Text>
          {/* <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 16, lineHeight: 18 }}>
            Ready to log what you drank? Choose container presets or enter custom amounts.
          </Text> */}
          <TouchableOpacity 
            onPress={() => router.push('/log')}
            style={[sketchButtonPrimary, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 }]}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={colors.charcoal} />
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.charcoal, textTransform: 'uppercase', letterSpacing: 1 }}>Log Intake Screen</Text>
          </TouchableOpacity>
        </View>

        {/* Reminders Bento Card (Multiple Reminders) */}
        <View style={[sketchCard, { padding: 20, marginBottom: 20 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: colors.muted, letterSpacing: 2, textTransform: 'uppercase' }}>
              DAILY REMINDERS
            </Text>
            <TouchableOpacity 
              onPress={openTimePicker}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.salmonLight,
                borderWidth: 1.5,
                borderColor: colors.charcoal,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color={colors.charcoal} />
            </TouchableOpacity>
          </View>

          {/* Reminders List */}
          <View style={{ gap: 8 }}>
            {reminders.map((reminder) => (
              <View 
                key={reminder.id}
                style={[sketchCardInner, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View 
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: reminder.enabled ? colors.tealSoft : colors.creamDark,
                      borderWidth: 1.5,
                      borderColor: reminder.enabled ? colors.teal : colors.mutedLight,
                    }}
                  >
                    <Ionicons 
                      name="alarm" 
                      size={18} 
                      color={reminder.enabled ? colors.teal : colors.mutedLight} 
                    />
                  </View>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: reminder.enabled ? colors.charcoal : colors.mutedLight,
                    textDecorationLine: reminder.enabled ? 'none' : 'line-through',
                  }}>
                    {reminder.time}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => toggleReminder(reminder.id)}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: colors.charcoal,
                      backgroundColor: reminder.enabled ? colors.salmon : colors.cream,
                      justifyContent: 'center',
                      paddingHorizontal: 2,
                    }}
                  >
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        borderWidth: 1.5,
                        borderColor: colors.charcoal,
                        backgroundColor: colors.creamLight,
                        alignSelf: reminder.enabled ? 'flex-end' : 'flex-start',
                      }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => deleteReminder(reminder.id)}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Hydration Tip Card */}
        <View 
          style={[sketchCard, { padding: 20, position: 'relative', overflow: 'hidden' }]}
        >
          <View style={{ zIndex: 10 }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>DAILY TIP</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.charcoal, lineHeight: 22 }}>
              Adding a slice of lemon can improve digestion and flavor.
            </Text>
          </View>
          <View style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.06 }}>
            <Ionicons name="water" size={100} color={colors.charcoal} />
          </View>
        </View>
      </ScrollView>

      {/* Custom Snapping Wheel Time Picker Modal (iOS Style) */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 150 }}>
          {/* Backdrop */}
          <TouchableOpacity 
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          <View 
            style={[sketchCard, { width: '100%', padding: 24, alignItems: 'center', paddingBottom: 32, zIndex: 10, borderRadius: 24 }]}
          >
            
            {/* Drag handle decorator */}
            <View style={{ width: 40, height: 4, backgroundColor: colors.mutedLight, borderRadius: 2, marginBottom: 10 }} />

            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.charcoal, marginBottom: 20, alignSelf: 'flex-start' }}>
              Set Reminder
            </Text>

            {/* Preset Options pills */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24, width: '100%', justifyContent: 'space-between' }}>
              <TouchableOpacity 
                onPress={() => setShowTimePicker(false)}
                style={[sketchButtonSecondary, { flex: 1, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center' }]}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.muted }}>No Reminder</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => handlePresetAdd(1)}
                style={[sketchButtonSecondary, { flex: 1, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center', backgroundColor: colors.cream }]}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.teal }}>In an Hour</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => handlePresetAdd(2)}
                style={[sketchButtonSecondary, { flex: 1, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center', backgroundColor: colors.cream }]}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.teal }}>In Two Hours</Text>
              </TouchableOpacity>
            </View>

            {/* iOS-Style Snapping Wheel Area */}
            <View style={[sketchCardInner, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', height: 150, marginBottom: 32, position: 'relative' }]}>
              
              {/* Highlight center bar indicator overlay */}
              <View 
                style={{ height: 50, top: 50, borderTopWidth: 1.5, borderBottomWidth: 1.5, borderColor: colors.borderLight, position: 'absolute', left: 16, right: 16 }}
              />

              {/* Left scale ruler ticks */}
              <View style={{ position: 'absolute', left: 16, top: 0, bottom: 0, justifyContent: 'space-between', paddingVertical: 16, width: 20 }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <View 
                    key={i} 
                    style={{
                      height: i === 4 ? 2 : 1,
                      width: i === 4 ? 20 : (i % 2 === 0 ? 12 : 6),
                      backgroundColor: i === 4 ? colors.teal : colors.mutedLight,
                      opacity: i === 4 ? 1 : 0.4,
                    }}
                  />
                ))}
              </View>

              {/* Right scale ruler ticks */}
              <View style={{ position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'space-between', paddingVertical: 16, width: 20 }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <View 
                    key={i} 
                    style={{
                      height: i === 4 ? 2 : 1,
                      width: i === 4 ? 20 : (i % 2 === 0 ? 12 : 6),
                      backgroundColor: i === 4 ? colors.teal : colors.mutedLight,
                      opacity: i === 4 ? 1 : 0.4,
                    }}
                  />
                ))}
              </View>

              {/* Scrollable Hours Wheel */}
              <ScrollPicker 
                items={hoursList} 
                selectedValue={selectedHour} 
                onValueChange={setSelectedHour} 
                width={80}
              />

              <Text style={{ fontSize: 28, fontWeight: '300', color: colors.mutedLight, marginHorizontal: 24, marginTop: -4 }}>:</Text>

              {/* Scrollable Minutes Wheel */}
              <ScrollPicker 
                items={minutesList} 
                selectedValue={selectedMinute} 
                onValueChange={setSelectedMinute} 
                width={80}
              />

            </View>

            {/* Actions Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity 
                onPress={() => setShowTimePicker(false)}
                style={[sketchButtonSecondary, { flex: 1, paddingVertical: 14, alignItems: 'center' }]}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.muted }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleAddReminder}
                style={[sketchButtonPrimary, { flex: 1.5, paddingVertical: 14, alignItems: 'center' }]}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.charcoal }}>Done</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}
