/**
 * G Pay.nu Design System - Typography
 */

import { TextStyle } from 'react-native';
import { Colors } from './colors';

export const Typography: Record<string, TextStyle> = {
  hero: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.8,
  },
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  title1: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  title2: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  bodyBold: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  badge: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  mono: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: Colors.primary,
  },
};

