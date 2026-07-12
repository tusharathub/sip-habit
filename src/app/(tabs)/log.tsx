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
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addDrink, removeDrink } from '../../store/slices/hydrationSlice';

export default function LogScreen() {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  
  // Fetch logs and today's total from Redux
  const logs = useAppSelector((state) => state.hydration.logs);
  const todayIntake = useAppSelector((state) => state.hydration.todayIntake);
  const dailyGoal = useAppSelector((state) => state.settings.dailyGoal);

  // States
  const [selectedAmount, setSelectedAmount] = useState(500); // default 500ml
  const [selectedContainer, setSelectedContainer] = useState<'cup' | 'bottle' | 'large' | 'custom'>('bottle');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInput, setCustomInput] = useState('');

  // Helpers
  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const todayLogs = logs.filter(log => isToday(log.timestamp));

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Add water to Redux state
  const handleAddWater = () => {
    console.log('LOG SCREEN: Dispatching addDrink with amount =', selectedAmount);
    dispatch(addDrink({ amount: selectedAmount, containerType: selectedContainer, dailyGoal }));
  };

  // Handle Quick Adjust adjustments
  const adjustVolume = (amount: number) => {
    setSelectedAmount(prev => Math.max(50, prev + amount));
  };

  // Handle Custom Dialog Submission
  const handleCustomSubmit = () => {
    const parsed = parseInt(customInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setSelectedAmount(parsed);
      setSelectedContainer('custom');
    }
    setCustomInput('');
    setShowCustomModal(false);
  };

  const getContainerLabel = (type: string) => {
    switch (type) {
      case 'cup': return 'Cup';
      case 'bottle': return 'Bottle';
      case 'large': return 'Large Bottle';
      default: return 'Custom Log';
    }
  };

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
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="px-5 pt-6"
      >
        {/* Section Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-[#191c1e] mb-1">Log Intake</Text>
          <Text className="text-sm text-[#3b494c]">Select your container size to record your hydration.</Text>
        </View>

        {/* Container Bento Grid */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          
          {/* Cup */}
          <TouchableOpacity 
            onPress={() => {
              setSelectedContainer('cup');
              setSelectedAmount(250);
            }}
            className={`w-[47%] p-5 rounded-3xl bg-white border items-center justify-center shadow-sm ${
              selectedContainer === 'cup' 
                ? 'border-[#006875] bg-[#00e5ff]/5' 
                : 'border-[#eceef0]'
            }`}
          >
            <View className="w-14 h-14 rounded-full bg-[#006875]/10 items-center justify-center mb-3">
              <Ionicons name="cafe-outline" size={28} color="#006875" />
            </View>
            <Text className="text-base font-bold text-[#006875]">Cup</Text>
            <Text className="text-[10px] font-bold text-[#3b494c] uppercase tracking-wider mt-0.5">250ml</Text>
          </TouchableOpacity>

          {/* Bottle */}
          <TouchableOpacity 
            onPress={() => {
              setSelectedContainer('bottle');
              setSelectedAmount(500);
            }}
            className={`w-[47%] p-5 rounded-3xl bg-white border items-center justify-center shadow-sm ${
              selectedContainer === 'bottle' 
                ? 'border-[#006875] bg-[#00e5ff]/5' 
                : 'border-[#eceef0]'
            }`}
          >
            <View className="w-14 h-14 rounded-full bg-[#006875]/10 items-center justify-center mb-3">
              <Ionicons name="water-outline" size={28} color="#006875" />
            </View>
            <Text className="text-base font-bold text-[#006875]">Bottle</Text>
            <Text className="text-[10px] font-bold text-[#3b494c] uppercase tracking-wider mt-0.5">500ml</Text>
          </TouchableOpacity>

          {/* Large */}
          <TouchableOpacity 
            onPress={() => {
              setSelectedContainer('large');
              setSelectedAmount(1000);
            }}
            className={`w-[47%] p-5 rounded-3xl bg-white border items-center justify-center shadow-sm ${
              selectedContainer === 'large' 
                ? 'border-[#006875] bg-[#00e5ff]/5' 
                : 'border-[#eceef0]'
            }`}
          >
            <View className="w-14 h-14 rounded-full bg-[#006875]/10 items-center justify-center mb-3">
              <Ionicons name="beer-outline" size={28} color="#006875" />
            </View>
            <Text className="text-base font-bold text-[#006875]">Large</Text>
            <Text className="text-[10px] font-bold text-[#3b494c] uppercase tracking-wider mt-0.5">1000ml</Text>
          </TouchableOpacity>

          {/* Custom */}
          <TouchableOpacity 
            onPress={() => setShowCustomModal(true)}
            className={`w-[47%] p-5 rounded-3xl bg-white border items-center justify-center shadow-sm ${
              selectedContainer === 'custom' 
                ? 'border-[#006875] bg-[#00e5ff]/5' 
                : 'border-[#eceef0]'
            }`}
          >
            <View className="w-14 h-14 rounded-full bg-[#006875]/10 items-center justify-center mb-3">
              <Ionicons name="create-outline" size={28} color="#006875" />
            </View>
            <Text className="text-base font-bold text-[#006875]">Custom</Text>
            <Text className="text-[10px] font-bold text-[#3b494c] uppercase tracking-wider mt-0.5">
              {selectedContainer === 'custom' ? `${selectedAmount}ml` : 'Set ml'}
            </Text>
          </TouchableOpacity>

        </View>

        {/* Quick Adjust Control */}
        <View className="flex-row items-center justify-between bg-white border border-[#eceef0] rounded-full px-5 py-3 mb-4 shadow-sm">
          <Text className="text-sm font-semibold text-[#3b494c]">Quick Adjust:</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity 
              onPress={() => adjustVolume(-50)}
              className="bg-[#F7F9FB] border border-[#eceef0] px-4 py-1.5 rounded-full active:scale-95"
            >
              <Text className="text-xs font-bold text-[#006875]">-50ml</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => adjustVolume(50)}
              className="bg-[#F7F9FB] border border-[#eceef0] px-4 py-1.5 rounded-full active:scale-95"
            >
              <Text className="text-xs font-bold text-[#006875]">+50ml</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inline Add Water Button (Directly below Quick Adjust) */}
        <TouchableOpacity 
          onPress={handleAddWater}
          className="bg-[#006875] w-full h-14 rounded-full flex-row items-center justify-center gap-2 active:scale-95 shadow-md mb-8"
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-base font-bold text-white uppercase tracking-wider">
            Add {selectedAmount}ml Water
          </Text>
        </TouchableOpacity>

        {/* Recent Logs Section */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-[#191c1e]">Today's Logs</Text>
            <Text className="text-xs font-bold text-[#006875] uppercase tracking-wider">
              Total: {todayIntake}ml
            </Text>
          </View>

          {todayLogs.length === 0 ? (
            <View className="bg-white border border-[#eceef0] rounded-3xl p-8 items-center justify-center shadow-sm">
              <Ionicons name="beer-outline" size={32} color="#8a9cae" className="opacity-55 mb-2" />
              <Text className="text-sm text-[#8a9cae] font-semibold text-center">No water logged today yet.</Text>
            </View>
          ) : (
            <View className="space-y-4">
              {todayLogs.map((log) => (
                <View 
                  key={log.id}
                  className="bg-white border border-[#eceef0] p-4 rounded-2xl flex-row items-center justify-between shadow-sm"
                >
                  <View className="flex-row items-center gap-4">
                    <View className="w-10 h-10 rounded-full bg-[#00e5ff]/15 items-center justify-center">
                      <Ionicons name="water" size={18} color="#006875" />
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-[#191c1e]">{getContainerLabel(log.containerType)}</Text>
                      <Text className="text-xs text-[#8a9cae] font-medium mt-0.5">{formatTime(log.timestamp)}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-4">
                    <Text className="text-base font-bold text-[#006875]">{log.amount}ml</Text>
                    <TouchableOpacity 
                      onPress={() => dispatch(removeDrink(log.id))}
                      className="p-1 active:scale-90"
                    >
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>

      {/* Custom Amount Modal */}
      <Modal
        visible={showCustomModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 bg-black/50 justify-center items-center px-6"
        >
          <View className="bg-white w-full rounded-3xl p-6 border border-[#eceef0] shadow-2xl items-center">
            
            <Text className="text-base font-bold text-[#006875] tracking-wide mb-6">
              ENTER CUSTOM AMOUNT
            </Text>

            <TextInput
              value={customInput}
              onChangeText={setCustomInput}
              keyboardType="number-pad"
              placeholder="e.g. 350"
              placeholderTextColor="#8a9cae"
              autoFocus={true}
              className="w-full text-center text-3xl font-extrabold text-[#001f24] py-3 bg-gray-50 rounded-2xl border border-gray-100 mb-6"
            />

            {/* Actions Buttons */}
            <View className="flex-row gap-3 w-full">
              <TouchableOpacity 
                onPress={() => setShowCustomModal(false)}
                className="flex-1 py-3 bg-[#eceef0] rounded-xl items-center"
              >
                <Text className="text-xs font-bold text-[#3b494c]">CANCEL</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleCustomSubmit}
                className="flex-1 py-3 bg-[#006875] rounded-xl items-center"
              >
                <Text className="text-xs font-bold text-white">SET VOLUME</Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}
