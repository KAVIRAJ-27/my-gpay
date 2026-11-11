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

import { Colors, Spacing, BorderRadius, Typography, CommonStyles } from '@/theme';
import { BrandMark } from './BrandMark';
import { DemoBadge } from './DemoBadge';
import { PinFallbackModal } from './PinFallbackModal';
import { useAuth } from '@/context/AuthContext';

export function AuthScreen() {
  const {
    isAuthenticating,
    authError,
    biometricStatus,
    authenticateBiometric,
    authenticatePIN,
    clearAuthError,
  } = useAuth();

  const [showPinModal, setShowPinModal] = useState(false);

  // Pulse animation for the fingerprint ring
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const handleBiometricPress = async () => {
    await authenticateBiometric();
  };

  const handlePinSuccess = () => {
    setShowPinModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <Text style={styles.brandTitle}>G Pay.nu</Text>
          <Text style={styles.brandSubtitle}>
            Next-Gen Local Wallet Simulator
          </Text>
        </View>

        {/* Biometric Card */}
        <View style={CommonStyles.card}>
          {/* Status Pill */}
          <View style={styles.statusPill}>
            <View
              style={[
                styles.statusDot,
                biometricStatus?.canAuthenticate
                  ? styles.statusDotActive
                  : styles.statusDotWarning,
              ]}
            />
            <Text style={styles.statusPillText}>
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
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            <View style={styles.sensorButton}>
              {isAuthenticating ? (
                <ActivityIndicator size="large" color={Colors.primary} />
              ) : (
                <MaterialCommunityIcons
                  name="fingerprint"
                  size={64}
                  color={
                    biometricStatus?.canAuthenticate
                      ? Colors.primary
                      : Colors.textSecondary
                  }
                />
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.sensorInstruction}>
            {biometricStatus?.canAuthenticate
              ? 'Touch the sensor or tap to unlock'
              : 'Sensor not available — use security PIN'}
          </Text>

          {/* Error Message */}
          {authError && (
            <View style={styles.errorBanner}>
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={Colors.danger}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.errorBannerText}>{authError}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionGroup}>
            {biometricStatus?.canAuthenticate && (
              <TouchableOpacity
                style={[CommonStyles.primaryButton, styles.primaryAction]}
                activeOpacity={0.8}
                disabled={isAuthenticating}
                onPress={handleBiometricPress}>
                <MaterialCommunityIcons
                  name="fingerprint"
                  size={20}
                  color={Colors.textInverse}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.primaryButtonText}>
                  {isAuthenticating ? 'Authenticating...' : 'Unlock with Fingerprint'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                CommonStyles.secondaryButton,
                !biometricStatus?.canAuthenticate && styles.primaryActionFallback,
              ]}
              activeOpacity={0.8}
              onPress={() => {
                clearAuthError();
                setShowPinModal(true);
              }}>
              <Ionicons
                name="key-outline"
                size={18}
                color={Colors.textPrimary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.buttonTextSecondary}>
                {biometricStatus?.canAuthenticate
                  ? 'Use Security PIN Instead'
                  : 'Unlock with Security PIN'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Device Diagnostics & Security Info */}
        <View style={styles.diagnosticsCard}>
          <View style={styles.diagnosticsHeader}>
            <Ionicons name="hardware-chip-outline" size={16} color={Colors.primary} />
            <Text style={styles.diagnosticsTitle}>Android Device Diagnostics</Text>
          </View>

          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Biometric Sensor:</Text>
            <Text
              style={[
                styles.diagValue,
                {
                  color: biometricStatus?.hasHardware
                    ? Colors.success
                    : Colors.warning,
                },
              ]}>
              {biometricStatus?.hasHardware ? 'Detected' : 'Unavailable'}
            </Text>
          </View>

          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Enrolled Biometrics:</Text>
            <Text
              style={[
                styles.diagValue,
                {
                  color: biometricStatus?.isEnrolled
                    ? Colors.success
                    : Colors.warning,
                },
              ]}>
              {biometricStatus?.isEnrolled ? 'Enrolled' : 'Not Enrolled'}
            </Text>
          </View>

          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Supported Types:</Text>
            <Text style={styles.diagValue}>
              {biometricStatus?.supportedTypes.length
                ? biometricStatus.supportedTypes.join(', ')
                : 'None'}
            </Text>
          </View>

          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Keyguard Level:</Text>
            <Text style={styles.diagValue}>
              {biometricStatus?.securityLevel || 'Loading...'}
            </Text>
          </View>

          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Target Device:</Text>
            <Text style={styles.diagValue}>Realme P4 (RMX5110)</Text>
          </View>

          <View style={styles.diagDivider} />

          <View style={styles.complianceRow}>
            <Ionicons
              name="shield-outline"
              size={13}
              color={Colors.textTertiary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.complianceText}>
              Zero-knowledge architecture. Biometric credentials never leave
              Android OS TEE.
            </Text>
          </View>
        </View>

        {/* Fallback PIN Modal */}
        <PinFallbackModal
          visible={showPinModal}
          onClose={() => setShowPinModal(false)}
          onSuccess={() => {
            authenticatePIN('1234');
            handlePinSuccess();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  brandTitle: {
    ...Typography.hero,
    marginTop: Spacing.md,
    color: Colors.textPrimary,
  },
  brandSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: Colors.success,
  },
  statusDotWarning: {
    backgroundColor: Colors.warning,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sensorContainer: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  pulseRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: Colors.primaryGlowStrong,
    backgroundColor: Colors.primaryGlow,
  },
  sensorButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.backgroundElevated,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  sensorInstruction: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerSurface,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  errorBannerText: {
    fontSize: 13,
    color: Colors.danger,
    fontWeight: '500',
    flex: 1,
  },
  actionGroup: {
    gap: Spacing.md,
  },
  primaryAction: {
    width: '100%',
  },
  primaryActionFallback: {
    borderColor: Colors.primary,
  },
  primaryButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextSecondary: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  diagnosticsCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xl,
  },
  diagnosticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 8,
  },
  diagnosticsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  diagLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  diagValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  diagDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  complianceText: {
    fontSize: 11,
    color: Colors.textTertiary,
    lineHeight: 16,
    flex: 1,
  },
});
