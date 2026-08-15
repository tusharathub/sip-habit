import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import {
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';


export type ToastType = 'success' | 'info' | 'warning' | 'danger';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const insets = useSafeAreaInsets();
  const [slideAnim] = useState(() => new Animated.Value(-150));
  const [opacityAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(0.9));
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [opacityAnim, scaleAnim, slideAnim]);

  const showToast = useCallback(({ message, type = 'success', duration = 3000 }: ToastOptions) => {
    // Cancel existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({ message, type, duration });

    // Reset animations
    slideAnim.setValue(-120);
    opacityAnim.setValue(0);
    scaleAnim.setValue(0.9);

    const topPosition = Platform.OS === 'ios' ? insets.top + 12 : Math.max(insets.top, 20) + 12;

    // Slide down + fade in + scale up
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: topPosition,
        useNativeDriver: true,
        tension: 65,
        friction: 9,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 9,
      }),
    ]).start();

    // Trigger haptic feedback depending on the toast type
    try {
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else if (type === 'danger') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } else if (type === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    } catch (e) {
      console.warn('Haptic feedback is not available:', e);
    }

    // Auto dismiss
    timeoutRef.current = setTimeout(() => {
      dismissToast();
    }, duration);
  }, [insets.top, opacityAnim, scaleAnim, slideAnim, dismissToast]);

  // Determine styles/icons based on type — SketchPad aesthetic
  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          iconColor: colors.teal,
          bgColor: colors.creamLight,
          textColor: colors.charcoal,
          borderColor: colors.charcoal,
        };
      case 'danger':
        return {
          icon: 'alert-circle' as const,
          iconColor: colors.danger,
          bgColor: colors.creamLight,
          textColor: colors.charcoal,
          borderColor: colors.charcoal,
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          iconColor: colors.warning,
          bgColor: colors.creamLight,
          textColor: colors.charcoal,
          borderColor: colors.charcoal,
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          iconColor: colors.teal,
          bgColor: colors.creamLight,
          textColor: colors.charcoal,
          borderColor: colors.charcoal,
        };
    }
  };

  const toastConfig = toast ? getToastConfig(toast.type || 'success') : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && toastConfig && (
        <Animated.View
          style={[
            styles.toastWrapper,
            {
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              opacity: opacityAnim,
              backgroundColor: toastConfig.bgColor,
              borderColor: toastConfig.borderColor,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={dismissToast}
            style={styles.touchable}
          >
            <Ionicons name={toastConfig.icon} size={22} color={toastConfig.iconColor} />
            <Text style={[styles.text, { color: toastConfig.textColor }]}>
              {toast.message}
            </Text>
            <Ionicons name="close" size={16} color={toastConfig.textColor} style={styles.closeIcon} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 16,
    borderWidth: 2.5,
    zIndex: 99999,
    ...Platform.select({
      ios: {
        shadowColor: colors.charcoal,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
      },
      android: {
        elevation: 10,
      },
    }),
    maxWidth: width - 40,
    alignSelf: 'center',
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 12,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    letterSpacing: 0.25,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  closeIcon: {
    opacity: 0.5,
    marginLeft: 4,
  },
});
