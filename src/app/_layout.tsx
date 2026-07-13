import "../global.css";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store";
import { useEffect } from "react";
import { AppState, Linking, Animated, Easing, StyleSheet, View, Text } from "react-native";
import { EventEmitter } from "expo-modules-core";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addDrink, updateStreak } from "../store/slices/hydrationSlice";
import { updateWidgetData, getPendingLogs, clearPendingLogs, WaterWidgetModule } from "../../modules/water-widget";
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from "react";

// Keep native splash screen visible until our custom layout mounts
SplashScreen.preventAutoHideAsync().catch(() => {});

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

interface AnimatedSplashScreenProps {
  onAnimationEnd: () => void;
}

function AnimatedSplashScreen({ onAnimationEnd }: AnimatedSplashScreenProps) {
  const dropletY = useRef(new Animated.Value(-300)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Hide the native splash screen as our animated overlay is now mounted
    SplashScreen.hideAsync().catch(() => {});

    // Run the brand animation timeline
    Animated.sequence([
      // 1. Water drop falls from top and bounces on impact
      Animated.timing(dropletY, {
        toValue: 0,
        duration: 900,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
      // 2. Expand water ripple and spring-in app brand text
      Animated.parallel([
        Animated.timing(rippleScale, {
          toValue: 4,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(rippleOpacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Display brand for a short period
      Animated.delay(1200),
      // 3. Smoothly fade out the splash screen overlay
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onAnimationEnd();
    });
  }, []);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: '#006875',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          opacity: splashOpacity,
        },
      ]}
    >
      <View className="items-center justify-center relative w-full h-80">
        {/* Ripple Ring */}
        <Animated.View
          style={{
            position: 'absolute',
            width: 80,
            height: 80,
            borderRadius: 40,
            borderWidth: 2.5,
            borderColor: 'rgba(0, 229, 255, 0.65)',
            transform: [{ scale: rippleScale }],
            opacity: rippleOpacity,
          }}
        />

        {/* Falling Droplet */}
        <Animated.View style={{ transform: [{ translateY: dropletY }] }}>
          <Ionicons name="water" size={84} color="#00e5ff" />
        </Animated.View>
      </View>

      {/* Brand Text */}
      <Animated.View
        style={{
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
          marginTop: 20,
          alignItems: 'center',
        }}
      >
        <Text className="text-4xl font-extrabold text-white tracking-tight">Sip Habit</Text>
        <Text className="text-xs text-cyan-200 font-semibold tracking-widest uppercase mt-2">
          Track Hydration • Stay Healthy
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

export default function RootLayout() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootContainer />
        {!isSplashComplete && (
          <AnimatedSplashScreen onAnimationEnd={() => setIsSplashComplete(true)} />
        )}
      </PersistGate>
    </Provider>
  );
}


