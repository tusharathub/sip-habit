import { requireNativeModule } from 'expo-modules-core';

export let WaterWidgetModule: any;
try {
  WaterWidgetModule = requireNativeModule('WaterWidgetModule');
} catch (e) {
  WaterWidgetModule = {
    updateWidgetData: (today: number, goal: number) => {
      console.log(`[SIMULATED WIDGET] updateWidgetData: today=${today}ml, goal=${goal}ml`);
    },
    getPendingLogs: async () => {
      return [];
    },
    clearPendingLogs: async () => {
      return;
    },
  };
}

export function updateWidgetData(today: number, goal: number) {
  if (WaterWidgetModule && typeof WaterWidgetModule.updateWidgetData === 'function') {
    try {
      WaterWidgetModule.updateWidgetData(today, goal);
    } catch (err) {
      console.warn('Failed to call updateWidgetData on native module:', err);
    }
  }
}

export async function getPendingLogs(): Promise<number[]> {
  if (WaterWidgetModule && typeof WaterWidgetModule.getPendingLogs === 'function') {
    try {
      return await WaterWidgetModule.getPendingLogs();
    } catch (err) {
      console.warn('Failed to call getPendingLogs on native module:', err);
    }
  }
  return [];
}

export async function clearPendingLogs(): Promise<void> {
  if (WaterWidgetModule && typeof WaterWidgetModule.clearPendingLogs === 'function') {
    try {
      await WaterWidgetModule.clearPendingLogs();
    } catch (err) {
      console.warn('Failed to call clearPendingLogs on native module:', err);
    }
  }
}
