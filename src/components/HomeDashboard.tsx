import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { HomeHeaderArt } from './common/HomeHeaderArt';
import { ActionPlaceholderModal } from './ActionPlaceholderModal';
import { ProfileModal } from './ProfileModal';
import { ContactsScreen } from './ContactsScreen';
import { RecipientPreviewModal } from './RecipientPreviewModal';
import { SendMoneyScreen } from './SendMoneyScreen';
import { QRScannerModal } from './QRScannerModal';
import { BankTransferModal } from './BankTransferModal';
import { BalanceManagementModal } from './BalanceManagementModal';
import { TabKey } from './CustomBottomNav';

import {
  USER_PROFILE,
  FICTIONAL_CONTACTS,
  FictionalContact,
  QuickActionItem,
} from '@/data/mockData';
import {
  AppContact,
  ContactPhoneNumber,
  checkContactsPermission,
  loadDeviceContacts,
} from '@/services/contacts';
import {
  getDemoBalance,
  getRecentDemoTransactions,
  addDemoFunds,
  DemoTransactionRecord,
} from '@/services/database';

interface HomeDashboardProps {
  onNavigateTab: (tab: TabKey) => void;
  balance?: number;
  onBalanceChange?: (newBalance: number) => void;
}

export function HomeDashboard({
  onNavigateTab,
  balance: propBalance,
  onBalanceChange,
}: HomeDashboardProps) {
  const { lockSimulator } = useAuth();
  const { colors } = useTheme();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedAction, setSelectedAction] = useState<QuickActionItem | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showContactsScreen, setShowContactsScreen] = useState(false);
  const [selectedContactForPreview, setSelectedContactForPreview] = useState<AppContact | null>(null);
  const [selectedPhone, setSelectedPhone] = useState<ContactPhoneNumber | null>(null);

  // Send Money Screen state
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [sendMoneyRecipient, setSendMoneyRecipient] = useState<AppContact | null>(null);
  const [sendMoneyPhone, setSendMoneyPhone] = useState<ContactPhoneNumber | null>(null);

  // QR Scanner state
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Bank Transfer state
  const [showBankTransfer, setShowBankTransfer] = useState(false);

  // Balance Management state
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  // Device Contacts
  const [deviceContacts, setDeviceContacts] = useState<AppContact[]>([]);
  const [hasContactsPermission, setHasContactsPermission] = useState(false);

  // Balance state
  const [demoBalance, setDemoBalance] = useState<number>(propBalance ?? USER_PROFILE.demoBalance);
  const [recentTransactions, setRecentTransactions] = useState<DemoTransactionRecord[]>([]);

  useEffect(() => {
    if (propBalance !== undefined) {
      setDemoBalance(propBalance);
    }
  }, [propBalance]);

  const refreshDatabaseData = useCallback(async () => {
    try {
      const bal = await getDemoBalance();
      setDemoBalance(bal);
      const txns = await getRecentDemoTransactions(5);
      setRecentTransactions(txns);
    } catch (err) {
      console.warn('Failed to refresh demo DB data:', err);
    }
  }, []);

  const refreshDeviceContacts = useCallback(async () => {
    try {
      const permState = await checkContactsPermission();
      const hasPerm = permState === 'granted';
      setHasContactsPermission(hasPerm);
      if (hasPerm) {
        const loaded = await loadDeviceContacts();
        setDeviceContacts(loaded);
      }
    } catch {
      // Fail-safe
    }
  }, []);

  useEffect(() => {
    refreshDatabaseData();
    refreshDeviceContacts();
  }, [refreshDatabaseData, refreshDeviceContacts]);

  // Contact Tap Handler
  const handleContactPress = (c: FictionalContact | AppContact) => {
    if ('phoneNumbers' in c && c.phoneNumbers && c.phoneNumbers.length > 0) {
      setSelectedContactForPreview(c as AppContact);
      setSelectedPhone(c.phoneNumbers[0]);
    } else {
      const converted: AppContact = {
        id: c.id,
        name: c.name,
        initials: (c as any).initials || c.name.slice(0, 2).toUpperCase(),
        primaryPhone: '+91 98765 43210',
        phoneNumbers: [
          {
            number: '+91 98765 43210',
            formattedNumber: '+91 98765 43210',
            label: 'mobile',
          },
        ],
      };
      setSendMoneyRecipient(converted);
      setSendMoneyPhone(converted.phoneNumbers[0]);
      setShowSendMoney(true);
    }
  };

  const handleClaimOffer = async () => {
    try {
      const res = await addDemoFunds(1000, 'Cashback Bonus Reward');
      setDemoBalance(res.newBalance);
      onBalanceChange?.(res.newBalance);
      await refreshDatabaseData();
      Alert.alert(
        '₹1,000 Cashback Claimed!',
        '₹1,000.00 has been credited to your Demo Balance (Indian Bank ••••3526). All transactions remain strictly local and simulated.',
        [{ text: 'Awesome' }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to claim offer');
    }
  };

  const openServiceModal = (title: string, desc: string, icon: string = 'flash-outline') => {
    setSelectedAction({
      id: 'service_' + title.toLowerCase().replace(/\s+/g, '_'),
      title,
      iconName: icon,
      description: `${desc}\n\nThis is an offline simulation. No real bill will be paid or bank account debited.`,
    });
    setShowActionModal(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* 1. TOP GOOGLE PAY SEARCH BAR */}
        <View style={styles.searchBarWrapper}>
          <TouchableOpacity
            style={[styles.searchBarContainer, { backgroundColor: colors.surface }]}
            activeOpacity={0.9}
            onPress={() => setShowContactsScreen(true)}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
              Pay friends and merchants
            </Text>
            <TouchableOpacity
              onPress={() => setShowProfileModal(true)}
              style={styles.profileAvatarButton}>
              <View style={styles.profileAvatarSmall}>
                <Ionicons name="person" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* 2. TOP LANDSCAPE ILLUSTRATION */}
        <HomeHeaderArt />

        {/* 3. PRIMARY QUICK ACTION TILES (4 BLUE ROUNDED RECTANGLES) */}
        <View style={styles.primaryActionsRow}>
          {/* Scan any QR code */}
          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.7}
            onPress={() => setShowQRScanner(true)}>
            <View style={styles.actionIconBox}>
              <Ionicons name="qr-code" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Scan any{'\n'}QR code</Text>
          </TouchableOpacity>

          {/* Pay anyone */}
          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.7}
            onPress={() => setShowContactsScreen(true)}>
            <View style={styles.actionIconBox}>
              <Ionicons name="person-add" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Pay{'\n'}anyone</Text>
          </TouchableOpacity>

          {/* Bank transfer */}
          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.7}
            onPress={() => setShowBankTransfer(true)}>
            <View style={styles.actionIconBox}>
              <Ionicons name="business" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Bank{'\n'}transfer</Text>
          </TouchableOpacity>

          {/* Mobile recharge */}
          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.7}
            onPress={() => openServiceModal('Mobile Recharge', 'Recharge any prepaid number or pay postpaid bills with demo funds.', 'phone-portrait')}>
            <View style={styles.actionIconBox}>
              <Ionicons name="phone-portrait" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>Mobile{'\n'}recharge</Text>
          </TouchableOpacity>
        </View>

        {/* 4. SECONDARY ACTION CHIPS (HORIZONTAL ROW) */}
        <View style={styles.secondaryChipsRow}>
          {/* Bank balance */}
          <TouchableOpacity
            style={[styles.secondaryChip, { backgroundColor: colors.surface }]}
            activeOpacity={0.7}
            onPress={() => setShowBalanceModal(true)}>
            <Ionicons name="business-outline" size={16} color={colors.primary} />
            <Text style={styles.secondaryChipText}>
              <Text style={styles.secondaryChipTitle}>Bank balance </Text>
              <Text style={styles.secondaryChipSub}>Check</Text>
            </Text>
          </TouchableOpacity>

          {/* Transactions See all */}
          <TouchableOpacity
            style={[styles.secondaryChip, { backgroundColor: colors.surface }]}
            activeOpacity={0.7}
            onPress={() => onNavigateTab('activity')}>
            <Ionicons name="time-outline" size={16} color="#81C995" />
            <Text style={styles.secondaryChipText}>
              <Text style={styles.secondaryChipTitle}>Transactions </Text>
              <Text style={styles.secondaryChipSub}>See all</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5. "SEND MONEY" SECTION (2 ROWS OF 4 CONTACTS) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Send money</Text>
          
          {/* Row 1 */}
          <View style={styles.contactsGridRow}>
            {/* Kaja Mutton Stall */}
            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => handleContactPress(FICTIONAL_CONTACTS[0])}>
              <View style={[styles.contactAvatar, { backgroundColor: '#8E24AA' }]}>
                <Text style={styles.contactAvatarText}>K</Text>
              </View>
              <Text style={styles.contactName} numberOfLines={2}>Kaja Mutton S...</Text>
            </TouchableOpacity>

            {/* Kishore Saravanan */}
            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => handleContactPress(FICTIONAL_CONTACTS[1])}>
              <View style={[styles.contactAvatar, { backgroundColor: '#E91E63' }]}>
                <Text style={styles.contactAvatarText}>K</Text>
              </View>
              <Text style={styles.contactName} numberOfLines={2}>Kishore Saravanan</Text>
            </TouchableOpacity>

            {/* Kanish */}
            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => handleContactPress(FICTIONAL_CONTACTS[2])}>
              <View style={[styles.contactAvatar, { backgroundColor: '#D81B60' }]}>
                <Text style={styles.contactAvatarText}>K</Text>
              </View>
              <Text style={styles.contactName} numberOfLines={2}>Kanish</Text>
            </TouchableOpacity>

            {/* JENITTABL ESSY */}
            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => handleContactPress(FICTIONAL_CONTACTS[3])}>
              <View style={[styles.contactAvatar, { backgroundColor: '#3F51B5' }]}>
                <Ionicons name="person" size={26} color="#FFFFFF" />
              </View>
              <Text style={styles.contactName} numberOfLines={2}>JENITTABL ESSY</Text>
            </TouchableOpacity>
          </View>

          {/* Row 2 */}
          <View style={styles.contactsGridRow}>
            {/* Mr G SUKUMAR */}
            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => handleContactPress(FICTIONAL_CONTACTS[4])}>
              <View style={[styles.contactAvatar, { backgroundColor: '#2E7D32' }]}>
                <Text style={styles.contactAvatarText}>M</Text>
              </View>
              <Text style={styles.contactName} numberOfLines={2}>Mr G SUKUMAR</Text>
            </TouchableOpacity>

            {/* Mr Sabesh E */}
            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => handleContactPress(FICTIONAL_CONTACTS[5])}>
              <View style={[styles.contactAvatar, { backgroundColor: '#689F38' }]}>
                <Text style={styles.contactAvatarText}>M</Text>
              </View>
              <Text style={styles.contactName} numberOfLines={2}>Mr Sabesh E</Text>
            </TouchableOpacity>

            {/* KATHIRVEL T */}
            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => handleContactPress(FICTIONAL_CONTACTS[6])}>
              <View style={[styles.contactAvatar, { backgroundColor: '#EF6C00' }]}>
                <Text style={styles.contactAvatarText}>K</Text>
              </View>
              <Text style={styles.contactName} numberOfLines={2}>KATHIRVEL T</Text>
            </TouchableOpacity>

            {/* More (Opens Contacts) */}
            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => setShowContactsScreen(true)}>
              <View style={[styles.contactAvatar, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
                <Ionicons name="chevron-down" size={24} color={colors.textPrimary} />
              </View>
              <Text style={styles.contactName}>More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. "BILLS & RECHARGES" SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Bills &amp; recharges</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => openServiceModal('Manage Bills', 'Manage recurring bills, autopay schedules, and payment reminders.', 'receipt-outline')}>
              <Text style={styles.sectionLink}>Manage &gt;</Text>
            </TouchableOpacity>
          </View>

          {/* Row 1 */}
          <View style={styles.contactsGridRow}>
            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => openServiceModal('Airtel Prepaid', 'Recharge simulated Airtel prepaid mobile numbers.', 'cellular-outline')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#E50914' }]}>
                <Ionicons name="cellular" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactName} numberOfLines={2}>Airtel{'\n'}Prepaid</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => openServiceModal('BSNL Prepaid', 'Recharge simulated BSNL numbers.', 'wifi-outline')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#1565C0' }]}>
                <Ionicons name="radio" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactName} numberOfLines={2}>BSNL{'\n'}Prepaid</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => openServiceModal('Google Play Recharge', 'Redeem Google Play gift codes for demo wallet simulation.', 'logo-google-playstore')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#34A853' }]}>
                <Ionicons name="logo-google-playstore" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactName} numberOfLines={2}>Google Play rech...</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => openServiceModal('Mobile Recharge', 'Fast recharge across all national telecom operators.', 'phone-portrait-outline')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#0B57D0' }]}>
                <Ionicons name="phone-portrait-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactName} numberOfLines={2}>Mobile{'\n'}recharge</Text>
            </TouchableOpacity>
          </View>

          {/* Row 2 */}
          <View style={styles.contactsGridRow}>
            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => openServiceModal('DTH / Cable TV', 'Pay Tata Play, Airtel DTH, Sun Direct bills.', 'tv-outline')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#0B57D0' }]}>
                <Ionicons name="tv-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactName} numberOfLines={2}>DTH /{'\n'}Cable TV</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => openServiceModal('Electricity Bill', 'Pay state electricity board bills instantly.', 'bulb-outline')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#0B57D0' }]}>
                <Ionicons name="bulb-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactName} numberOfLines={2}>Electricity</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => openServiceModal('FASTag Recharge', 'Recharge highway toll FASTag balance.', 'car-outline')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#0B57D0' }]}>
                <Ionicons name="car-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactName} numberOfLines={2}>FASTag{'\n'}recharge</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => openServiceModal('Postpaid Mobile', 'Pay monthly postpaid cellular connection bills.', 'receipt-outline')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#0B57D0' }]}>
                <Ionicons name="receipt-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactName} numberOfLines={2}>Postpaid{'\n'}mobile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 7. "CREDIT CARDS & LOANS" SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Credit cards &amp; loans</Text>
          <View style={styles.contactsGridRow}>
            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => openServiceModal('CIBIL Score: 785', 'Your simulated credit score is 785 (Excellent). Checked instantly.', 'speedometer-outline')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#0B57D0' }]}>
                <Ionicons name="speedometer-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactName}>CIBIL score</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => openServiceModal('Personal Loan', 'Pre-approved loan up to ₹40 lakh with simulated 10.5% interest.', 'wallet-outline')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#0B57D0' }]}>
                <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactName}>Personal{'\n'}loan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => openServiceModal('Flex Credit Card', 'Apply for simulated RuPay UPI credit card with zero annual fee.', 'card-outline')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#0B57D0' }]}>
                <Ionicons name="card-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactName}>Flex credit{'\n'}card</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => openServiceModal('Gold Loan', 'Doorstep gold loan simulation with minimum paperwork.', 'diamond-outline')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#0B57D0' }]}>
                <Ionicons name="diamond-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactName}>Gold loan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 8. "OFFERS & REWARDS" SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Offers &amp; rewards</Text>
          <View style={styles.contactsGridRow}>
            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => openServiceModal('16 Rewards Available', 'You have 16 active scratch cards and coupons won in simulation.', 'trophy')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#F9AB00' }]}>
                <Ionicons name="trophy" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactName}>Rewards</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => openServiceModal('Exclusive Offers', 'Explore merchant discounts and shopping vouchers.', 'pricetag')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#EA4335' }]}>
                <Ionicons name="pricetag" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactName}>Offers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => openServiceModal('Refer & Earn ₹121', 'Invite friends using code GPAYNU27 and get ₹121 demo cashback on first payment.', 'gift')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#1A73E8' }]}>
                <Ionicons name="gift" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactName}>Referrals</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => openServiceModal('Pocket Money', 'Set up family pocket money allowance wallets.', 'heart')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#E37400' }]}>
                <Ionicons name="heart" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.contactName}>Pocket{'\n'}money</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 9. PROMOTIONAL CASHBACK BANNER */}
        <View style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>Flat ₹1,000 for you!</Text>
            <Text style={styles.promoSubtitle}>Get cashback on loan disbursement</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={handleClaimOffer}>
              <Text style={styles.promoClaimBtn}>Claim now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.promoGraphic}>
            <View style={styles.promoGraphicPhone}>
              <Ionicons name="wallet" size={28} color="#34A853" />
            </View>
          </View>
        </View>

        {/* 10. "MANAGE YOUR MONEY" SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Manage your money</Text>

          {/* See transaction history */}
          <TouchableOpacity
            style={[styles.manageMoneyRow, { borderBottomColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => onNavigateTab('activity')}>
            <View style={styles.manageMoneyLeft}>
              <Ionicons name="time-outline" size={22} color={colors.textPrimary} style={styles.manageMoneyIcon} />
              <Text style={styles.manageMoneyText}>See transaction history</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Check bank balance */}
          <TouchableOpacity
            style={styles.manageMoneyRow}
            activeOpacity={0.7}
            onPress={() => setShowBalanceModal(true)}>
            <View style={styles.manageMoneyLeft}>
              <Ionicons name="business-outline" size={22} color={colors.textPrimary} style={styles.manageMoneyIcon} />
              <Text style={styles.manageMoneyText}>Check bank balance</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* FULL SCREEN MODALS */}
      <ContactsScreen
        visible={showContactsScreen}
        onClose={() => {
          setShowContactsScreen(false);
          refreshDeviceContacts();
          refreshDatabaseData();
        }}
        onSelectRecipient={(rec, ph) => {
          setShowContactsScreen(false);
          setSendMoneyRecipient(rec);
          setSendMoneyPhone(ph);
          setShowSendMoney(true);
        }}
      />

      <RecipientPreviewModal
        visible={selectedContactForPreview !== null}
        contact={selectedContactForPreview}
        selectedPhone={selectedPhone}
        onSelectPhone={setSelectedPhone}
        onClose={() => setSelectedContactForPreview(null)}
        onContinue={(rec, ph) => {
          setSelectedContactForPreview(null);
          setSendMoneyRecipient(rec);
          setSendMoneyPhone(ph);
          setShowSendMoney(true);
        }}
      />

      <SendMoneyScreen
        visible={showSendMoney}
        recipient={sendMoneyRecipient}
        initialPhone={sendMoneyPhone}
        currentBalance={demoBalance}
        onClose={() => {
          setShowSendMoney(false);
          refreshDeviceContacts();
          refreshDatabaseData();
        }}
        onChangeRecipient={() => {
          setShowSendMoney(false);
          setShowContactsScreen(true);
        }}
        onTransactionSuccess={(newBal) => {
          setDemoBalance(newBal);
          onBalanceChange?.(newBal);
          refreshDatabaseData();
        }}
      />

      <QRScannerModal
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
      />

      <BankTransferModal
        visible={showBankTransfer}
        currentBalance={demoBalance}
        onClose={() => {
          setShowBankTransfer(false);
          refreshDatabaseData();
        }}
        onTransferSuccess={(newBal) => {
          setDemoBalance(newBal);
          onBalanceChange?.(newBal);
          refreshDatabaseData();
        }}
      />

      <BalanceManagementModal
        visible={showBalanceModal}
        onClose={() => {
          setShowBalanceModal(false);
          refreshDatabaseData();
        }}
        onBalanceUpdated={(newBal) => {
          setDemoBalance(newBal);
          onBalanceChange?.(newBal);
          refreshDatabaseData();
        }}
      />

      <ActionPlaceholderModal
        action={selectedAction}
        visible={showActionModal}
        onClose={() => setShowActionModal(false)}
      />

      <ProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onLock={lockSimulator}
      />
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
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 2,
    zIndex: 10,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
  },
  profileAvatarButton: {
    padding: 2,
  },
  profileAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3C4043',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  actionItem: {
    alignItems: 'center',
    width: 76,
  },
  actionIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#0B57D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  secondaryChipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 24,
  },
  secondaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  secondaryChipText: {
    fontSize: 12,
  },
  secondaryChipTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryChipSub: {
    color: '#9AA0A6',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 26,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8AB4F8',
  },
  contactsGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  contactItem: {
    alignItems: 'center',
    width: 76,
  },
  contactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  contactAvatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contactName: {
    fontSize: 11,
    lineHeight: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    height: 28,
  },
  promoCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 26,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 12,
    color: '#9AA0A6',
    marginBottom: 8,
  },
  promoClaimBtn: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8AB4F8',
  },
  promoGraphic: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: 'rgba(52, 168, 83, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoGraphicPhone: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageMoneyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  manageMoneyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageMoneyIcon: {
    marginRight: 16,
  },
  manageMoneyText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
