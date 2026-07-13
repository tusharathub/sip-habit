import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { resetSettings, updateSettings } from '../../store/slices/settingsSlice';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  // Fetch settings from Redux
  const settings = useAppSelector((state) => state.settings);
  const { dailyGoal, weight, reminderInterval, notificationsEnabled } = settings;

  // Modal local state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState('');
  const [isHowToUseExpanded, setIsHowToUseExpanded] = useState(false);
  const [isWidgetGuideExpanded, setIsWidgetGuideExpanded] = useState(false);

  // Handle updates
  const adjustGoal = (amount: number) => {
    const newGoal = Math.max(500, dailyGoal + amount);
    dispatch(updateSettings({ dailyGoal: newGoal }));
  };

  const adjustWeight = (amount: number) => {
    const newWeight = Math.max(30, weight + amount);
    dispatch(updateSettings({ weight: newWeight }));
  };

  const adjustInterval = (amount: number) => {
    const newInterval = Math.max(15, reminderInterval + amount);
    dispatch(updateSettings({ reminderInterval: newInterval }));
  };

  const toggleNotifications = (value: boolean) => {
    dispatch(updateSettings({ notificationsEnabled: value }));
  };

  const handleCustomGoalSubmit = () => {
    const parsed = parseInt(customGoalInput, 10);
    if (!isNaN(parsed) && parsed >= 500) {
      dispatch(updateSettings({ dailyGoal: parsed }));
    }
    setCustomGoalInput('');
    setShowGoalModal(false);
  };

  const handleReset = () => {
    dispatch(resetSettings());
  };

  // Recommended Hydration logic: 35ml per kg of body weight
  const recommendedIntake = weight * 35;

  return (
    <View 
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
        <TouchableOpacity 
          onPress={handleReset}
          className="bg-[#ef4444]/10 px-3 py-1.5 rounded-full active:scale-95"
        >
          <Text className="text-[10px] font-bold text-[#ef4444] uppercase tracking-wider">RESET</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="px-5 pt-6"
      >
        {/* User Card */}
        <View className="bg-white border border-[#eceef0] rounded-3xl p-5 mb-5 flex-row items-center gap-4 shadow-sm">
          <View className="w-14 h-14 rounded-full bg-[#006875]/15 items-center justify-center">
            <Ionicons name="person" size={28} color="#006875" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-[#191c1e]">Hydration Hero</Text>
            <Text className="text-xs text-[#8a9cae] font-semibold mt-0.5">Stay healthy, stay refreshed</Text>
          </View>
        </View>

        {/* Bento Card 1: Intake Goal Adjuster */}
        <View className="bg-white border border-[#eceef0] rounded-3xl p-5 mb-5 shadow-sm">
          <Text className="text-xs font-bold text-[#006875] tracking-widest uppercase mb-4">
            DAILY INTAKE GOAL
          </Text>

          <View className="flex-row items-center justify-between bg-gray-50 border border-gray-100 p-4 rounded-2xl mb-4">
            <TouchableOpacity 
              onPress={() => adjustGoal(-250)}
              className="w-10 h-10 rounded-full bg-white border border-[#eceef0] items-center justify-center active:scale-95"
            >
              <Ionicons name="remove" size={20} color="#006875" />
            </TouchableOpacity>
            
            <View className="items-center">
              <Text className="text-3xl font-extrabold text-[#001f24] tracking-tight">{dailyGoal}ml</Text>
              <Text className="text-[9px] font-bold text-[#8a9cae] uppercase mt-0.5">TARGET</Text>
            </View>

            <TouchableOpacity 
              onPress={() => adjustGoal(250)}
              className="w-10 h-10 rounded-full bg-white border border-[#eceef0] items-center justify-center active:scale-95"
            >
              <Ionicons name="add" size={20} color="#006875" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={() => setShowGoalModal(true)}
            className="w-full py-3 bg-[#006875]/10 border border-[#006875]/10 rounded-2xl items-center active:scale-95"
          >
            <Text className="text-xs font-bold text-[#006875] uppercase tracking-wider">Set Custom Goal</Text>
          </TouchableOpacity>
        </View>

        {/* Bento Card 2: Body Parameters (Weight Adjuster) */}
        <View className="bg-white border border-[#eceef0] rounded-3xl p-5 mb-5 shadow-sm">
          <Text className="text-xs font-bold text-[#006875] tracking-widest uppercase mb-4">
            BODY WEIGHT PARAMETER
          </Text>

          <View className="flex-row items-center justify-between bg-gray-50 border border-gray-100 p-4 rounded-2xl mb-3">
            <TouchableOpacity 
              onPress={() => adjustWeight(-5)}
              className="w-10 h-10 rounded-full bg-white border border-[#eceef0] items-center justify-center active:scale-95"
            >
              <Ionicons name="remove" size={20} color="#006875" />
            </TouchableOpacity>
            
            <View className="items-center">
              <Text className="text-2xl font-extrabold text-[#001f24] tracking-tight">{weight} kg</Text>
              <Text className="text-[9px] font-bold text-[#8a9cae] uppercase mt-0.5">CURRENT WEIGHT</Text>
            </View>

            <TouchableOpacity 
              onPress={() => adjustWeight(5)}
              className="w-10 h-10 rounded-full bg-white border border-[#eceef0] items-center justify-center active:scale-95"
            >
              <Ionicons name="add" size={20} color="#006875" />
            </TouchableOpacity>
          </View>

          <View className="bg-[#eceef0]/40 p-3.5 rounded-2xl border border-[#eceef0] flex-row items-start gap-3">
            <Ionicons name="bulb" size={18} color="#006875" style={{ marginTop: 1 }} />
            <View className="flex-1">
              <Text className="text-[11px] text-[#3b494c] leading-relaxed">
                Ideal daily hydration is calculated at 35ml per kg of body weight. For you, the recommended target is <Text className="font-bold text-[#006875]">{recommendedIntake}ml</Text>.
              </Text>
            </View>
          </View>
        </View>

        {/* Bento Card 3: How to Use & Privacy (Collapsible Accordion) */}
        <View className="bg-white border border-[#eceef0] rounded-3xl mb-5 shadow-sm overflow-hidden">
          <TouchableOpacity 
            onPress={() => setIsHowToUseExpanded(!isHowToUseExpanded)}
            activeOpacity={0.7}
            className="flex-row items-center justify-between p-5"
          >
            <View className="flex-row items-center gap-2.5">
              <Ionicons name="help-circle-outline" size={22} color="#006875" />
              <Text className="text-sm font-bold text-[#006875] tracking-wide uppercase">
                How to Use & Privacy
              </Text>
            </View>
            <Ionicons 
              name={isHowToUseExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#006875" 
            />
          </TouchableOpacity>

          {isHowToUseExpanded && (
            <View className="px-5 pb-5 border-t border-[#eceef0] pt-4">
              {/* Quick Guide */}
              <View className="mb-4">
                <Text className="text-sm font-bold text-[#191c1e] mb-3">Quick Guide</Text>
                
                <View className="flex-row items-start gap-2.5 mb-2.5">
                  <View className="w-5 h-5 rounded-full bg-[#006875]/10 items-center justify-center mt-0.5">
                    <Text className="text-[10px] font-bold text-[#006875]">1</Text>
                  </View>
                  <Text className="text-xs text-[#3b494c] flex-1 leading-relaxed">
                    Set your weight above to calculate a recommended daily target, or customize it to your liking.
                  </Text>
                </View>

                <View className="flex-row items-start gap-2.5 mb-2.5">
                  <View className="w-5 h-5 rounded-full bg-[#006875]/10 items-center justify-center mt-0.5">
                    <Text className="text-[10px] font-bold text-[#006875]">2</Text>
                  </View>
                  <Text className="text-xs text-[#3b494c] flex-1 leading-relaxed">
                    On the main screen, select and tap a cup size to quickly log your water intake throughout the day.
                  </Text>
                </View>

                <View className="flex-row items-start gap-2.5 mb-2.5">
                  <View className="w-5 h-5 rounded-full bg-[#006875]/10 items-center justify-center mt-0.5">
                    <Text className="text-[10px] font-bold text-[#006875]">3</Text>
                  </View>
                  <Text className="text-xs text-[#3b494c] flex-1 leading-relaxed">
                    Check the History and Log tabs to view detailed statistics and charts of your hydration progress.
                  </Text>
                </View>

                <View className="flex-row items-start gap-2.5">
                  <View className="w-5 h-5 rounded-full bg-[#006875]/10 items-center justify-center mt-0.5">
                    <Text className="text-[10px] font-bold text-[#006875]">4</Text>
                  </View>
                  <Text className="text-xs text-[#3b494c] flex-1 leading-relaxed">
                    Enable reminders to receive periodic local notifications that keep you on track.
                  </Text>
                </View>
              </View>

              <View className="h-[1px] bg-[#eceef0] my-2" />

              {/* Privacy & Permissions */}
              <View className="mt-3">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="shield-checkmark-outline" size={18} color="#10b981" />
                  <Text className="text-sm font-bold text-[#191c1e]">Your Data, Your Device</Text>
                </View>
                <Text className="text-xs text-[#3b494c] leading-relaxed mb-3">
                  We highly value your privacy. The app is built with a local-first architecture:
                </Text>
                <View className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl">
                  <View className="flex-row items-center gap-2 mb-1.5">
                    <Ionicons name="cloud-offline-outline" size={15} color="#006875" />
                    <Text className="text-[11px] font-bold text-[#006875]">100% On-Device & Offline</Text>
                  </View>
                  <Text className="text-[11px] text-[#5c6f84] leading-relaxed mb-4">
                    No user accounts, tracking, or cloud sync. Everything is stored locally on your device and never leaves it.
                  </Text>

                  <View className="flex-row items-start gap-2 mb-1.5">
                    <Ionicons name="notifications-outline" size={15} color="#006875" style={{ marginTop: 1 }} />
                    <View className="flex-1">
                      <Text className="text-[11px] font-bold text-[#006875]">Notification Permission Only</Text>
                      <Text className="text-[11px] text-[#5c6f84] leading-relaxed mt-1">
                        We request notification permission strictly to trigger local reminders for your water intake. No other permissions or personal data are collected.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Bento Card 4: How to Add & Use Widget */}
        <View className="bg-white border border-[#eceef0] rounded-3xl mb-5 shadow-sm overflow-hidden">
          <TouchableOpacity 
            onPress={() => setIsWidgetGuideExpanded(!isWidgetGuideExpanded)}
            activeOpacity={0.7}
            className="flex-row items-center justify-between p-5"
          >
            <View className="flex-row items-center gap-2.5">
              <Ionicons name="grid-outline" size={22} color="#006875" />
              <Text className="text-sm font-bold text-[#006875] tracking-wide uppercase">
                Home Screen Widget
              </Text>
            </View>
            <Ionicons 
              name={isWidgetGuideExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#006875" 
            />
          </TouchableOpacity>

          {isWidgetGuideExpanded && (
            <View className="px-5 pb-5 border-t border-[#eceef0] pt-4">
              <Text className="text-xs text-[#3b494c] leading-relaxed mb-4">
                Track your daily progress and log drinks directly from your device home screen:
              </Text>

              <View className="flex-row items-start gap-2.5 mb-2.5">
                <View className="w-5 h-5 rounded-full bg-[#006875]/10 items-center justify-center mt-0.5">
                  <Text className="text-[10px] font-bold text-[#006875]">1</Text>
                </View>
                <Text className="text-xs text-[#3b494c] flex-1 leading-relaxed">
                  Go to your phone's home screen, <Text className="font-semibold text-[#191c1e]">long-press</Text> empty space, and choose <Text className="font-semibold text-[#191c1e]">Widgets</Text>.
                </Text>
              </View>

              <View className="flex-row items-start gap-2.5 mb-2.5">
                <View className="w-5 h-5 rounded-full bg-[#006875]/10 items-center justify-center mt-0.5">
                  <Text className="text-[10px] font-bold text-[#006875]">2</Text>
                </View>
                <Text className="text-xs text-[#3b494c] flex-1 leading-relaxed">
                  Locate <Text className="font-semibold text-[#191c1e]">Sip Habit</Text> in the widgets list.
                </Text>
              </View>

              <View className="flex-row items-start gap-2.5 mb-2.5">
                <View className="w-5 h-5 rounded-full bg-[#006875]/10 items-center justify-center mt-0.5">
                  <Text className="text-[10px] font-bold text-[#006875]">3</Text>
                </View>
                <Text className="text-xs text-[#3b494c] flex-1 leading-relaxed">
                  Touch and hold the <Text className="font-semibold text-[#191c1e]">Sip Habit Progress</Text> widget, then drag it onto your screen.
                </Text>
              </View>

              <View className="flex-row items-start gap-2.5">
                <View className="w-5 h-5 rounded-full bg-[#006875]/10 items-center justify-center mt-0.5">
                  <Text className="text-[10px] font-bold text-[#006875]">4</Text>
                </View>
                <Text className="text-xs text-[#3b494c] flex-1 leading-relaxed">
                  Tap any of the logging buttons (<Text className="font-semibold text-[#006875]">+250</Text>, <Text className="font-semibold text-[#006875]">+500</Text>, <Text className="font-semibold text-[#006875]">+750</Text>) to record water instantly.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Custom Goal Modal Dialog */}
      <Modal
        visible={showGoalModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 bg-black/50 justify-center items-center px-6"
        >
          <View className="bg-white w-full rounded-3xl p-6 border border-[#eceef0] shadow-2xl items-center">
            
            <Text className="text-base font-bold text-[#006875] tracking-wide mb-6">
              ENTER DAILY TARGET (ml)
            </Text>

            <TextInput
              value={customGoalInput}
              onChangeText={setCustomGoalInput}
              keyboardType="number-pad"
              placeholder="e.g. 2750"
              placeholderTextColor="#8a9cae"
              autoFocus={true}
              className="w-full text-center text-3xl font-extrabold text-[#001f24] py-3 bg-gray-50 rounded-2xl border border-gray-100 mb-6"
            />

            {/* Actions Buttons */}
            <View className="flex-row gap-3 w-full">
              <TouchableOpacity 
                onPress={() => setShowGoalModal(false)}
                className="flex-1 py-3 bg-[#eceef0] rounded-xl items-center"
              >
                <Text className="text-xs font-bold text-[#3b494c]">CANCEL</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleCustomGoalSubmit}
                className="flex-1 py-3 bg-[#006875] rounded-xl items-center"
              >
                <Text className="text-xs font-bold text-white">SAVE TARGET</Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}
