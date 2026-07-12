import React from 'react';
import {
  Text,
  View,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useAppSelector } from '../../store/hooks';
import { DrinkLog } from '../../store/slices/hydrationSlice';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  
  // Fetch values from Redux
  const logs = useAppSelector((state) => state.hydration.logs);
  const streak = useAppSelector((state) => state.hydration.streak);
  const dailyGoal = useAppSelector((state) => state.settings.dailyGoal);

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
      const percent = Math.min(100, Math.round((total / dailyGoal) * 100));
      
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

  // Consistency Calculation (Percentage of days target was met)
  const pastDays = weeklyData.filter(d => !d.isFuture);
  const targetMetDays = pastDays.filter(d => d.total >= dailyGoal).length;
  const consistencyRate = pastDays.length > 0 
    ? Math.round((targetMetDays / pastDays.length) * 100) 
    : 0;

  // History List: Show past logged days in descending order (exclude future days)
  const historyList = [...weeklyData]
    .filter(d => !d.isFuture)
    .reverse();

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
        <View className="w-10 h-10 rounded-full items-center justify-center bg-[#eceef0]">
          <Ionicons name="analytics" size={20} color="#006875" />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="px-5 pt-6"
      >
        {/* Header Section */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-[#191c1e] mb-1">Hydration Insights</Text>
          <Text className="text-sm text-[#3b494c]">Your weekly progress and hydration consistency.</Text>
        </View>

        {/* Main Analytics Card (Weekly Overview) */}
        <View className="bg-white border border-[#eceef0] rounded-3xl p-5 mb-5 shadow-sm">
          <View className="flex-row justify-between items-end mb-6">
            <View>
              <Text className="text-[10px] font-bold text-[#546A7E] tracking-widest uppercase mb-1">
                WEEKLY OVERVIEW
              </Text>
              <Text className="text-xl font-extrabold text-[#006875]">
                Avg. {averageIntakeL}L Daily
              </Text>
            </View>
            <View className="bg-[#00e5ff]/15 px-3 py-1 rounded-full border border-[#006875]/10">
              <Text className="text-xs font-bold text-[#006875]">
                GOAL: {(dailyGoal / 1000).toFixed(1)}L
              </Text>
            </View>
          </View>

          {/* Bar Chart Grid */}
          <View className="flex-row items-end justify-between h-48 gap-3 px-1">
            {weeklyData.map((dayData, idx) => (
              <View key={idx} className="flex-1 flex-col items-center gap-2 h-full justify-end">
                {/* Bar outline */}
                <View className="w-full bg-[#eceef0] rounded-t-full relative overflow-hidden h-[80%] flex-col justify-end">
                  {/* Liquid fill representing percentage */}
                  <View 
                    style={{ height: `${dayData.isFuture ? 0 : dayData.percent}%` }}
                    className="w-full bg-[#006875] rounded-t-full absolute bottom-0"
                  />
                </View>
                <Text className="text-[9px] font-bold text-[#8a9cae] uppercase">
                  {dayData.day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bento Insights Cards Row */}
        <View className="flex-row gap-4 mb-5">
          {/* Streak Card */}
          <View className="flex-1 bg-white border border-[#eceef0] rounded-3xl p-4 flex-row items-center gap-3.5 shadow-sm">
            <View className="w-12 h-12 rounded-2xl bg-[#d5e3ff] items-center justify-center">
              <Ionicons name="trophy" size={24} color="#001B3C" />
            </View>
            <View className="flex-1">
              <Text className="text-[9px] font-bold text-[#8a9cae] tracking-widest uppercase mb-0.5">
                BEST STREAK
              </Text>
              <Text className="text-base font-extrabold text-[#191c1e] truncate">
                {streak} Days
              </Text>
            </View>
          </View>

          {/* Consistency Card */}
          <View className="flex-1 bg-white border border-[#eceef0] rounded-3xl p-4 flex-row items-center gap-3.5 shadow-sm">
            <View className="w-12 h-12 rounded-2xl bg-[#bed5d8] items-center justify-center">
              <Ionicons name="calendar" size={24} color="#091f21" />
            </View>
            <View className="flex-1">
              <Text className="text-[9px] font-bold text-[#8a9cae] tracking-widest uppercase mb-0.5">
                CONSISTENCY
              </Text>
              <Text className="text-base font-extrabold text-[#191c1e]">
                {consistencyRate}%
              </Text>
            </View>
          </View>
        </View>

        {/* Daily Logs list */}
        <View className="bg-white border border-[#eceef0] rounded-3xl p-5 mb-5 shadow-sm">
          <Text className="text-sm font-bold text-[#191c1e] mb-4">Daily Summary Logs</Text>
          
          <View className="space-y-4">
            {historyList.map((dayData, idx) => {
              const isGoalMet = dayData.total >= dailyGoal;
              return (
                <View 
                  key={idx}
                  className="flex-row items-center justify-between p-1 rounded-lg"
                >
                  <View className="flex-row items-center gap-3.5">
                    {/* Status Badge Icon */}
                    <View className={`w-10 h-10 rounded-full items-center justify-center ${
                      isGoalMet ? 'bg-[#00e5ff]/20' : 'bg-[#eceef0]'
                    }`}>
                      <Ionicons 
                        name={isGoalMet ? 'checkmark' : 'close'} 
                        size={18} 
                        color={isGoalMet ? '#006875' : '#8a9cae'} 
                      />
                    </View>
                    
                    <View>
                      <Text className="text-[10px] font-bold text-[#191c1e] tracking-wider">
                        {dayData.dateStr}
                      </Text>
                      <Text className="text-sm font-semibold text-[#3b494c] mt-0.5">
                        {(dayData.total / 1000).toFixed(1)}L / {(dailyGoal / 1000).toFixed(1)}L
                      </Text>
                    </View>
                  </View>

                  <View className={`px-2.5 py-1 rounded-lg ${
                    isGoalMet ? 'bg-[#006875]/10' : 'bg-gray-100'
                  }`}>
                    <Text className={`text-[9px] font-bold uppercase tracking-widest ${
                      isGoalMet ? 'text-[#006875]' : 'text-[#8a9cae]'
                    }`}>
                      {isGoalMet ? 'Goal Met' : 'Missed'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Healthy Tip Card */}
        <View className="bg-white border border-[#eceef0] rounded-3xl p-5 relative overflow-hidden shadow-sm">
          <View className="z-10 max-w-[85%]">
            <Text className="text-base font-bold text-[#006875] mb-1">Healthy Tip</Text>
            <Text className="text-xs text-[#3b494c] leading-relaxed italic">
              "Drinking a glass of water first thing in the morning boosts your metabolism and improves cognitive performance throughout the day."
            </Text>
          </View>
          <View className="absolute -right-6 -bottom-6 opacity-[0.04]">
            <Ionicons name="water" size={120} color="#006875" />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
