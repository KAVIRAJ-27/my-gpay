import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, CommonStyles } from '@/theme';
import { USER_PROFILE } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';

interface YouTabProps {
  onLock: () => void;
}

export function YouTab({ onLock }: YouTabProps) {
  const { biometricStatus, authMethodUsed } = useAuth();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{USER_PROFILE.name.charAt(0)}</Text>
        </View>
        <Text style={styles.profileName}>{USER_PROFILE.fullName}</Text>
        <Text style={styles.profileUpi}>{USER_PROFILE.upiId}</Text>
        <Text style={styles.profilePhone}>{USER_PROFILE.phoneMasked}</Text>
      </View>

      {/* Security & Authentication Status Card */}
      <Text style={styles.sectionTitle}>Security & Access</Text>
      <View style={[CommonStyles.card, styles.card]}>
        <View style={styles.statusRow}>
          <View style={styles.statusIconBox}>
            <MaterialCommunityIcons
              name="fingerprint"
              size={22}
              color={Colors.primary}
            />
          </View>
          <View style={styles.statusDetails}>
            <Text style={styles.statusTitle}>Biometric Authentication</Text>
            <Text style={styles.statusSub}>
              {biometricStatus?.canAuthenticate
                ? 'Active & Enrolled (Fingerprint/Face)'
                : 'Unavailable (PIN Active)'}
            </Text>
          </View>
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>
              {biometricStatus?.canAuthenticate ? 'READY' : 'OFF'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statusRow}>
          <View style={styles.statusIconBox}>
            <Ionicons name="key-outline" size={20} color={Colors.brandNu} />
          </View>
          <View style={styles.statusDetails}>
            <Text style={styles.statusTitle}>Current Session Method</Text>
            <Text style={styles.statusSub}>
              Unlocked via{' '}
              <Text style={{ color: Colors.primary, fontWeight: '700' }}>
                {authMethodUsed === 'biometric' ? 'Android Biometrics' : 'Security PIN'}
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statusRow}>
          <View style={styles.statusIconBox}>
            <Ionicons name="hardware-chip-outline" size={20} color={Colors.textSecondary} />
          </View>
          <View style={styles.statusDetails}>
            <Text style={styles.statusTitle}>Keyguard Execution</Text>
            <Text style={styles.statusSub}>Realme P4 (RMX5110) • Android TEE</Text>
          </View>
        </View>
      </View>

      {/* Simulator Information Card */}
      <Text style={styles.sectionTitle}>Prototype Identity</Text>
      <View style={[CommonStyles.card, styles.card]}>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>Application Name:</Text>
          <Text style={styles.infoValue}>G Pay.nu</Text>
        </View>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>Build Stage:</Text>
          <Text style={styles.infoValue}>Phase 3 (Home Dashboard)</Text>
        </View>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>Mode:</Text>
          <Text style={[styles.infoValue, { color: Colors.warning }]}>
            Local Offline Simulation
          </Text>
        </View>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>Banking Status:</Text>
          <Text style={[styles.infoValue, { color: Colors.textTertiary }]}>
            Disconnected (Zero Access)
          </Text>
        </View>
      </View>

      {/* Lock Button */}
      <TouchableOpacity
        style={[CommonStyles.secondaryButton, styles.lockButton]}
        activeOpacity={0.8}
        onPress={onLock}>
        <Ionicons
          name="lock-closed-outline"
          size={18}
          color={Colors.danger}
          style={{ marginRight: 8 }}
        />
        <Text style={styles.lockText}>Lock Simulator Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 3,
    borderColor: Colors.borderLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  profileName: {
    ...Typography.title1,
    color: Colors.textPrimary,
  },
  profileUpi: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  profilePhone: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  sectionTitle: {
    ...Typography.title2,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusIconBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusDetails: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statusSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  activePill: {
    backgroundColor: Colors.successSurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  lockButton: {
    width: '100%',
    backgroundColor: Colors.dangerSurface,
    borderColor: Colors.dangerBorder,
    marginTop: Spacing.lg,
  },
  lockText: {
    color: Colors.danger,
    fontWeight: '700',
    fontSize: 14,
  },
});
