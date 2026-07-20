import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface CelebrationOverlayProps {
  streak: number;
  dailyGoal: number;
  onDismiss: () => void;
}

interface Particle {
  id: number;
  color: string;
  isCircle: boolean;
  anim: Animated.ValueXY;
  scaleAnim: Animated.Value;
  rotateAnim: Animated.Value;
}

const CONFETTI_COLORS = [
  '#FFC107', // Amber Gold
  '#FF5722', // Deep Orange
  '#E91E63', // Pink
  '#00BCD4', // Cyan
  '#4CAF50', // Green
  '#9C27B0', // Purple
  '#FFEB3B', // Yellow
  '#03A9F4', // Light Blue
];

// Standard teal app colors
const colors = {
  card: '#FFFFFF',
  border: '#ECEEF0',
  accent: '#006875',
  textPrimary: '#191C1E',
  textSecondary: '#3B494C',
  background: '#F7F9FB',
  tabActiveBg: '#D5E3FF',
  buttonBackground: '#006875',
  buttonText: '#FFFFFF',
};
const isDark = false;

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  streak,
  dailyGoal,
  onDismiss,
}) => {
  // Dialog Card animations
  const [cardScale] = useState(() => new Animated.Value(0));
  const [cardOpacity] = useState(() => new Animated.Value(0));
  const [flameScale] = useState(() => new Animated.Value(0));
  const [backdropOpacity] = useState(() => new Animated.Value(0));

  // Initialize 45 confetti particles
  const [particles] = useState<Particle[]>(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      isCircle: i % 2 === 0,
      anim: new Animated.ValueXY({ x: 0, y: 0 }),
      scaleAnim: new Animated.Value(1),
      rotateAnim: new Animated.Value(0),
    }));
  });

  const startConfetti = () => {
    const animations = particles.map((p) => {
      // 1. Initial burst up and out
      const angle = Math.random() * 2 * Math.PI;
      const speed = 120 + Math.random() * 160;
      const burstX = Math.cos(angle) * speed;
      const burstY = -120 - Math.random() * 150 + Math.sin(angle) * 50;

      // 2. Falling down path
      const fallY = 450 + Math.random() * 150;
      const driftX = burstX + (Math.random() - 0.5) * 120;

      return Animated.sequence([
        // Stage 1: Explosion burst
        Animated.parallel([
          Animated.timing(p.anim.x, {
            toValue: burstX,
            duration: 650,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(p.anim.y, {
            toValue: burstY,
            duration: 650,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(p.rotateAnim, {
            toValue: Math.random() * 360,
            duration: 650,
            useNativeDriver: true,
          }),
        ]),
        // Stage 2: Drop downwards with gravity
        Animated.parallel([
          Animated.timing(p.anim.x, {
            toValue: driftX,
            duration: 1600,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(p.anim.y, {
            toValue: fallY,
            duration: 1600,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(p.rotateAnim, {
            toValue: Math.random() * 720 + 360,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(p.scaleAnim, {
            toValue: 0,
            duration: 1600,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.parallel(animations).start();
  };

  useEffect(() => {
    // 1. Success vibration
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      console.warn('Haptics failed', e);
    }

    // 2. Start backdrop fade in
    Animated.timing(backdropOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // 3. Start confetti
    startConfetti();

    // 4. Spring open card
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 45,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Spring bounce the streak flame icon
      Animated.spring(flameScale, {
        toValue: 1,
        tension: 80,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    // Fade out animations
    Animated.parallel([
      Animated.timing(cardScale, {
        toValue: 0.85,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  return (
    <Animated.View 
      style={[styles.container, { opacity: backdropOpacity }]}
    >
      {/* Dark backdrop */}
      <View style={styles.backdrop} />

      {/* Confetti Particles */}
      {particles.map((p) => (
        <Animated.View
          key={p.id}
          style={[
            styles.confetti,
            {
              borderRadius: p.isCircle ? 6 : 2,
              backgroundColor: p.color,
              transform: [
                { translateX: p.anim.x },
                { translateY: p.anim.y },
                { scale: p.scaleAnim },
                {
                  rotate: p.rotateAnim.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}

      {/* Card Content Container */}
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            transform: [{ scale: cardScale }],
            opacity: cardOpacity,
          },
        ]}
      >
        {/* Animated Badge Container */}
        <Animated.View 
          style={[
            styles.badgeBg,
            { 
              backgroundColor: colors.tabActiveBg,
              transform: [{ scale: flameScale }],
            }
          ]}
        >
          <Ionicons name="flame" size={54} color={isDark ? '#FF9100' : '#006875'} />
        </Animated.View>

        <Text style={[styles.title, { color: colors.accent }]}>
          GOAL MET! 🎉
        </Text>

        <Text style={[styles.subtitle, { color: colors.textPrimary }]}>
          Streak Extended!
        </Text>

        {/* Large Counter Box */}
        <View 
          style={[styles.counterBox, { backgroundColor: colors.background, borderColor: colors.border }]}
        >
          <Text style={[styles.counterText, { color: colors.textPrimary }]}>
            {streak}
          </Text>
          <Text style={[styles.counterLabel, { color: colors.accent }]}>
            DAY STREAK
          </Text>
        </View>

        <Text style={[styles.message, { color: colors.textSecondary }]}>
          Phenomenal job! You reached your goal of <Text style={{ fontWeight: '800', color: colors.textPrimary }}>{dailyGoal}ml</Text> today. Keep up the consistent sips to stay healthy!
        </Text>

        <TouchableOpacity
          onPress={handleClose}
          style={[styles.button, { backgroundColor: colors.buttonBackground }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>
            AMAZING!
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999999,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  confetti: {
    position: 'absolute',
    top: '38%',
    left: '50%',
    width: 10,
    height: 10,
    zIndex: 99999,
  },
  card: {
    width: width * 0.85,
    maxWidth: 340,
    borderRadius: 32,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    zIndex: 100000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  badgeBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.25,
    marginBottom: 20,
    textAlign: 'center',
  },
  counterBox: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
    minWidth: 140,
  },
  counterText: {
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 52,
  },
  counterLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  button: {
    width: '100%',
    height: 52,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
