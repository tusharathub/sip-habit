import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Reminder {
  id: string;
  time: string;
  enabled: boolean;
  notificationId?: string | null;
}

export interface RemindersState {
  list: Reminder[];
}

const initialState: RemindersState = {
  list: [
    { id: '1', time: '08:00', enabled: false, notificationId: null },
    { id: '2', time: '12:00', enabled: false, notificationId: null },
  ],
};

export const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    addReminder: (state, action: PayloadAction<Reminder>) => {
      state.list.push(action.payload);
    },
    toggleReminderState: (
      state,
      action: PayloadAction<{ id: string; enabled: boolean; notificationId?: string | null }>
    ) => {
      const reminder = state.list.find((r) => r.id === action.payload.id);
      if (reminder) {
        reminder.enabled = action.payload.enabled;
        if (action.payload.notificationId !== undefined) {
          reminder.notificationId = action.payload.notificationId;
        }
      }
    },
    removeReminder: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((r) => r.id !== action.payload);
    },
  },
});

export const { addReminder, toggleReminderState, removeReminder } = remindersSlice.actions;
export default remindersSlice.reducer;
