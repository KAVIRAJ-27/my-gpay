/**
 * G Pay.nu Design System - Color Palette
 * Distinctive, modern dark theme designed for high-contrast OLED displays.
 * Completely original identity - independent of Google Pay branding.
 */

export const Colors = {
  // Base dark tones
  background: '#090D16',       // Deepest abyss obsidian
  backgroundElevated: '#101726', // Elevated layer
  surface: '#151E32',          // Card and container surface
  surfaceHover: '#1B2742',     // Active / pressed surface
  surfaceSubtle: '#0D1322',    // Recessed background

  // Borders & Dividers
  border: '#222F4C',           // Subtle card border
  borderLight: '#2E3F66',      // Focused / highlighted border
  divider: '#1A243B',

  // Primary Accent: Electric Cyan-Azure
  primary: '#00D2FF',
  primaryMuted: '#0084A3',
  primaryGlow: 'rgba(0, 210, 255, 0.15)',
  primaryGlowStrong: 'rgba(0, 210, 255, 0.35)',

  // Secondary Accent: Luminous Indigo
  secondary: '#6366F1',
  secondaryMuted: '#4338CA',
  secondaryGlow: 'rgba(99, 102, 241, 0.2)',

  // Brand Mark Highlight: Neon Teal / Nu
  brandNu: '#10E7C3',

  // Status colors
  success: '#10B981',
  successSurface: 'rgba(16, 185, 129, 0.12)',
  successBorder: 'rgba(16, 185, 129, 0.3)',

  warning: '#F59E0B',
  warningSurface: 'rgba(245, 158, 11, 0.12)',
  warningBorder: 'rgba(245, 158, 11, 0.3)',

  danger: '#EF4444',
  dangerSurface: 'rgba(239, 68, 68, 0.12)',
  dangerBorder: 'rgba(239, 68, 68, 0.3)',

  // Text Hierarchy
  textPrimary: '#F8FAFC',     // Crisp white/slate
  textSecondary: '#94A3B8',   // Medium slate
  textTertiary: '#64748B',    // Muted slate
  textInverse: '#090D16',

  // Persistent Demo Badge
  badgeBackground: 'rgba(0, 210, 255, 0.08)',
  badgeBorder: 'rgba(0, 210, 255, 0.25)',
  badgeText: '#38BDF8',
} as const;

export type ColorName = keyof typeof Colors;

