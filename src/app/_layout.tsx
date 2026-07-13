import "../global.css";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store";
import { useEffect } from "react";
import { AppState, Linking } from "react-native";
import { EventEmitter } from "expo-modules-core";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addDrink, updateStreak } from "../store/slices/hydrationSlice";
import { updateWidgetData, getPendingLogs, clearPendingLogs, WaterWidgetModule } from "../../modules/water-widget";

function RootContainer() {
  const dispatch = useAppDispatch();
  const dailyGoal = useAppSelector((state) => state.settings.dailyGoal);
  const todayIntake = useAppSelector((state) => state.hydration.todayIntake);

  // Sync background-logged drinks from SharedPreferences queue
  const syncPendingLogs = async () => {
    try {
      const logs = await getPendingLogs();
      if (logs && logs.length > 0) {
        logs.forEach((amount) => {
          dispatch(addDrink({
            amount,
            containerType: 'custom',
            dailyGoal
          }));
        });
        dispatch(updateStreak({ dailyGoal }));
        await clearPendingLogs();
        console.log(`[WIDGET SYNC] Processed background logs: ${logs.join(", ")}`);
      }
    } catch (err) {
      console.warn("Failed to sync pending logs from widget:", err);
    }
  };

  useEffect(() => {
    // 1. Handle app launch/resume queue synchronization
    syncPendingLogs();

    const appStateSubscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        syncPendingLogs();
      }
    });

    // 2. Handle widget deep links (fallback context if active app opens)
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      if (url.includes("quick-add")) {
        const amountMatch = url.match(/[?&]amount=(\d+)/);
        if (amountMatch && amountMatch[1]) {
          const amount = parseInt(amountMatch[1], 10);
          if (!isNaN(amount)) {
            dispatch(addDrink({
              amount,
              containerType: 'custom',
              dailyGoal
            }));
            dispatch(updateStreak({ dailyGoal }));
            updateWidgetData(todayIntake + amount, dailyGoal);
            console.log(`[DEEP LINK] Added drink of amount: ${amount}ml`);
          }
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    const linkingSubscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      appStateSubscription.remove();
      linkingSubscription.remove();
    };
  }, [dispatch, dailyGoal, todayIntake]);

  // 3. Listen to real-time widget background button clicks if the React Native environment is active
  useEffect(() => {
    const emitter = new EventEmitter(WaterWidgetModule);
    const eventSubscription = (emitter as any).addListener("onWidgetLog", (event: any) => {
      const amount = event.amount;
      if (amount > 0) {
        dispatch(addDrink({
          amount,
          containerType: 'custom',
          dailyGoal
        }));
        dispatch(updateStreak({ dailyGoal }));
        // Clean queue immediately since it is handled in memory in real-time
        clearPendingLogs();
        console.log(`[WIDGET EVENT] Logged ${amount}ml in real-time`);
      }
    });

    return () => {
      eventSubscription.remove();
    };
  }, [dispatch, dailyGoal]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootContainer />
      </PersistGate>
    </Provider>
  );
}


