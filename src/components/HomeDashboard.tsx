import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/theme';
import { DashboardHeader } from './DashboardHeader';
import { BalanceCard } from './BalanceCard';
import { QuickActionsGrid } from './QuickActionsGrid';
import { PeoplePreview, ContactItemType } from './PeoplePreview';
import { RecentActivityPreview } from './RecentActivityPreview';
import { ActionPlaceholderModal } from './ActionPlaceholderModal';
import { NotificationModal } from './NotificationModal';
import { ProfileModal } from './ProfileModal';
import { ContactsScreen } from './ContactsScreen';
import { RecipientPreviewModal } from './RecipientPreviewModal';
import { SendMoneyScreen } from './SendMoneyScreen';
import { QRScannerModal } from './QRScannerModal';
import { BankTransferModal } from './BankTransferModal';
import { BalanceManagementModal } from './BalanceManagementModal';

import {
  USER_PROFILE,
  QUICK_ACTIONS,
  FICTIONAL_CONTACTS,
  QuickActionItem,
  DemoActivity,
  FictionalContact,
} from '@/data/mockData';
import {
  AppContact,
  ContactPhoneNumber,
  checkContactsPermission,
  loadDeviceContacts,
  maskPhoneNumber,
} from '@/services/contacts';
import {
  getDemoBalance,
  getRecentDemoTransactions,
  addDemoFunds,
  DemoTransactionRecord,
} from '@/services/database';
import { useAuth } from '@/context/AuthContext';
import { TabKey } from './CustomBottomNav';

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

  // Modals state
  const [selectedAction, setSelectedAction] = useState<QuickActionItem | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Contacts Screen state
  const [showContactsScreen, setShowContactsScreen] = useState(false);
  const [selectedContactForPreview, setSelectedContactForPreview] = useState<AppContact | null>(null);
  const [selectedPhone, setSelectedPhone] = useState<ContactPhoneNumber | null>(null);

  // Send Money Screen state (Phase 5/6)
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [sendMoneyRecipient, setSendMoneyRecipient] = useState<AppContact | null>(null);
  const [sendMoneyPhone, setSendMoneyPhone] = useState<ContactPhoneNumber | null>(null);

  // QR Scanner state (Phase 7)
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Bank Transfer state (Phase 8)
  const [showBankTransfer, setShowBankTransfer] = useState(false);

  // Balance Management state (Phase 9)
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  // Device Contacts cached for horizontal preview if permission is granted
  const [deviceContacts, setDeviceContacts] = useState<AppContact[]>([]);
  const [hasContactsPermission, setHasContactsPermission] = useState(false);

  // Local SQLite dynamic demo balance & recent transactions state (Phase 6)
  const [demoBalance, setDemoBalance] = useState<number>(propBalance ?? USER_PROFILE.demoBalance);
  const [recentTransactions, setRecentTransactions] = useState<DemoTransactionRecord[]>([]);

  // Sync propBalance if provided from parent
  useEffect(() => {
    if (propBalance !== undefined) {
      setDemoBalance(propBalance);
    }
  }, [propBalance]);

  // Refresh SQLite data on mount and after transactions
  const refreshDatabaseData = useCallback(async () => {
    try {
      const b = await getDemoBalance();
      setDemoBalance(b);
      onBalanceChange?.(b);
      const txns = await getRecentDemoTransactions(4);
      setRecentTransactions(txns);
    } catch {
      // Fail-safe
    }
  }, [onBalanceChange]);

  useEffect(() => {
    refreshDatabaseData();
  }, [refreshDatabaseData]);

  // Refresh device contacts if permission was already granted
  const refreshDeviceContacts = useCallback(async () => {
    try {
      const perm = await checkContactsPermission();
      if (perm === 'granted') {
        setHasContactsPermission(true);
        const list = await loadDeviceContacts();
        setDeviceContacts(list);
      } else {
        setHasContactsPermission(false);
      }
    } catch {
      // Fail-safe
    }
  }, []);

  useEffect(() => {
    refreshDeviceContacts();
  }, [refreshDeviceContacts]);

  const handleSelectQuickAction = (action: QuickActionItem) => {
    // Intercept "Pay anyone" quick action to open Contacts directly
    if (action.id === 'pay_anyone') {
      setShowContactsScreen(true);
      return;
    }

    // Intercept "Scan any QR" quick action to open Camera Scanner (Phase 7)
    if (action.id === 'scan_qr') {
      setShowQRScanner(true);
      return;
    }

    // Intercept "Bank transfer" quick action to open Bank Transfer Flow (Phase 8)
    if (action.id === 'bank_transfer') {
      setShowBankTransfer(true);
      return;
    }

    setSelectedAction(action);
    setShowActionModal(true);
  };

  const handleSelectContact = (contact: ContactItemType) => {
    if ('phoneNumbers' in contact) {
      // It's a real device contact -> open recipient preview
      setSelectedContactForPreview(contact as AppContact);
      setSelectedPhone((contact as AppContact).phoneNumbers[0] || null);
    } else {
      // Fictional contact -> adapt to AppContact structure
      const fictional = contact as FictionalContact;
      const adapted: AppContact = {
        id: fictional.id,
        name: fictional.name,
        initials: fictional.initials,
        phoneNumbers: [
          {
            label: 'mobile',
            number: '+919876543210',
            formattedNumber: '+91 98765 43210',
          },
        ],
        primaryPhone: '+919876543210',
      };
      setSelectedContactForPreview(adapted);
      setSelectedPhone(adapted.phoneNumbers[0]);
    }
  };

  const handleSelectRecipientFromContactsScreen = (
    contact: AppContact,
    phone: ContactPhoneNumber
  ) => {
    setShowContactsScreen(false);
    setSelectedContactForPreview(null);
    setSendMoneyRecipient(contact);
    setSendMoneyPhone(phone);
    setShowSendMoney(true);
  };

  const handleContinueFromRecipientPreview = (
    contact: AppContact,
    phone: ContactPhoneNumber
  ) => {
    setSelectedContactForPreview(null);
    setSendMoneyRecipient(contact);
    setSendMoneyPhone(phone);
    setShowSendMoney(true);
  };

  const handleSelectDemoTxn = (txn: DemoTransactionRecord) => {
    setSelectedAction({
      id: txn.id,
      title: `${txn.type === 'credit' ? 'Received from / Added' : 'Paid to'} ${txn.recipient_name}`,
      iconName:
        txn.category === 'topup'
          ? 'add-circle-outline'
          : txn.category === 'reset'
          ? 'refresh-outline'
          : txn.type === 'credit'
          ? 'arrow-down-circle-outline'
          : 'paper-plane-outline',
      description: `Amount: ₹${txn.amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
      })}\nStatus: ${txn.status}\nDate: ${txn.created_at_formatted}\nNote: ${
        txn.note || 'None'
      }\n\nLocal Demo Record ID: ${txn.id}\n(Stored in device SQLite — not a payment reference)`,
    });
    setShowActionModal(true);
  };

  const handleAddDemoCash = () => {
    setShowBalanceModal(true);
  };

  const handleOpenInfo = () => {
    setSelectedAction({
      id: 'sim_info',
      title: 'Simulation Architecture',
      iconName: 'information-circle-outline',
      description:
        'G Pay.nu is an independent local payment simulator. All balances, cards, contacts, and transactions are purely fictional and run completely offline.',
    });
    setShowActionModal(true);
  };

  const previewContacts: ContactItemType[] =
    hasContactsPermission && deviceContacts.length > 0
      ? deviceContacts.slice(0, 10)
      : FICTIONAL_CONTACTS;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <DashboardHeader
          userName={USER_PROFILE.name}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenNotifications={() => setShowNotificationsModal(true)}
          onLock={lockSimulator}
        />

        {/* Balance Card */}
        <BalanceCard
          balance={demoBalance}
          currencySymbol={USER_PROFILE.currencySymbol}
          bankName={USER_PROFILE.bankName}
          accountMasked={USER_PROFILE.accountNumberMasked}
          onOpenDetails={handleOpenInfo}
          onAddDemoCash={handleAddDemoCash}
        />

        {/* Quick Actions */}
        <QuickActionsGrid
          actions={QUICK_ACTIONS}
          onSelectAction={handleSelectQuickAction}
        />

        {/* People / Contacts Preview */}
        <PeoplePreview
          contacts={previewContacts}
          isRealContacts={hasContactsPermission && deviceContacts.length > 0}
          onSelectContact={handleSelectContact}
          onExploreMore={() => setShowContactsScreen(true)}
        />

        {/* Recent Activity */}
        <RecentActivityPreview
          activities={recentTransactions}
          onSelectActivity={handleSelectDemoTxn}
          onViewAll={() => onNavigateTab('activity')}
        />
      </ScrollView>

      {/* Full-Screen Contacts / Pay Anyone Modal */}
      <ContactsScreen
        visible={showContactsScreen}
        onClose={() => {
          setShowContactsScreen(false);
          refreshDeviceContacts();
          refreshDatabaseData();
        }}
        onSelectRecipient={handleSelectRecipientFromContactsScreen}
      />

      {/* Recipient Preview Modal (when tapping a contact from preview) */}
      <RecipientPreviewModal
        visible={selectedContactForPreview !== null}
        contact={selectedContactForPreview}
        selectedPhone={selectedPhone}
        onSelectPhone={setSelectedPhone}
        onClose={() => setSelectedContactForPreview(null)}
        onContinue={handleContinueFromRecipientPreview}
      />

      {/* Send Money Flow Modal (Phase 5/6 UI & Transaction Engine) */}
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

      {/* QR Code Camera Scanner Modal (Phase 7) */}
      <QRScannerModal
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
      />

      {/* Demo Bank Transfer Modal (Phase 8) */}
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

      {/* Demo Balance Management Modal (Phase 9) */}
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

      {/* Action Placeholder Modal */}
      <ActionPlaceholderModal
        action={selectedAction}
        visible={showActionModal}
        onClose={() => setShowActionModal(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onLock={lockSimulator}
      />

      {/* Notifications Modal */}
      <NotificationModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
});
