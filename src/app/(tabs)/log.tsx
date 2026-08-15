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
import { useToast } from '../../components/Toast';
import { colors, sketchCard, sketchCardInner, sketchButtonPrimary, sketchButtonSecondary } from '../../theme';

export default function LogScreen() {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  
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

  const handleAddWater = () => {
    console.log('LOG SCREEN: Dispatching addDrink with amount =', selectedAmount);
    dispatch(addDrink({ amount: selectedAmount, containerType: selectedContainer, dailyGoal }));
    showToast({
      message: `Successfully logged ${selectedAmount}ml of water! 💧`,
      type: 'success',
    });
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

  const getContainerIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'cup': return 'cafe-outline';
      case 'bottle': return 'water-outline';
      case 'large': return 'beer-outline';
      default: return 'create-outline';
    }
  };

  const containers = [
    { key: 'cup' as const, label: 'Cup', amount: 250, icon: 'cafe-outline' as const },
    { key: 'bottle' as const, label: 'Bottle', amount: 500, icon: 'water-outline' as const },
    { key: 'large' as const, label: 'Large', amount: 1000, icon: 'beer-outline' as const },
    { key: 'custom' as const, label: 'Custom', amount: selectedAmount, icon: 'create-outline' as const },
  ];

  return (
    <View 
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
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20, paddingTop: 24 }}
      >
        {/* Section Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: colors.charcoal, marginBottom: 4, letterSpacing: -0.5 }}>Log Intake</Text>
          <Text style={{ fontSize: 13, color: colors.muted, fontWeight: '500' }}>Select your container size to record your hydration.</Text>
        </View>

        {/* Container Bento Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
          
          {containers.map((container) => {
            const isSelected = selectedContainer === container.key;
            return (
              <TouchableOpacity 
                key={container.key}
                onPress={() => {
                  if (container.key === 'custom') {
                    setShowCustomModal(true);
                  } else {
                    setSelectedContainer(container.key);
                    setSelectedAmount(container.amount);
                  }
                }}
                style={[
                  sketchCard,
                  {
                    width: '47%',
                    padding: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSelected ? colors.salmonLight : colors.creamLight,
                    borderColor: colors.charcoal,
                  },
                ]}
                activeOpacity={0.8}
              >
                <View 
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                    backgroundColor: isSelected ? colors.salmon : colors.cream,
                    borderWidth: 1.5,
                    borderColor: colors.charcoal,
                  }}
                >
                  <Ionicons name={container.icon} size={28} color={colors.charcoal} />
                </View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.charcoal }}>{container.label}</Text>
                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
                  {container.key === 'custom' 
                    ? (selectedContainer === 'custom' ? `${selectedAmount}ml` : 'Set ml') 
                    : `${container.amount}ml`
                  }
                </Text>
              </TouchableOpacity>
            );
          })}

        </View>

        {/* Quick Adjust Control */}
        <View 
          style={[sketchCardInner, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, marginBottom: 14 }]}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.muted }}>Quick Adjust:</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
              onPress={() => adjustVolume(-50)}
              style={{
                backgroundColor: colors.cream,
                borderColor: colors.charcoal,
                borderWidth: 1.5,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 11, fontWeight: '800', color: colors.charcoal }}>-50ml</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => adjustVolume(50)}
              style={{
                backgroundColor: colors.cream,
                borderColor: colors.charcoal,
                borderWidth: 1.5,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 11, fontWeight: '800', color: colors.charcoal }}>+50ml</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inline Add Water Button */}
        <TouchableOpacity 
          onPress={handleAddWater}
          style={[sketchButtonPrimary, {
            width: '100%',
            height: 56,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 32,
          }]}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={colors.charcoal} />
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.charcoal, textTransform: 'uppercase', letterSpacing: 1 }}>
            Add {selectedAmount}ml Water
          </Text>
        </TouchableOpacity>

        {/* Recent Logs Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.charcoal }}>Today's Logs</Text>
            <View style={{
              backgroundColor: colors.salmonLight,
              borderColor: colors.charcoal,
              borderWidth: 1.5,
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: colors.charcoal, textTransform: 'uppercase', letterSpacing: 1 }}>
                Total: {todayIntake}ml
              </Text>
            </View>
          </View>

          {todayLogs.length === 0 ? (
            <View 
              style={[sketchCard, { padding: 32, alignItems: 'center', justifyContent: 'center' }]}
            >
              <Ionicons name="beer-outline" size={32} color={colors.mutedLight} style={{ marginBottom: 8 }} />
              <Text style={{ fontSize: 13, color: colors.muted, fontWeight: '600', textAlign: 'center' }}>No water logged today yet.</Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {todayLogs.map((log) => (
                <View 
                  key={log.id}
                  style={[sketchCardInner, { padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View 
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.tealSoft,
                        borderWidth: 1.5,
                        borderColor: colors.teal,
                      }}
                    >
                      <Ionicons name="water" size={18} color={colors.teal} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.charcoal }}>{getContainerLabel(log.containerType)}</Text>
                      <Text style={{ fontSize: 11, color: colors.muted, fontWeight: '600', marginTop: 2 }}>{formatTime(log.timestamp)}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: colors.teal }}>{log.amount}ml</Text>
                    <TouchableOpacity 
                      onPress={() => {
                        dispatch(removeDrink(log.id));
                        showToast({
                          message: `Deleted ${log.amount}ml water log`,
                          type: 'info',
                        });
                      }}
                      style={{ padding: 4 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
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
          style={{ flex: 1, backgroundColor: 'rgba(45, 52, 54, 0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}
        >
          <View 
            style={[sketchCard, { width: '100%', padding: 24, alignItems: 'center', borderRadius: 24 }]}
          >
            
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.charcoal, letterSpacing: 1, marginBottom: 24 }}>
              ENTER CUSTOM AMOUNT
            </Text>

            <TextInput
              value={customInput}
              onChangeText={setCustomInput}
              keyboardType="number-pad"
              placeholder="e.g. 350"
              placeholderTextColor={colors.mutedLight}
              autoFocus={true}
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: 28,
                fontWeight: '900',
                color: colors.charcoal,
                paddingVertical: 12,
                backgroundColor: colors.cream,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: colors.charcoal,
                marginBottom: 24,
              }}
            />

            {/* Actions Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity 
                onPress={() => setShowCustomModal(false)}
                style={[sketchButtonSecondary, { flex: 1, paddingVertical: 12, alignItems: 'center' }]}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.muted }}>CANCEL</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleCustomSubmit}
                style={[sketchButtonPrimary, { flex: 1, paddingVertical: 12, alignItems: 'center' }]}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.charcoal }}>SET VOLUME</Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}
