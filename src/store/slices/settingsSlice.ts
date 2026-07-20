import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  dailyGoal: number;
  weight: number;
  reminderInterval: number;
  wakeTime: string;
  sleepTime: string;
  notificationsEnabled: boolean;
  name: string;
}

const initialState: SettingsState = {
  dailyGoal: 2500,
  weight: 70,
  reminderInterval: 60,
  wakeTime: '08:00',
  sleepTime: '22:00',
  notificationsEnabled: true,
  name: 'Hydration Hero',
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return {
        ...state,
        ...action.payload,
      };
    },

    resetSettings: () => initialState,
  },
});

export const { updateSettings, resetSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
