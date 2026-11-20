import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { Spacing, BorderRadius, Typography, CommonStyles } from '@/theme';
import { BrandMark } from './BrandMark';
import { DemoBadge } from './DemoBadge';
import { PinFallbackModal } from './PinFallbackModal';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export function AuthScreen() {
  const {
    isAuthenticating,
    authError,
    biometricStatus,
    authenticateBiometric,
    authenticatePIN,
    clearAuthError,
  } = useAuth();
  const { colors } = useTheme();

  const [showPinModal, setShowPinModal] = useState(false);

  // Pulse animation for the fingerprint ring
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const handleBiometricPress = async () => {
    await authenticateBiometric();
  };

  const handlePinSuccess = (pin: string) => {
    setShowPinModal(false);
    authenticatePIN(pin);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Top Persistent Badge */}
        <View style={styles.badgeContainer}>
          <DemoBadge />
        </View>

        {/* Brand Header */}
        <View style={styles.header}>
          <BrandMark size={76} showGlow />
          <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>G Pay.nu</Text>
          <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
            Next-Gen Local Wallet Simulator
          </Text>
        </View>

        {/* Biometric Card */}
        <View
          style={[
            CommonStyles.card,
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          {/* Status Pill */}
          <View
            style={[
              styles.statusPill,
              { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderLight },
            ]}>
            <View
              style={[
                styles.statusDot,
                biometricStatus?.canAuthenticate
                  ? { backgroundColor: colors.success }
                  : { backgroundColor: colors.warning },
              ]}
            />
            <Text style={[styles.statusPillText, { color: colors.textSecondary }]}>
              {biometricStatus?.canAuthenticate
                ? 'Biometric Sensor Ready'
                : 'Biometrics Unavailable (PIN Ready)'}
            </Text>
          </View>

          {/* Fingerprint Sensor Visual Target */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={
              biometricStatus?.canAuthenticate
                ? handleBiometricPress
                : () => setShowPinModal(true)
            }
            style={styles.sensorContainer}
            accessibilityLabel="Fingerprint sensor">
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  borderColor: colors.primaryGlowStrong,
                  backgroundColor: colors.primaryGlow,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            <View
              style={[
                styles.sensorButton,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                },
              ]}>
              {isAuthenticating ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <MaterialCommunityIcons
                  name="fingerprint"
                  size={64}
                  color={
                    biometricStatus?.canAuthenticate
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
              )}
            </View>
          </TouchableOpacity>

          <Text style={[styles.sensorInstruction, { color: colors.textSecondary }]}>
            {biometricStatus?.canAuthenticate
              ? 'Touch the sensor or tap to unlock'
              : 'Sensor not available — use security PIN'}
          </Text>

          {/* Error Message */}
          {authError && (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: colors.dangerSurface,
                  borderColor: colors.dangerBorder,
                },
              ]}>
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={colors.danger}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.errorBannerText, { color: colors.danger }]}>
                {authError}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionGroup}>
            {biometricStatus?.canAuthenticate && (
              <TouchableOpacity
                style={[
                  CommonStyles.primaryButton,
                  styles.primaryAction,
                  { backgroundColor: colors.primary },
                ]}
                activeOpacity={0.8}
                disabled={isAuthenticating}
                onPress={handleBiometricPress}>
                <MaterialCommunityIcons
                  name="fingerprint"
                  size={20}
                  color={colors.textInverse}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>
                  {isAuthenticating ? 'Authenticating...' : 'Unlock with Fingerprint'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                CommonStyles.secondaryButton,
                styles.secondaryAction,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => {
                clearAuthError();
                setShowPinModal(true);
              }}>
              <Ionicons
                name="key-outline"
                size={18}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.buttonTextSecondary, { color: colors.textPrimary }]}>
                {biometricStatus?.canAuthenticate
                  ? 'Use Security PIN Instead'
                  : 'Unlock with Security PIN'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Device Diagnostics & Security Info */}
        <View
          style={[
            styles.diagnosticsCard,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
            },
          ]}>
          <View style={styles.diagnosticsHeader}>
            <Ionicons name="hardware-chip-outline" size={16} color={colors.primary} />
            <Text style={[styles.diagnosticsTitle, { color: colors.textPrimary }]}>
              Android Device Diagnostics
            </Text>
          </View>
          <View style={styles.diagnosticRow}>
            <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>
              Biometric Sensor:
            </Text>
            <Text
              style={[
                styles.diagValue,
                {
                  color: biometricStatus?.hasHardware ? colors.success : colors.danger,
                },
              ]}>
              {biometricStatus?.hasHardware ? 'Detected' : 'Not Detected'}
            </Text>
          </View>
          <View style={styles.diagnosticRow}>
            <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>
              Enrolled Biometrics:
            </Text>
            <Text
              style={[
                styles.diagValue,
                {
                  color: biometricStatus?.isEnrolled ? colors.success : colors.warning,
                },
              ]}>
              {biometricStatus?.isEnrolled ? 'Enrolled' : 'Not Enrolled'}
            </Text>
          </View>
          <View style={styles.diagnosticRow}>
            <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>
              Supported Types:
            </Text>
            <Text style={[styles.diagValue, { color: colors.textPrimary }]}>
              {biometricStatus?.supportedTypes.length
                ? biometricStatus.supportedTypes.join(', ')
                : 'None'}
            </Text>
          </View>
          <View style={styles.diagnosticRow}>
            <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>
              Keyguard Level:
            </Text>
            <Text style={[styles.diagValue, { color: colors.textPrimary }]}>
              {biometricStatus?.securityLevel || 'N/A'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* PIN Fallback Modal */}
      <PinFallbackModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handlePinSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  badgeContainer: {
    marginBottom: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: Spacing.md,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sensorContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
  },
  sensorButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sensorInstruction: {
    fontSize: 14,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    width: '100%',
  },
  errorBannerText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  actionGroup: {
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  primaryAction: {
    width: '100%',
  },
  secondaryAction: {
    width: '100%',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  buttonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
  },
  diagnosticsCard: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
  },
  diagnosticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  diagnosticsTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  diagnosticRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  diagLabel: {
    fontSize: 12,
  },
  diagValue: {
    fontSize: 12,
    fontWeight: '600',
  },
});
