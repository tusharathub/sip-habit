/**
 * SketchPad-Inspired Theme for Sip Habit
 * ─────────────────────────────────────────
 * Warm, hand-drawn aesthetic with thick borders,
 * offset shadows, and cream/salmon/charcoal palette.
 */

import { Platform, ViewStyle, TextStyle } from 'react-native';

// ─── Color Tokens ───────────────────────────────────────
export const colors = {
  // Backgrounds
  cream:        '#F5F0E8',   // Page background (parchment)
  creamLight:   '#FAF8F3',   // Card backgrounds
  creamDark:    '#EDE7DB',   // Pressed/hover states

  // Primary
  charcoal:     '#2D3436',   // Borders, primary text, dark accents
  charcoalSoft: '#4A4E50',   // Slightly softer charcoal for secondary text

  // Accent – Salmon/Peach
  salmon:       '#E8C4B8',   // Primary buttons, highlights
  salmonLight:  '#F0D5CB',   // Light fills, tags
  salmonDark:   '#D4A494',   // Pressed salmon

  // Accent – Peach
  teal:         '#E8C4B8',   // Peach / Salmon
  tealLight:    '#F0D5CB',   // Light peach / salmon
  tealSoft:     'rgba(232, 196, 184, 0.18)', // Very light peach tint

  // Neutrals
  muted:        '#7A7A6E',   // Muted/secondary text
  mutedLight:   '#A8A89E',   // Lighter muted text
  border:       '#2D3436',   // Card borders (same as charcoal)
  borderLight:  'rgba(45, 52, 54, 0.15)', // Subtle inner borders
  
  // Functional
  white:        '#FFFFFF',
  black:        '#000000',
  danger:       '#C0392B',   // Warm red for delete actions
  dangerBg:     'rgba(192, 57, 43, 0.1)',
  success:      '#27AE60',
  successBg:    'rgba(39, 174, 96, 0.12)',
  warning:      '#E67E22',
  warningBg:    'rgba(230, 126, 34, 0.12)',
  flame:        '#E67E22',   // Streak flame color
};

// ─── Sketch Card Style ──────────────────────────────────
// The signature look: thick dark border + bottom-right offset shadow
export const sketchCard: ViewStyle = {
  backgroundColor: colors.creamLight,
  borderColor: colors.charcoal,
  borderWidth: 2.5,
  borderRadius: 18,
  // Offset shadow to mimic hand-drawn 3D sketch effect
  ...Platform.select({
    ios: {
      shadowColor: colors.charcoal,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 0,
    },
    android: {
      elevation: 6,
    },
  }),
};

// A lighter sketch card variant for inner/nested cards
export const sketchCardInner: ViewStyle = {
  backgroundColor: colors.cream,
  borderColor: colors.charcoal,
  borderWidth: 2,
  borderRadius: 14,
  ...Platform.select({
    ios: {
      shadowColor: colors.charcoal,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 0,
    },
    android: {
      elevation: 4,
    },
  }),
};

// ─── Sketch Button Styles ───────────────────────────────
export const sketchButtonPrimary: ViewStyle = {
  backgroundColor: colors.salmon,
  borderColor: colors.charcoal,
  borderWidth: 2.5,
  borderRadius: 14,
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
};

export const sketchButtonSecondary: ViewStyle = {
  backgroundColor: colors.creamLight,
  borderColor: colors.charcoal,
  borderWidth: 2.5,
  borderRadius: 14,
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
};

// ─── Sketch Pill (for tags, badges) ─────────────────────
export const sketchPill: ViewStyle = {
  backgroundColor: colors.salmonLight,
  borderColor: colors.charcoal,
  borderWidth: 1.5,
  borderRadius: 20,
  paddingHorizontal: 12,
  paddingVertical: 4,
};

// ─── Typography Presets ─────────────────────────────────
export const typography = {
  // Large headings
  heading: {
    fontSize: 26,
    fontWeight: '800' as TextStyle['fontWeight'],
    color: colors.charcoal,
    letterSpacing: -0.5,
  } satisfies TextStyle,

  // Section titles
  title: {
    fontSize: 18,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: colors.charcoal,
  } satisfies TextStyle,

  // Card section labels
  label: {
    fontSize: 10,
    fontWeight: '800' as TextStyle['fontWeight'],
    color: colors.muted,
    letterSpacing: 2,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  } satisfies TextStyle,

  // Body text
  body: {
    fontSize: 14,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: colors.charcoalSoft,
    lineHeight: 20,
  } satisfies TextStyle,

  // Small helper text
  caption: {
    fontSize: 11,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: colors.muted,
  } satisfies TextStyle,

  // Big numeric display
  bigNumber: {
    fontSize: 48,
    fontWeight: '900' as TextStyle['fontWeight'],
    color: colors.charcoal,
    letterSpacing: -1,
  } satisfies TextStyle,
};
