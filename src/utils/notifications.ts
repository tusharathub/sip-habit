import { Platform } from 'react-native';

let Notifications: any = null;
let isNotificationsAvailable = false;

try {
  // Dynamically require expo-notifications to prevent app crash if native module is missing
  Notifications = require('expo-notifications');
  
  if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    isNotificationsAvailable = true;
  }
} catch (error) {
  // Graceful fallback if native modules aren't compiled yet in custom dev client
  console.warn('expo-notifications native module is not available. Reminders will be simulated in memory.');
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (!isNotificationsAvailable) return true; // Simulated grant for development fallback
  
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  } catch (e) {
    console.warn('Failed to get notification permissions:', e);
    return true; // Fallback to allow scheduling attempts
  }
}

export async function scheduleDailyReminder(time: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  if (!isNotificationsAvailable) {
    console.log(`[SIMULATED REMINDER] Scheduled daily reminder for ${time}`);
    return `mock-notification-id-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  }

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(hour) || isNaN(minute)) return null;

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to Hydrate! 💧',
        body: 'Keep up your sip habit. Have a glass of water!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      } as any,
    });
    return notificationId;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
}

export async function cancelReminderNotification(notificationId: string): Promise<void> {
  if (Platform.OS === 'web' || !notificationId) return;
  if (!isNotificationsAvailable) {
    console.log(`[SIMULATED REMINDER] Cancelled reminder for ID: ${notificationId}`);
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}
