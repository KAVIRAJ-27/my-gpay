import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, CommonStyles } from '@/theme';
import { USER_PROFILE } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import { getActivePIN, updateSecurityPIN, verifySimulatedPIN } from '@/services/auth';
import { getSetting, setSetting } from '@/services/database';
import { DemoBadge } from '../DemoBadge';

interface YouTabProps {
  onLock: () => void;
}

export function YouTab({ onLock }: YouTabProps) {
  const { biometricStatus, authMethodUsed } = useAuth();

  // Profile data from SQLite app_settings
  const [fullName, setFullName] = useState(USER_PROFILE.fullName);
  const [phoneMasked, setPhoneMasked] = useState(USER_PROFILE.phoneMasked);
  const [upiId, setUpiId] = useState(USER_PROFILE.upiId);

  // Settings
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [activePinDisplay, setActivePinDisplay] = useState(getActivePIN());
  const [showPinValue, setShowPinValue] = useState(false);

  // Modals
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [changePinVisible, setChangePinVisible] = useState(false);

  // Edit Profile Form State
  const [tempName, setTempName] = useState(fullName);
  const [tempPhone, setTempPhone] = useState(phoneMasked);
  const [tempUpi, setTempUpi] = useState(upiId);

  // Change PIN Form State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccessMsg, setPinSuccessMsg] = useState<string | null>(null);

  // Load persisted profile and settings on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const savedName = await getSetting('profile_name', USER_PROFILE.fullName);
        const savedPhone = await getSetting('profile_phone', USER_PROFILE.phoneMasked);
        const savedUpi = await getSetting('profile_upi', USER_PROFILE.upiId);
        const bioSetting = await getSetting('biometrics_enabled', 'true');

        if (savedName) setFullName(savedName);
        if (savedPhone) setPhoneMasked(savedPhone);
        if (savedUpi) setUpiId(savedUpi);
        setBiometricsEnabled(bioSetting === 'true');
        setActivePinDisplay(getActivePIN());
      } catch (err) {
        console.warn('Failed to load profile settings:', err);
      }
    }
    loadProfile();
  }, []);

  // Save Profile Handler
  const handleSaveProfile = async () => {
    const cleanName = tempName.trim() || USER_PROFILE.fullName;
    const cleanPhone = tempPhone.trim() || USER_PROFILE.phoneMasked;
    const cleanUpi = tempUpi.trim() || USER_PROFILE.upiId;

    await setSetting('profile_name', cleanName);
    await setSetting('profile_phone', cleanPhone);
    await setSetting('profile_upi', cleanUpi);

    setFullName(cleanName);
    setPhoneMasked(cleanPhone);
    setUpiId(cleanUpi);
    setEditProfileVisible(false);
  };

  // Toggle Biometrics Handler
  const handleToggleBiometrics = async (val: boolean) => {
    setBiometricsEnabled(val);
    await setSetting('biometrics_enabled', val ? 'true' : 'false');
  };

  // Change PIN Submit Handler
  const handleChangePinSubmit = async () => {
    setPinError(null);
    setPinSuccessMsg(null);

    if (currentPinInput !== getActivePIN()) {
      setPinError('Current PIN does not match active security PIN');
      return;
    }

    if (!/^\d{4}$/.test(newPinInput)) {
      setPinError('New PIN must be exactly 4 numeric digits');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinError('New PIN and confirmation PIN do not match');
      return;
    }

    if (newPinInput === currentPinInput) {
      setPinError('New PIN cannot be identical to current PIN');
      return;
    }

    const success = await updateSecurityPIN(newPinInput);
    if (success) {
      setActivePinDisplay(newPinInput);
      setPinSuccessMsg('Security PIN updated successfully!');
      setTimeout(() => {
        setChangePinVisible(false);
        setCurrentPinInput('');
        setNewPinInput('');
        setConfirmPinInput('');
        setPinSuccessMsg(null);
      }, 1000);
    } else {
      setPinError('Failed to update PIN in local secure storage');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{fullName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.profileName}>{fullName}</Text>
        <Text style={styles.profileUpi}>{upiId}</Text>
        <Text style={styles.profilePhone}>{phoneMasked}</Text>

        <TouchableOpacity
          style={styles.editProfileBtn}
          activeOpacity={0.7}
          onPress={() => {
            setTempName(fullName);
            setTempPhone(phoneMasked);
            setTempUpi(upiId);
            setEditProfileVisible(true);
          }}>
          <Ionicons name="pencil-outline" size={14} color={Colors.primary} />
          <Text style={styles.editProfileBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Security & Authentication Status Card */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Security & Access</Text>
        <DemoBadge label="TEE KEYGUARD" />
      </View>

      <View style={[CommonStyles.card, styles.card]}>
        {/* Biometrics Toggle */}
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
                ? 'Hardware Ready (Fingerprint / Face)'
                : 'Sensor Unavailable (PIN Fallback)'}
            </Text>
          </View>
          <Switch
            value={biometricsEnabled && !!biometricStatus?.canAuthenticate}
            onValueChange={handleToggleBiometrics}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.textInverse}
            disabled={!biometricStatus?.canAuthenticate}
          />
        </View>

        <View style={styles.divider} />

        {/* Security PIN Config */}
        <View style={styles.statusRow}>
          <View style={styles.statusIconBox}>
            <Ionicons name="key-outline" size={20} color={Colors.brandNu} />
          </View>
          <View style={styles.statusDetails}>
            <Text style={styles.statusTitle}>Security PIN</Text>
            <Text style={styles.statusSub}>
              Active PIN:{' '}
              <Text style={{ color: Colors.primary, fontWeight: '700' }}>
                {showPinValue ? activePinDisplay : '••••'}
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.pinActionBtn}
            onPress={() => setShowPinValue(!showPinValue)}>
            <Ionicons
              name={showPinValue ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.changePinBtn}
            activeOpacity={0.7}
            onPress={() => {
              setCurrentPinInput('');
              setNewPinInput('');
              setConfirmPinInput('');
              setPinError(null);
              setPinSuccessMsg(null);
              setChangePinVisible(true);
            }}>
            <Text style={styles.changePinBtnText}>Change</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Current Session Method */}
        <View style={styles.statusRow}>
          <View style={styles.statusIconBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.success} />
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
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>AUTHENTICATED</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Hardware & TEE */}
        <View style={styles.statusRow}>
          <View style={styles.statusIconBox}>
            <Ionicons name="hardware-chip-outline" size={20} color={Colors.textSecondary} />
          </View>
          <View style={styles.statusDetails}>
            <Text style={styles.statusTitle}>Keyguard Execution</Text>
            <Text style={styles.statusSub}>Realme P4 (RMX5110) • Android 16 TEE</Text>
          </View>
        </View>
      </View>

      {/* Simulator Architecture & Privacy Card */}
      <Text style={styles.sectionTitle}>Privacy & Offline Architecture</Text>
      <View style={[CommonStyles.card, styles.card]}>
        <View style={styles.archRow}>
          <Ionicons name="server-outline" size={18} color={Colors.primary} />
          <View style={styles.archDetails}>
            <Text style={styles.archTitle}>100% Local SQLite Execution</Text>
            <Text style={styles.archDesc}>
              Zero external network servers or cloud data sync. All ledger entries, contacts,
              and settings reside exclusively in local encrypted storage.
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.archRow}>
          <Ionicons name="shield-outline" size={18} color={Colors.warning} />
          <View style={styles.archDetails}>
            <Text style={styles.archTitle}>Independent Demo Simulator</Text>
            <Text style={styles.archDesc}>
              This application has zero connectivity to NPCI, banks, UPI switches, or real
              monetary payment rails. No real currency is ever transferred.
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.archRow}>
          <Ionicons name="eye-off-outline" size={18} color={Colors.textSecondary} />
          <View style={styles.archDetails}>
            <Text style={styles.archTitle}>Zero Telemetry & Tracking</Text>
            <Text style={styles.archDesc}>
              No tracking identifiers, analytics payloads, or external crash reporters are
              bundled with this standalone build.
            </Text>
          </View>
        </View>
      </View>

      {/* Prototype Identity Card */}
      <Text style={styles.sectionTitle}>System Identity</Text>
      <View style={[CommonStyles.card, styles.card]}>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>Application Name:</Text>
          <Text style={styles.infoValue}>G Pay.nu</Text>
        </View>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>Build Pipeline:</Text>
          <Text style={styles.infoValue}>Master Phase 11 (Security & PIN)</Text>
        </View>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>Target Device:</Text>
          <Text style={styles.infoValue}>Realme P4 (RMX5110)</Text>
        </View>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>Database Engine:</Text>
          <Text style={styles.infoValue}>Expo SQLite v15</Text>
        </View>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>Banking Status:</Text>
          <Text style={[styles.infoValue, { color: Colors.textTertiary }]}>
            Disconnected (Zero Access)
          </Text>
        </View>
      </View>

      {/* Lock Simulator Button */}
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

      {/* ================= EDIT PROFILE MODAL ================= */}
      <Modal
        visible={editProfileVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditProfileVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Demo Profile</Text>
              <TouchableOpacity onPress={() => setEditProfileVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Display Name</Text>
            <TextInput
              style={styles.textInput}
              value={tempName}
              onChangeText={setTempName}
              placeholder="e.g. Kaviraj K."
              placeholderTextColor={Colors.textTertiary}
            />

            <Text style={styles.fieldLabel}>Masked Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={tempPhone}
              onChangeText={setTempPhone}
              placeholder="e.g. +91 98•••• 1234"
              placeholderTextColor={Colors.textTertiary}
            />

            <Text style={styles.fieldLabel}>Virtual UPI ID</Text>
            <TextInput
              style={styles.textInput}
              value={tempUpi}
              onChangeText={setTempUpi}
              placeholder="e.g. kaviraj@nuwallet"
              placeholderTextColor={Colors.textTertiary}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditProfileVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveProfile}>
                <Text style={styles.modalSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= CHANGE PIN MODAL ================= */}
      <Modal
        visible={changePinVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChangePinVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Security PIN</Text>
              <TouchableOpacity onPress={() => setChangePinVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Configure your 4-digit security PIN used for offline transaction authorization
              and biometric fallback.
            </Text>

            <Text style={styles.fieldLabel}>Current 4-Digit PIN</Text>
            <TextInput
              style={styles.textInput}
              value={currentPinInput}
              onChangeText={setCurrentPinInput}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="Enter current PIN (e.g. 1234)"
              placeholderTextColor={Colors.textTertiary}
            />

            <Text style={styles.fieldLabel}>New 4-Digit PIN</Text>
            <TextInput
              style={styles.textInput}
              value={newPinInput}
              onChangeText={setNewPinInput}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="Enter new 4 digits"
              placeholderTextColor={Colors.textTertiary}
            />

            <Text style={styles.fieldLabel}>Confirm New PIN</Text>
            <TextInput
              style={styles.textInput}
              value={confirmPinInput}
              onChangeText={setConfirmPinInput}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="Re-enter new 4 digits"
              placeholderTextColor={Colors.textTertiary}
            />

            {pinError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                <Text style={styles.errorBannerText}>{pinError}</Text>
              </View>
            )}

            {pinSuccessMsg && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.successBannerText}>{pinSuccessMsg}</Text>
              </View>
            )}

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setChangePinVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleChangePinSubmit}>
                <Text style={styles.modalSaveText}>Update PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
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
  pinActionBtn: {
    padding: 8,
    marginRight: 6,
  },
  changePinBtn: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  changePinBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  archRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 6,
  },
  archDetails: {
    flex: 1,
  },
  archTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  archDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
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
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 14, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.screenPadding,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 17,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 10,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.dangerSurface,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    padding: 8,
    borderRadius: BorderRadius.sm,
    marginTop: 12,
  },
  errorBannerText: {
    fontSize: 12,
    color: Colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.successSurface,
    borderWidth: 1,
    borderColor: Colors.successBorder,
    padding: 8,
    borderRadius: BorderRadius.sm,
    marginTop: 12,
  },
  successBannerText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '700',
    flex: 1,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: Spacing.lg,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  modalCancelText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  modalSaveText: {
    fontSize: 14,
    color: Colors.textInverse,
    fontWeight: '700',
  },
});
