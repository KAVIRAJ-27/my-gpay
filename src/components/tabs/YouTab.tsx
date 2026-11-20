import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { YouHeaderArt } from '../common/YouHeaderArt';
import { USER_PROFILE } from '@/data/mockData';
import { getActivePIN, updateSecurityPIN } from '@/services/auth';
import { getSetting, setSetting } from '@/services/database';

interface YouTabProps {
  onLock: () => void;
}

export function YouTab({ onLock }: YouTabProps) {
  const { lockSimulator } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  // Modals state
  const [showQrModal, setShowQrModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [modalItem, setModalItem] = useState<{ title: string; desc: string; icon: string } | null>(null);

  // Settings state inside SettingsModal
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [changePinVisible, setChangePinVisible] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const openSimpleModal = (title: string, desc: string, icon: string = 'information-circle-outline') => {
    setModalItem({ title, desc, icon });
  };

  const handleChangePin = async () => {
    if (currentPinInput !== getActivePIN()) {
      setPinError('Current PIN does not match');
      return;
    }
    if (!/^\d{4}$/.test(newPinInput)) {
      setPinError('New PIN must be 4 digits');
      return;
    }
    const success = await updateSecurityPIN(newPinInput);
    if (success) {
      Alert.alert('PIN Updated', 'Demo security PIN has been updated.');
      setChangePinVisible(false);
      setCurrentPinInput('');
      setNewPinInput('');
      setPinError(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* 1. TOP HEADER ART (NIGHT HILLS, TREE SILHOUETTE, AIRPLANE) */}
        <View style={styles.headerArtWrapper}>
          <YouHeaderArt />
          <TouchableOpacity
            style={styles.overflowBtn}
            activeOpacity={0.7}
            onPress={() => setShowOverflowMenu(true)}>
            <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 2. USER PROFILE HEADER */}
        <View style={styles.profileHeaderSection}>
          <View style={styles.profileInfoLeft}>
            <Text style={styles.profileName}>{USER_PROFILE.fullName}</Text>
            <Text style={styles.profileUpi}>UPI ID: {USER_PROFILE.upiId}</Text>
            <Text style={styles.profilePhone}>{USER_PROFILE.phone}</Text>
            
            {/* [✓] UPI number Pill */}
            <TouchableOpacity
              style={styles.upiNumberPill}
              activeOpacity={0.7}
              onPress={() => openSimpleModal('UPI Number', `Your mobile number ${USER_PROFILE.phone} is linked to receive money on G Pay.nu.`, 'checkmark-circle')}>
              <Ionicons name="checkmark-circle" size={16} color="#8AB4F8" style={{ marginRight: 6 }} />
              <Text style={styles.upiNumberText}>UPI number</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Photo Avatar with Mini QR Overlay */}
          <TouchableOpacity
            style={styles.avatarWrapper}
            activeOpacity={0.8}
            onPress={() => setShowQrModal(true)}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={38} color="#FFFFFF" />
            </View>
            <View style={styles.qrBadgeCircle}>
              <Ionicons name="qr-code" size={14} color="#131313" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 3. REWARDS & REFERRAL DUAL CARDS */}
        <View style={styles.rewardsRow}>
          {/* Card 1: 16 rewards / View now */}
          <TouchableOpacity
            style={[styles.rewardCard, { backgroundColor: '#382554' }]}
            activeOpacity={0.8}
            onPress={() => setShowRewardsModal(true)}>
            <Ionicons name="star" size={20} color="#E8DEF8" style={{ marginBottom: 8 }} />
            <Text style={styles.rewardCardTitle}>16 rewards</Text>
            <Text style={styles.rewardCardSub}>View now</Text>
          </TouchableOpacity>

          {/* Card 2: Get ₹121 / Refer a friend */}
          <TouchableOpacity
            style={[styles.rewardCard, { backgroundColor: '#1C3B43' }]}
            activeOpacity={0.8}
            onPress={() => setShowReferralModal(true)}>
            <Ionicons name="people" size={20} color="#A7F3D0" style={{ marginBottom: 8 }} />
            <Text style={styles.rewardCardTitle}>Get ₹121</Text>
            <Text style={styles.rewardCardSub}>Refer a friend</Text>
          </TouchableOpacity>
        </View>

        {/* 4. "SET UP PAYMENT METHODS 1/3" SECTION */}
        <View style={styles.paymentMethodsCard}>
          <TouchableOpacity
            style={styles.paymentMethodsHeader}
            activeOpacity={0.7}
            onPress={() => openSimpleModal('Payment Methods', 'Manage your linked bank accounts and credit cards.', 'card-outline')}>
            <Text style={styles.paymentMethodsTitle}>Set up payment methods 1/3</Text>
            <Ionicons name="chevron-forward" size={18} color="#8AB4F8" />
          </TouchableOpacity>

          <View style={styles.methodsRow}>
            {/* Bank account */}
            <TouchableOpacity
              style={styles.methodItem}
              activeOpacity={0.7}
              onPress={() => openSimpleModal('Bank Accounts', 'Indian Bank (••••3526) is linked as your primary demo account.', 'business')}>
              <View style={[styles.methodCircle, { borderColor: 'rgba(255, 255, 255, 0.2)' }]}>
                <Ionicons name="business" size={22} color="#8AB4F8" />
              </View>
              <Text style={styles.methodLabel}>Bank account</Text>
              <Text style={styles.methodSub}>1 account</Text>
            </TouchableOpacity>

            {/* RuPay credit card */}
            <TouchableOpacity
              style={styles.methodItem}
              activeOpacity={0.7}
              onPress={() => openSimpleModal('RuPay Credit Card', 'Link your RuPay credit card on UPI for seamless payments.', 'card')}>
              <View style={[styles.methodCircle, { backgroundColor: '#0B57D0', borderColor: 'transparent' }]}>
                <Ionicons name="card" size={20} color="#FFFFFF" />
                <View style={styles.plusBadge}>
                  <Ionicons name="add" size={12} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.methodLabel}>RuPay credit{'\n'}card</Text>
              <Text style={styles.methodSub}>Pay with UPI</Text>
            </TouchableOpacity>

            {/* UPI Lite */}
            <TouchableOpacity
              style={styles.methodItem}
              activeOpacity={0.7}
              onPress={() => openSimpleModal('UPI Lite', 'Load up to ₹2,000 for instant, PIN-free payments.', 'flash')}>
              <View style={[styles.methodCircle, { backgroundColor: '#0B57D0', borderColor: 'transparent' }]}>
                <Ionicons name="flash" size={20} color="#FFFFFF" />
                <View style={styles.plusBadge}>
                  <Ionicons name="add" size={12} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.methodLabel}>UPI Lite</Text>
              <Text style={styles.methodSub}>Pay PIN-free</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. MENU LIST ITEMS MATCHING SCREENSHOT 1 */}
        <View style={styles.menuListSection}>
          {/* Pay with credit or debit cards */}
          <TouchableOpacity
            style={styles.menuListItem}
            activeOpacity={0.7}
            onPress={() => openSimpleModal('Credit or Debit Cards', 'Add a card for online and tap-to-pay payments.', 'card-outline')}>
            <View style={styles.menuLeft}>
              <Ionicons name="card-outline" size={22} color="#FFFFFF" style={styles.menuIcon} />
              <View>
                <Text style={styles.menuTitle}>Pay with credit or debit cards</Text>
                <Text style={styles.menuSub}>Pay bills with your card</Text>
              </View>
            </View>
            <Text style={styles.menuActionBlue}>Add</Text>
          </TouchableOpacity>

          {/* Your QR code */}
          <TouchableOpacity
            style={styles.menuListItem}
            activeOpacity={0.7}
            onPress={() => setShowQrModal(true)}>
            <View style={styles.menuLeft}>
              <Ionicons name="qr-code-outline" size={22} color="#FFFFFF" style={styles.menuIcon} />
              <View>
                <Text style={styles.menuTitle}>Your QR code</Text>
                <Text style={styles.menuSub}>Use to receive money from any UPI app</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Autopay */}
          <TouchableOpacity
            style={styles.menuListItem}
            activeOpacity={0.7}
            onPress={() => openSimpleModal('Autopay', 'No pending autopay requests found for your account.', 'repeat-outline')}>
            <View style={styles.menuLeft}>
              <Ionicons name="repeat-outline" size={22} color="#FFFFFF" style={styles.menuIcon} />
              <View>
                <Text style={styles.menuTitle}>Autopay</Text>
                <Text style={styles.menuSub}>No pending requests</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Set up pocket money */}
          <TouchableOpacity
            style={styles.menuListItem}
            activeOpacity={0.7}
            onPress={() => openSimpleModal('Pocket Money', 'Help your family pay without needing a separate bank account.', 'heart-outline')}>
            <View style={styles.menuLeft}>
              <Ionicons name="heart-outline" size={22} color="#FFFFFF" style={styles.menuIcon} />
              <View>
                <Text style={styles.menuTitle}>Set up pocket money</Text>
                <Text style={styles.menuSub}>Help your family pay without a bank account</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={styles.menuListItem}
            activeOpacity={0.7}
            onPress={() => setShowSettingsModal(true)}>
            <View style={styles.menuLeft}>
              <Ionicons name="settings-outline" size={22} color="#FFFFFF" style={styles.menuIcon} />
              <Text style={styles.menuTitle}>Settings</Text>
            </View>
          </TouchableOpacity>

          {/* Manage Google account */}
          <TouchableOpacity
            style={styles.menuListItem}
            activeOpacity={0.7}
            onPress={() => openSimpleModal('Manage Account', `Logged in as ${USER_PROFILE.fullName} (${USER_PROFILE.upiId}).`, 'person-outline')}>
            <View style={styles.menuLeft}>
              <Ionicons name="person-outline" size={22} color="#FFFFFF" style={styles.menuIcon} />
              <Text style={styles.menuTitle}>Manage Google account</Text>
            </View>
          </TouchableOpacity>

          {/* Get help */}
          <TouchableOpacity
            style={styles.menuListItem}
            activeOpacity={0.7}
            onPress={() => openSimpleModal('Get Help', 'G Pay.nu simulated customer support & FAQs.', 'help-circle-outline')}>
            <View style={styles.menuLeft}>
              <Ionicons name="help-circle-outline" size={22} color="#FFFFFF" style={styles.menuIcon} />
              <Text style={styles.menuTitle}>Get help</Text>
            </View>
          </TouchableOpacity>

          {/* Language */}
          <TouchableOpacity
            style={styles.menuListItem}
            activeOpacity={0.7}
            onPress={() => openSimpleModal('Language', 'Current language: English (India).', 'globe-outline')}>
            <View style={styles.menuLeft}>
              <Ionicons name="globe-outline" size={22} color="#FFFFFF" style={styles.menuIcon} />
              <View>
                <Text style={styles.menuTitle}>Language</Text>
                <Text style={styles.menuSub}>English</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* QR CODE MODAL */}
      <Modal
        visible={showQrModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQrModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Your UPI QR Code</Text>
              <TouchableOpacity onPress={() => setShowQrModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.qrModalBody}>
              <View style={styles.qrCodeBox}>
                <Ionicons name="qr-code" size={180} color="#131313" />
              </View>
              <Text style={styles.qrNameText}>{USER_PROFILE.fullName}</Text>
              <Text style={styles.qrUpiText}>{USER_PROFILE.upiId}</Text>
              <Text style={styles.qrPhoneText}>Scan with any UPI app to pay</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* REWARDS MODAL */}
      <Modal
        visible={showRewardsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRewardsModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>16 Rewards Available</Text>
              <TouchableOpacity onPress={() => setShowRewardsModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.cibilModalContent}>
              <Ionicons name="gift" size={54} color="#FBBC04" style={{ marginBottom: 12 }} />
              <Text style={styles.scoreNumber}>₹1,240 Won</Text>
              <Text style={styles.scoreRating}>16 Active Coupons &amp; Scratch Cards</Text>
              <Text style={styles.scoreDesc}>
                Earned via simulated transactions on G Pay.nu. Scratch to reveal brand discounts!
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* REFERRAL MODAL */}
      <Modal
        visible={showReferralModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReferralModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Invite Friends &amp; Get ₹121</Text>
              <TouchableOpacity onPress={() => setShowReferralModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.cibilModalContent}>
              <Ionicons name="people" size={54} color="#81C995" style={{ marginBottom: 12 }} />
              <Text style={styles.scoreNumber}>GPAYNU27</Text>
              <Text style={styles.scoreRating}>Your Referral Code</Text>
              <Text style={styles.scoreDesc}>
                Get ₹121 cashback after each friend sends their first payment using G Pay.nu simulation.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* SETTINGS MODAL */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Settings &amp; Security</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {/* Theme Toggle */}
            <View style={styles.settingsRow}>
              <View>
                <Text style={styles.settingsLabel}>Dark Mode</Text>
                <Text style={styles.settingsSub}>Google Pay true dark theme</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#3C4043', true: '#0B57D0' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Change PIN */}
            <TouchableOpacity
              style={styles.settingsBtnRow}
              onPress={() => setChangePinVisible(!changePinVisible)}>
              <Text style={styles.settingsLabel}>Change 4-Digit Security PIN</Text>
              <Ionicons name={changePinVisible ? 'chevron-up' : 'chevron-down'} size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {changePinVisible && (
              <View style={styles.pinForm}>
                <TextInput
                  style={styles.pinInput}
                  placeholder="Current PIN (e.g. 1234)"
                  placeholderTextColor="#9AA0A6"
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={4}
                  value={currentPinInput}
                  onChangeText={setCurrentPinInput}
                />
                <TextInput
                  style={styles.pinInput}
                  placeholder="New 4-Digit PIN"
                  placeholderTextColor="#9AA0A6"
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={4}
                  value={newPinInput}
                  onChangeText={setNewPinInput}
                />
                {pinError && <Text style={styles.pinErrorText}>{pinError}</Text>}
                <TouchableOpacity style={styles.savePinBtn} onPress={handleChangePin}>
                  <Text style={styles.savePinBtnText}>Save New PIN</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Lock Simulator Button */}
            <TouchableOpacity
              style={styles.lockSimulatorBtn}
              onPress={() => {
                setShowSettingsModal(false);
                lockSimulator();
              }}>
              <Ionicons name="lock-closed" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.lockSimulatorBtnText}>Lock Simulator</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* GENERIC ACTION MODAL */}
      <Modal
        visible={modalItem !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setModalItem(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>{modalItem?.title}</Text>
              <TouchableOpacity onPress={() => setModalItem(null)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.cibilModalContent}>
              <Ionicons name={(modalItem?.icon as any) || 'information-circle'} size={48} color="#8AB4F8" style={{ marginBottom: 12 }} />
              <Text style={styles.scoreDesc}>{modalItem?.desc}</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* THREE-DOT OVERFLOW MENU MODAL */}
      <Modal
        visible={showOverflowMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOverflowMenu(false)}>
        <TouchableOpacity
          style={styles.menuBackdrop}
          activeOpacity={1}
          onPress={() => setShowOverflowMenu(false)}>
          <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowOverflowMenu(false);
                openSimpleModal('Get Help', 'G Pay.nu account help & simulated documentation.', 'help-circle');
              }}>
              <Text style={styles.menuItemText}>Get help</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowOverflowMenu(false);
                Alert.alert('Send Feedback', 'User feedback simulation.');
              }}>
              <Text style={styles.menuItemText}>Send feedback</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerArtWrapper: {
    position: 'relative',
    width: '100%',
  },
  overflowBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 8,
    zIndex: 10,
  },
  profileHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  profileInfoLeft: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileUpi: {
    fontSize: 14,
    color: '#9AA0A6',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: '#9AA0A6',
    marginBottom: 12,
  },
  upiNumberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#004A77',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  upiNumberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C2E7FF',
  },
  avatarWrapper: {
    position: 'relative',
    marginLeft: 16,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#2A2C34',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  qrBadgeCircle: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#131313',
  },
  rewardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  rewardCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
  },
  rewardCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  rewardCardSub: {
    fontSize: 12,
    color: '#E8EAED',
  },
  paymentMethodsCard: {
    marginHorizontal: 16,
    backgroundColor: '#1E1F21',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  paymentMethodsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  methodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  methodItem: {
    alignItems: 'center',
    width: '30%',
  },
  methodCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    position: 'relative',
  },
  plusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1A73E8',
    borderWidth: 2,
    borderColor: '#1E1F21',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  methodSub: {
    fontSize: 10,
    color: '#9AA0A6',
    marginTop: 2,
    textAlign: 'center',
  },
  menuListSection: {
    paddingHorizontal: 16,
  },
  menuListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  menuSub: {
    fontSize: 12,
    color: '#9AA0A6',
    marginTop: 2,
  },
  menuActionBlue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8AB4F8',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cibilModalContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  scoreNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scoreRating: {
    fontSize: 14,
    fontWeight: '700',
    color: '#81C995',
    marginBottom: 10,
  },
  scoreDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: '#9AA0A6',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  qrModalBody: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  qrCodeBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  qrNameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  qrUpiText: {
    fontSize: 14,
    color: '#8AB4F8',
    marginBottom: 8,
  },
  qrPhoneText: {
    fontSize: 12,
    color: '#9AA0A6',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsSub: {
    fontSize: 12,
    color: '#9AA0A6',
    marginTop: 2,
  },
  settingsBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  pinForm: {
    paddingVertical: 12,
    gap: 10,
  },
  pinInput: {
    backgroundColor: '#2A2C34',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#FFFFFF',
  },
  pinErrorText: {
    fontSize: 12,
    color: '#F28B82',
  },
  savePinBtn: {
    backgroundColor: '#0B57D0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  savePinBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lockSimulatorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  lockSimulatorBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: 16,
  },
  menuCard: {
    width: 160,
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});
