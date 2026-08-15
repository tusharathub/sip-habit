import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../store/hooks';
import { DrinkLog } from '../../store/slices/hydrationSlice';
import { colors, sketchCard, sketchCardInner, sketchPill } from '../../theme';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  
  // Fetch values from Redux
  const logs = useAppSelector((state) => state.hydration.logs);
  const streak = useAppSelector((state) => state.hydration.streak);
  const dailyGoal = useAppSelector((state) => state.settings.dailyGoal);

  // Set default selected bar to today (0 to 6)
  const currentDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const [selectedBarIdx, setSelectedBarIdx] = useState<number>(currentDayIndex);

  // Helper: Find Monday of current week
  const getWeeklyData = (logs: DrinkLog[], dailyGoal: number) => {
    const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const today = new Date();
    
    // Find current day (0 = Sunday, 1 = Monday, etc.)
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    return daysOfWeek.map((dayName, idx) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + idx);
      
      // Filter logs for this specific date
      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return (
          logDate.getDate() === dayDate.getDate() &&
          logDate.getMonth() === dayDate.getMonth() &&
          logDate.getFullYear() === dayDate.getFullYear()
        );
      });
      
      const total = dayLogs.reduce((sum, log) => sum + log.amount, 0);
      const isTodayDate = 
        dayDate.getDate() === today.getDate() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getFullYear() === today.getFullYear();

      const dayGoal = isTodayDate 
        ? dailyGoal 
        : (dayLogs.length > 0 && dayLogs[0].dailyGoal ? dayLogs[0].dailyGoal : dailyGoal);
      const percent = Math.min(100, Math.round((total / dayGoal) * 100));
      
      // Format Date string
      const dateStr = dayDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }).toUpperCase();

      return {
        day: dayName,
        total,
        percent,
        dateStr,
        isFuture: dayDate > today,
        dailyGoal: dayGoal,
      };
    });
  };

  const weeklyData = getWeeklyData(logs, dailyGoal);

  // Stats Calculations
  const averageIntakeMl = Math.round(
    weeklyData.filter(d => !d.isFuture).reduce((sum, d) => sum + d.total, 0) / 
    Math.max(1, weeklyData.filter(d => !d.isFuture).length)
  );
  const averageIntakeL = (averageIntakeMl / 1000).toFixed(1);



  // History List: Show past logged days in descending order (exclude future days)
  const historyList = [...weeklyData]
    .filter(d => !d.isFuture)
    .reverse();

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
        {/* Header Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: colors.charcoal, marginBottom: 4, letterSpacing: -0.5 }}>Hydration Insights</Text>
          <Text style={{ fontSize: 13, color: colors.muted, fontWeight: '500' }}>Your weekly progress and hydration consistency.</Text>
        </View>

        {/* Main Analytics Card (Weekly Overview) */}
        <View style={[sketchCard, { padding: 20, marginBottom: 20 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <View>
              <Text style={{ fontSize: 10, fontWeight: '800', color: colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
                WEEKLY OVERVIEW
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: colors.charcoal }}>
                Avg. {averageIntakeL}L Daily
              </Text>
            </View>
            <View style={[sketchPill]}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: colors.charcoal }}>
                GOAL: {(dailyGoal / 1000).toFixed(1)}L
              </Text>
            </View>
          </View>

          {/* Bar Chart Grid */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 192, gap: 10, paddingHorizontal: 4 }}>
            {weeklyData.map((dayData, idx) => {
              const isSelected = selectedBarIdx === idx;
              return (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => setSelectedBarIdx(idx)}
                  activeOpacity={0.85}
                  style={{ flex: 1, alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}
                >
                  {/* Bar outline */}
                  <View 
                    style={{
                      width: '100%',
                      borderTopLeftRadius: 100,
                      borderTopRightRadius: 100,
                      position: 'relative',
                      overflow: 'hidden',
                      height: '80%',
                      justifyContent: 'flex-end',
                      borderWidth: isSelected ? 2 : 1.5,
                      borderColor: isSelected ? colors.charcoal : colors.mutedLight,
                      backgroundColor: isSelected ? colors.creamLight : colors.creamDark,
                    }}
                  >
                    {/* Liquid fill representing percentage */}
                    <View 
                      style={{
                        height: `${dayData.isFuture ? 0 : dayData.percent}%`,
                        width: '100%',
                        backgroundColor: isSelected ? colors.teal : colors.charcoal,
                        borderTopLeftRadius: 100,
                        borderTopRightRadius: 100,
                        position: 'absolute',
                        bottom: 0,
                      }}
                    />
                  </View>
                  <Text style={{
                    fontSize: 9,
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    color: isSelected ? colors.charcoal : colors.muted,
                    transform: [{ scale: isSelected ? 1.1 : 1 }],
                  }}>
                    {dayData.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Day Details Panel */}
          {selectedBarIdx !== null && (
            <View style={[sketchCardInner, { marginTop: 20, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <View>
                <Text style={{ fontSize: 9, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 1 }}>SELECTED DAY</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.charcoal, marginTop: 2 }}>{weeklyData[selectedBarIdx].dateStr}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12, fontWeight: '900', color: colors.teal }}>
                  {weeklyData[selectedBarIdx].total}ml / {weeklyData[selectedBarIdx].dailyGoal}ml
                </Text>
                <Text style={{ fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: colors.muted, marginTop: 2 }}>
                  {weeklyData[selectedBarIdx].total >= weeklyData[selectedBarIdx].dailyGoal ? 'Goal Met 🎉' : 'Missed 💧'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Bento Insights Cards Row */}
        <View style={{ flexDirection: 'row', gap: 14, marginBottom: 20 }}>
          {/* Streak Card */}
          <View 
            style={[sketchCard, { flex: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }]}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: colors.salmonLight,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: colors.charcoal,
            }}>
              <Ionicons name="trophy" size={24} color={colors.charcoal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>
                BEST STREAK
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '900', color: colors.charcoal }}>
                {streak} Days
              </Text>
            </View>
          </View>
 
          {/* Weekday Streak Fire Card */}
          <View 
            style={[sketchCard, { flex: 1, padding: 16, justifyContent: 'space-between' }]}
          >
            <Text style={{ fontSize: 9, fontWeight: '800', color: colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
              WEEKLY TARGETS
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              {weeklyData.map((d, idx) => {
                const isGoalMet = d.total >= d.dailyGoal;
                const letter = d.day === 'THU' ? 'T' : (d.day === 'SUN' || d.day === 'SAT' ? 'S' : d.day[0]);
                return (
                  <View key={idx} style={{ alignItems: 'center', gap: 6, flex: 1 }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: colors.muted }}>{letter}</Text>
                    <Ionicons 
                      name={isGoalMet && !d.isFuture ? "flame" : "flame-outline"} 
                      size={15} 
                      color={isGoalMet && !d.isFuture ? colors.flame : colors.mutedLight} 
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </View>
 
        {/* Daily Logs list */}
        <View style={[sketchCard, { padding: 20, marginBottom: 20 }]}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.charcoal, marginBottom: 16 }}>Daily Summary Logs</Text>
          
          <View style={{ gap: 12 }}>
            {historyList.map((dayData, idx) => {
              const isGoalMet = dayData.total >= dayData.dailyGoal;
              return (
                <View 
                  key={idx}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    {/* Status Badge Icon */}
                    <View 
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isGoalMet ? colors.tealSoft : colors.creamDark,
                        borderWidth: 1.5,
                        borderColor: isGoalMet ? colors.teal : colors.mutedLight,
                      }}
                    >
                      <Ionicons 
                        name={isGoalMet ? 'checkmark' : 'close'} 
                        size={18} 
                        color={isGoalMet ? colors.teal : colors.mutedLight} 
                      />
                    </View>
                    
                    <View>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: colors.charcoal, letterSpacing: 1 }}>
                        {dayData.dateStr}
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.muted, marginTop: 2 }}>
                        {(dayData.total / 1000).toFixed(1)}L / {(dayData.dailyGoal / 1000).toFixed(1)}L
                      </Text>
                    </View>
                  </View>

                  <View 
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 10,
                      backgroundColor: isGoalMet ? colors.salmonLight : colors.creamDark,
                      borderWidth: 1.5,
                      borderColor: isGoalMet ? colors.charcoal : colors.mutedLight,
                    }}
                  >
                    <Text style={{
                      fontSize: 9,
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: 1.5,
                      color: isGoalMet ? colors.charcoal : colors.muted,
                    }}>
                      {isGoalMet ? 'Goal Met' : 'Missed'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Healthy Tip Card */}
        <View 
          style={[sketchCard, { padding: 20, position: 'relative', overflow: 'hidden' }]}
        >
          <View style={{ zIndex: 10, maxWidth: '85%' }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.teal, marginBottom: 6 }}>Healthy Tip</Text>
            <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18, fontStyle: 'italic' }}>
              "Drinking a glass of water first thing in the morning boosts your metabolism and improves cognitive performance throughout the day."
            </Text>
          </View>
          <View style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.04 }}>
            <Ionicons name="water" size={120} color={colors.charcoal} />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
