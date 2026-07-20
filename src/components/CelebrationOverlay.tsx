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
import { colors, sketchButtonPrimary } from '../theme';

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
  '#E8C4B8', // Salmon
  '#D4A494', // Warm coral / peach
  '#F0D5CB', // Light peach
  '#E67E22', // Warm orange
  '#F0D5CB', // Light salmon
  '#2D3436', // Charcoal
  '#C0392B', // Warm red
  '#27AE60', // Green
];

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
              transform: [{ scale: flameScale }],
            }
          ]}
        >
          <Ionicons name="flame" size={54} color={colors.charcoal} />
        </Animated.View>

        <Text style={styles.title}>
          GOAL MET! 🎉
        </Text>

        <Text style={styles.subtitle}>
          Streak Extended!
        </Text>

        {/* Large Counter Box */}
        <View style={styles.counterBox}>
          <Text style={styles.counterText}>
            {streak}
          </Text>
          <Text style={styles.counterLabel}>
            DAY STREAK
          </Text>
        </View>

        <Text style={styles.message}>
          Phenomenal job! You reached your goal of <Text style={{ fontWeight: '900', color: colors.charcoal }}>{dailyGoal}ml</Text> today. Keep up the consistent sips to stay healthy!
        </Text>

        <TouchableOpacity
          onPress={handleClose}
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
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
    backgroundColor: 'rgba(45, 52, 54, 0.72)',
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
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.charcoal,
    backgroundColor: colors.creamLight,
    padding: 24,
    alignItems: 'center',
    zIndex: 100000,
    ...Platform.select({
      ios: {
        shadowColor: colors.charcoal,
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 0,
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
    backgroundColor: colors.salmonLight,
    borderWidth: 2.5,
    borderColor: colors.charcoal,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 4,
    textAlign: 'center',
    color: colors.teal,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.25,
    marginBottom: 20,
    textAlign: 'center',
    color: colors.charcoal,
  },
  counterBox: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: colors.charcoal,
    backgroundColor: colors.cream,
    alignItems: 'center',
    marginBottom: 20,
    minWidth: 140,
    ...Platform.select({
      ios: {
        shadowColor: colors.charcoal,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  counterText: {
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 52,
    color: colors.charcoal,
  },
  counterLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 2,
    color: colors.teal,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 6,
    color: colors.muted,
  },
  button: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.salmon,
    borderWidth: 2.5,
    borderColor: colors.charcoal,
    ...Platform.select({
      ios: {
        shadowColor: colors.charcoal,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 0,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.charcoal,
  },
});
