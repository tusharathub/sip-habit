import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DrinkLog {
    id: string;
    amount: number;
    timestamp: string;
    containerType: 'cup' | 'bottle' | 'large' | 'custom';
    dailyGoal: number; // The goal active when logged
}

interface HydrationState {
    logs: DrinkLog[];
    todayIntake: number;
    streak: number;
    lastLoggedDate: string | null; // YYYY-MM-DD
    lastCelebratedDate: string | null; // YYYY-MM-DD
    showCelebration: boolean;
}

const initialState: HydrationState = {
    logs: [],
    todayIntake: 0,
    streak: 0,
    lastLoggedDate: null,
    lastCelebratedDate: null,
    showCelebration: false,
};

const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};

export const hydrationSlice = createSlice({
    name: 'hydration',
    initialState,
    reducers: {
        addDrink: (
            state,
            action: PayloadAction<{ amount: number; containerType: DrinkLog['containerType']; dailyGoal: number }>
        ) => {
            const newLog: DrinkLog = {
                id: Math.random().toString(36).substring(2, 9) + Date.now(),
                amount: action.payload.amount,
                containerType: action.payload.containerType,
                timestamp: new Date().toISOString(),
                dailyGoal: action.payload.dailyGoal,
            };

            state.logs.unshift(newLog);

            state.todayIntake += action.payload.amount;

            // Trigger celebration if goal is reached today
            const todayStr = new Date().toISOString().split('T')[0];
            if (state.todayIntake >= action.payload.dailyGoal && state.lastCelebratedDate !== todayStr) {
                state.lastCelebratedDate = todayStr;
                state.showCelebration = true;
            }
        },

        removeDrink: (state, action: PayloadAction<string>) => {
            const logToRemove = state.logs.find(log => log.id === action.payload);
            if (logToRemove) {
                if (isToday(logToRemove.timestamp)) {
                    state.todayIntake = Math.max(0, state.todayIntake - logToRemove.amount);
                }
                state.logs = state.logs.filter(log => log.id !== action.payload);
            }
        },

        syncTodayIntake: (state) => {
            state.todayIntake = state.logs
                .filter(log => isToday(log.timestamp))
                .reduce((sum, log) => sum + log.amount, 0);
        },

        updateStreak: (state, action: PayloadAction<{ dailyGoal: number }>) => {
            const todayStr = new Date().toISOString().split('T')[0];

            if (state.todayIntake >= action.payload.dailyGoal) {
                if (state.lastLoggedDate !== todayStr) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];

                    if (state.lastLoggedDate === yesterdayStr) {
                        state.streak += 1;
                    } else {
                        state.streak = 1;
                    }
                    state.lastLoggedDate = todayStr;
                }
            }
        },

        clearTodayLogs: (state) => {
            state.logs = state.logs.filter(log => !isToday(log.timestamp));
            state.todayIntake = 0;
        },

        dismissCelebration: (state) => {
            state.showCelebration = false;
        },

        resetHydration: () => initialState,
    },
    extraReducers: (builder) => {
        builder.addCase('persist/REHYDRATE', (state, action: any) => {
            if (action.payload && action.payload.hydration) {
                return {
                    ...state,
                    ...action.payload.hydration,
                    showCelebration: false,
                };
            }
            return state;
        });
    },
});

export const {
    addDrink,
    removeDrink,
    syncTodayIntake,
    updateStreak,
    clearTodayLogs,
    resetHydration,
    dismissCelebration,
} = hydrationSlice.actions;

export default hydrationSlice.reducer;
