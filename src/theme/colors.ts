/**
 * G Pay.nu Design System - Color Palette
 * Clean, Google Pay inspired Material 3 color system supporting Light & Dark modes.
 * Independent demo wallet simulation identity.
 */

export const LightColors = {
  // Base light tones
  background: '#FFFFFF',           // Pure white
  backgroundElevated: '#F8F9FA',   // Soft Google gray
  surface: '#FFFFFF',              // Card and container surface
  surfaceHover: '#F1F3F4',         // Active / pressed surface
  surfaceSubtle: '#F0F4F9',        // Google Material 3 subtle chip surface
  surfaceVariant: '#F1F3F4',       // Subtle tonal surface container

  // Borders & Dividers
  border: '#E0E2EC',               // Subtle card border
  borderLight: '#EEF0F6',          // Highlighted / light border
  divider: '#F1F3F4',              // Clean divider

  // Primary Accent: Google Royal Blue
  primary: '#0B57D0',              // Main interactive blue
  primaryMuted: '#1A73E8',         // Azure accent
  primaryGlow: 'rgba(11, 87, 208, 0.08)',
  primaryGlowStrong: 'rgba(11, 87, 208, 0.16)',

  // Secondary Accent: Deep Teal / Slate Blue
  secondary: '#00639B',
  secondaryMuted: '#047DBF',
  secondaryGlow: 'rgba(0, 99, 155, 0.1)',

  // Brand Mark Highlight: Emerald Nu
  brandNu: '#00875A',

  // Status colors
  success: '#137333',              // Google Green
  successSurface: '#E6F4EA',
  successBorder: '#CEEAD6',

  warning: '#E37400',              // Google Amber
  warningSurface: '#FEF7E0',
  warningBorder: '#FEEFC3',

  danger: '#D93025',               // Google Red
  dangerSurface: '#FCE8E6',
  dangerBorder: '#FAD2CF',

  // Text Hierarchy
  textPrimary: '#1F1F1F',          // Google Charcoal near-black
  textSecondary: '#444746',        // Google Medium Gray
  textTertiary: '#747775',         // Muted placeholder / hint
  textInverse: '#FFFFFF',

  // Badges & Pills
  badgeBackground: '#E8F0FE',
  badgeBorder: '#D2E3FC',
  badgeText: '#1A73E8',

  pillActive: '#D3E3FD',
  pillActiveText: '#041E49',
  searchBar: '#F0F4F9',
  cardShadow: 'rgba(0, 0, 0, 0.06)',
};

export const DarkColors = {
  // Base dark tones
  background: '#131313',           // Exact sampled Google Pay dark background
  backgroundElevated: '#1E1F21',   // Elevated layer
  surface: '#1E1F21',              // Card and container surface
  surfaceHover: '#2A2C34',         // Active / pressed surface
  surfaceSubtle: '#25272E',        // Recessed / chip background
  surfaceVariant: '#2A2C34',       // Subtle tonal surface container

  // Borders & Dividers
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  divider: 'rgba(255, 255, 255, 0.06)',

  // Primary Accent: Google Material Dark Blue
  primary: '#8AB4F8',
  primaryMuted: '#669DF6',
  actionBlue: '#0B57D0',           // Action tile vibrant royal blue
  primaryGlow: 'rgba(138, 180, 248, 0.12)',
  primaryGlowStrong: 'rgba(138, 180, 248, 0.25)',

  // Secondary Accent: Soft Cyan
  secondary: '#78D9EC',
  secondaryMuted: '#4FB8CC',
  secondaryGlow: 'rgba(120, 217, 236, 0.15)',

  // Brand Mark Highlight: Emerald Nu
  brandNu: '#34A853',

  // Status colors
  success: '#81C995',
  successSurface: 'rgba(129, 201, 149, 0.14)',
  successBorder: 'rgba(129, 201, 149, 0.3)',

  warning: '#FDD663',
  warningSurface: 'rgba(253, 214, 99, 0.14)',
  warningBorder: 'rgba(253, 214, 99, 0.3)',

  danger: '#F28B82',
  dangerSurface: 'rgba(242, 139, 130, 0.14)',
  dangerBorder: 'rgba(242, 139, 130, 0.3)',

  // Text Hierarchy
  textPrimary: '#FFFFFF',
  textSecondary: '#C4C7C5',
  textTertiary: '#8E918F',
  textInverse: '#131313',

  // Badges & Pills
  badgeBackground: 'rgba(138, 180, 248, 0.12)',
  badgeBorder: 'rgba(138, 180, 248, 0.28)',
  badgeText: '#8AB4F8',

  pillActive: '#004A77',
  pillActiveText: '#C2E7FF',
  searchBar: '#1E1F21',
  cardShadow: 'rgba(0, 0, 0, 0.4)',
};

// Default export set to DarkColors matching the reference screenshots
export const Colors = DarkColors;

export type ThemeColors = typeof LightColors;
export type ColorName = keyof ThemeColors;
