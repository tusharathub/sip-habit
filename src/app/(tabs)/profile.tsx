import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { resetHydration } from '../../store/slices/hydrationSlice';
import { resetSettings, updateSettings } from '../../store/slices/settingsSlice';
import { colors, sketchButtonPrimary, sketchButtonSecondary, sketchCard, sketchCardInner } from '../../theme';


export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  // Fetch settings from Redux
  const settings = useAppSelector((state) => state.settings);
  const { dailyGoal, weight, reminderInterval, notificationsEnabled, name = 'Hydration Hero' } = settings;

  // Modal local state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState('');
  const [customNameInput, setCustomNameInput] = useState('');
  const [isHowToUseExpanded, setIsHowToUseExpanded] = useState(false);
  const [isWidgetGuideExpanded, setIsWidgetGuideExpanded] = useState(false);
  const [isWeightExpanded, setIsWeightExpanded] = useState(false);

  // Handle share action
  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Share the app with your friends, loved ones, or just people you think are thirsty! Check out Sip Habit: https://siphabit.fun',
        url: 'https://siphabit.fun',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  // Handle updates
  const handleCustomNameSubmit = () => {
    if (customNameInput.trim().length > 0) {
      dispatch(updateSettings({ name: customNameInput.trim() }));
    }
    setCustomNameInput('');
    setShowNameModal(false);
  };

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
    dispatch(resetHydration());
    setShowResetModal(false);
  };

  // Recommended Hydration logic: 35ml per kg of body weight
  const recommendedIntake = weight * 35;

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
        <TouchableOpacity 
          onPress={() => setShowResetModal(true)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 14,
            backgroundColor: colors.dangerBg,
            borderWidth: 1.5,
            borderColor: colors.danger,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 10, fontWeight: '800', color: colors.danger, textTransform: 'uppercase', letterSpacing: 1 }}>RESET</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20, paddingTop: 8 }}
      >
        {/* User Card */}
        <TouchableOpacity 
          onPress={() => {
            setCustomNameInput(name);
            setShowNameModal(true);
          }}
          activeOpacity={0.8}
          style={[sketchCard, { padding: 20, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 16 }]}
        >
          <View 
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.salmonLight,
              borderWidth: 2,
              borderColor: colors.charcoal,
            }}
          >
            <Ionicons name="person" size={28} color={colors.charcoal} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.charcoal }}>{name}</Text>
              <Ionicons name="pencil" size={14} color={colors.muted} />
            </View>
            <Text style={{ fontSize: 12, color: colors.muted, fontWeight: '600', marginTop: 2 }}>Stay healthy, stay refreshed</Text>
          </View>
        </TouchableOpacity>

        {/* Bento Card 1: Intake Goal Adjuster */}
        <View style={[sketchCard, { padding: 15, marginBottom: 8 }]}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
            DAILY INTAKE GOAL
          </Text>

          <View style={[sketchCardInner, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginBottom: 10 }]}>
            <TouchableOpacity 
              onPress={() => adjustGoal(-250)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.cream,
                borderWidth: 2,
                borderColor: colors.charcoal,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="remove" size={20} color={colors.charcoal} />
            </TouchableOpacity>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 28, fontWeight: '900', color: colors.charcoal, letterSpacing: -0.5 }}>{dailyGoal}ml</Text>
              <Text style={{ fontSize: 9, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', marginTop: 2 }}>TARGET</Text>
            </View>

            <TouchableOpacity 
              onPress={() => adjustGoal(250)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.cream,
                borderWidth: 2,
                borderColor: colors.charcoal,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color={colors.charcoal} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={() => setShowGoalModal(true)}
            style={[sketchButtonPrimary, { width: '100%', paddingVertical: 12, alignItems: 'center' }]}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 12, fontWeight: '800', color: colors.charcoal, textTransform: 'uppercase', letterSpacing: 1 }}>Set Custom Goal</Text>
          </TouchableOpacity>
        </View>

           {/* Bento Card 5: Share Sip Habit */}
        <View style={[sketchCard, { padding: 20, marginBottom: 20 }]}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
            SPREAD THE WORD
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, fontWeight: '600', lineHeight: 18, marginBottom: 8 }}>
            Share this app with your friends, loved ones, or just people you think are thirsty! 💧
          </Text>
          <TouchableOpacity 
            onPress={handleShare}
            style={[sketchButtonPrimary, { width: '100%', paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }]}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={18} color={colors.charcoal} />
            <Text style={{ fontSize: 12, fontWeight: '800', color: colors.charcoal, textTransform: 'uppercase', letterSpacing: 1 }}>Share App</Text>
          </TouchableOpacity>
        </View>

        {/* Bento Card 2: Information Section */}
        <View style={[sketchCard, { padding: 15, marginBottom: 8 }]}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            INFORMATION
          </Text>

          {/* Body Parameters (Weight Adjuster - Collapsible) */}
          <View style={[sketchCardInner, { marginBottom: 8, overflow: 'hidden', padding: 0, backgroundColor: colors.creamLight }]}>
            <TouchableOpacity 
              onPress={() => setIsWeightExpanded(!isWeightExpanded)}
              activeOpacity={0.7}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="fitness-outline" size={20} color={colors.teal} />
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.charcoal, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Body Weight Parameter
                </Text>
              </View>
              <Ionicons 
                name={isWeightExpanded ? "chevron-up" : "chevron-down"} 
                size={18} 
                color={colors.charcoal} 
              />
            </TouchableOpacity>

            {isWeightExpanded && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1.5, borderTopColor: colors.borderLight, paddingTop: 12 }}>
                <View style={[sketchCardInner, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, marginBottom: 10, backgroundColor: colors.cream }]}>
                  <TouchableOpacity 
                    onPress={() => adjustWeight(-5)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: colors.creamLight,
                      borderWidth: 1.5,
                      borderColor: colors.charcoal,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="remove" size={18} color={colors.charcoal} />
                  </TouchableOpacity>
                  
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: '900', color: colors.charcoal, letterSpacing: -0.5 }}>{weight} kg</Text>
                    <Text style={{ fontSize: 8, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', marginTop: 1 }}>CURRENT WEIGHT</Text>
                  </View>

                  <TouchableOpacity 
                    onPress={() => adjustWeight(5)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: colors.creamLight,
                      borderWidth: 1.5,
                      borderColor: colors.charcoal,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={18} color={colors.charcoal} />
                  </TouchableOpacity>
                </View>

                <View style={[sketchCardInner, { padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: colors.cream }]}>
                  <Ionicons name="bulb" size={16} color={colors.teal} style={{ marginTop: 1 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: colors.muted, lineHeight: 15 }}>
                      Ideal daily hydration is calculated at 35ml per kg of body weight. For you, the recommended target is <Text style={{ fontWeight: '800', color: colors.teal }}>{recommendedIntake}ml</Text>.
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* How to Use & Privacy (Collapsible Accordion) */}
          <View 
            style={[sketchCardInner, { marginBottom: 8, overflow: 'hidden', padding: 0, backgroundColor: colors.creamLight }]}
          >
            <TouchableOpacity 
              onPress={() => setIsHowToUseExpanded(!isHowToUseExpanded)}
              activeOpacity={0.7}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="help-circle-outline" size={20} color={colors.teal} />
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.charcoal, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  How to Use & Privacy
                </Text>
              </View>
              <Ionicons 
                name={isHowToUseExpanded ? "chevron-up" : "chevron-down"} 
                size={18} 
                color={colors.charcoal} 
              />
            </TouchableOpacity>

            {isHowToUseExpanded && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1.5, borderTopColor: colors.borderLight, paddingTop: 12 }}>
                {/* Quick Guide */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: colors.charcoal, marginBottom: 8 }}>Quick Guide</Text>
                  
                  {[
                    'Set your weight above to calculate a recommended daily target, or customize it to your liking.',
                    'On the main screen, select and tap a cup size to quickly log your water intake throughout the day.',
                    'Check the History and Log tabs to view detailed statistics and charts of your hydration progress.',
                    'Enable reminders to receive periodic local notifications that keep you on track.',
                  ].map((text, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <View style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 2,
                        backgroundColor: colors.salmonLight,
                        borderWidth: 1,
                        borderColor: colors.charcoal,
                      }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: colors.charcoal }}>{i + 1}</Text>
                      </View>
                      <Text style={{ fontSize: 11, color: colors.muted, flex: 1, lineHeight: 16 }}>{text}</Text>
                    </View>
                  ))}
                </View>

                <View style={{ height: 1, backgroundColor: colors.borderLight, marginVertical: 6 }} />

                {/* Privacy & Permissions */}
                <View style={{ marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={colors.teal} />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: colors.charcoal }}>Your Data, Your Device</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.muted, lineHeight: 16, marginBottom: 8 }}>
                    We highly value your privacy. The app is built with a local-first architecture:
                  </Text>
                  <View style={[sketchCardInner, { padding: 12, backgroundColor: colors.cream }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Ionicons name="cloud-offline-outline" size={14} color={colors.teal} />
                      <Text style={{ fontSize: 10, fontWeight: '800', color: colors.teal }}>100% On-Device & Offline</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: colors.muted, lineHeight: 15, marginBottom: 12 }}>
                      No user accounts, tracking, or cloud sync. Everything is stored locally on your device and never leaves it.
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                      <Ionicons name="notifications-outline" size={14} color={colors.teal} style={{ marginTop: 1 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: colors.teal }}>Notification Permission Only</Text>
                        <Text style={{ fontSize: 10, color: colors.muted, lineHeight: 15, marginTop: 2 }}>
                          We request notification permission strictly to trigger local reminders. No other permissions are collected.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Home Screen Widget */}
          <View 
            style={[sketchCardInner, { overflow: 'hidden', padding: 0, backgroundColor: colors.creamLight }]}
          >
            <TouchableOpacity 
              onPress={() => setIsWidgetGuideExpanded(!isWidgetGuideExpanded)}
              activeOpacity={0.7}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="grid-outline" size={20} color={colors.teal} />
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.charcoal, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Home Screen Widget
                </Text>
              </View>
              <Ionicons 
                name={isWidgetGuideExpanded ? "chevron-up" : "chevron-down"} 
                size={18} 
                color={colors.charcoal} 
              />
            </TouchableOpacity>

            {isWidgetGuideExpanded && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1.5, borderTopColor: colors.borderLight, paddingTop: 12 }}>
                <Text style={{ fontSize: 11, color: colors.muted, lineHeight: 16, marginBottom: 12 }}>
                  Track your daily progress and log drinks directly from your device home screen:
                </Text>

                {[
                  { text: <>Go to your phone's home screen, <Text style={{ fontWeight: '700', color: colors.charcoal }}>long-press</Text> empty space, and choose <Text style={{ fontWeight: '700', color: colors.charcoal }}>Widgets</Text>.</> },
                  { text: <>Locate <Text style={{ fontWeight: '700', color: colors.charcoal }}>Sip Habit</Text> in the widgets list.</> },
                  { text: <>Touch and hold the <Text style={{ fontWeight: '700', color: colors.charcoal }}>Sip Habit Progress</Text> widget, then drag it onto your screen.</> },
                  { text: <>Tap any of the logging buttons (<Text style={{ fontWeight: '700', color: colors.teal }}>+250</Text>, <Text style={{ fontWeight: '700', color: colors.teal }}>+500</Text>, <Text style={{ fontWeight: '700', color: colors.teal }}>+750</Text>) to record water instantly.</> },
                ].map((item, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                    <View style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 2,
                      backgroundColor: colors.salmonLight,
                      borderWidth: 1,
                      borderColor: colors.charcoal,
                    }}>
                      <Text style={{ fontSize: 9, fontWeight: '800', color: colors.charcoal }}>{i + 1}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: colors.muted, flex: 1, lineHeight: 16 }}>{item.text}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
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
          style={{ flex: 1, backgroundColor: 'rgba(45, 52, 54, 0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}
        >
          <View 
            style={[sketchCard, { width: '100%', padding: 24, alignItems: 'center', borderRadius: 24 }]}
          >
            
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.charcoal, letterSpacing: 1, marginBottom: 24 }}>
              ENTER DAILY TARGET (ml)
            </Text>

            <TextInput
              value={customGoalInput}
              onChangeText={setCustomGoalInput}
              keyboardType="number-pad"
              placeholder="e.g. 2750"
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
                onPress={() => setShowGoalModal(false)}
                style={[sketchButtonSecondary, { flex: 1, paddingVertical: 12, alignItems: 'center' }]}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.muted }}>CANCEL</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleCustomGoalSubmit}
                style={[sketchButtonPrimary, { flex: 1, paddingVertical: 12, alignItems: 'center' }]}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.charcoal }}>SAVE TARGET</Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Name Modal Dialog */}
      <Modal
        visible={showNameModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: 'rgba(45, 52, 54, 0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}
        >
          <View 
            style={[sketchCard, { width: '100%', padding: 24, alignItems: 'center', borderRadius: 24 }]}
          >
            
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.charcoal, letterSpacing: 1, marginBottom: 24 }}>
              ENTER YOUR NAME
            </Text>

            <TextInput
              value={customNameInput}
              onChangeText={setCustomNameInput}
              placeholder="e.g. John Doe"
              placeholderTextColor={colors.mutedLight}
              autoFocus={true}
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: 22,
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
                onPress={() => setShowNameModal(false)}
                style={[sketchButtonSecondary, { flex: 1, paddingVertical: 12, alignItems: 'center' }]}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.muted }}>CANCEL</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleCustomNameSubmit}
                style={[sketchButtonPrimary, { flex: 1, paddingVertical: 12, alignItems: 'center' }]}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.charcoal }}>SAVE NAME</Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        visible={showResetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: 'rgba(45, 52, 54, 0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}
        >
          <View 
            style={[sketchCard, { width: '100%', padding: 24, alignItems: 'center', borderRadius: 24 }]}
          >
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.dangerBg,
              borderWidth: 2.5,
              borderColor: colors.danger,
              marginBottom: 16,
            }}>
              <Ionicons name="alert-triangle-outline" size={32} color={colors.danger} />
            </View>

            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.charcoal, letterSpacing: 0.5, marginBottom: 12 }}>
              Reset Settings & Data?
            </Text>

            <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18, textAlign: 'center', marginBottom: 24 }}>
              This action will reset your daily goal target, body weight parameter, clear all logged water entries, and delete your active daily reminders. This cannot be undone.
            </Text>

            {/* Actions Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity 
                onPress={() => setShowResetModal(false)}
                style={[sketchButtonSecondary, { flex: 1, paddingVertical: 12, alignItems: 'center' }]}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.muted }}>CANCEL</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleReset}
                style={[sketchButtonPrimary, { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: colors.danger, borderColor: colors.charcoal }]}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.white }}>CONFIRM RESET</Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}
