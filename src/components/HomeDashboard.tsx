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

import {
  USER_PROFILE,
  QUICK_ACTIONS,
  FICTIONAL_CONTACTS,
  DEMO_ACTIVITIES,
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
import { useAuth } from '@/context/AuthContext';
import { TabKey } from './CustomBottomNav';

interface HomeDashboardProps {
  onNavigateTab: (tab: TabKey) => void;
}

export function HomeDashboard({ onNavigateTab }: HomeDashboardProps) {
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

  // Send Money Screen state (Phase 5)
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [sendMoneyRecipient, setSendMoneyRecipient] = useState<AppContact | null>(null);
  const [sendMoneyPhone, setSendMoneyPhone] = useState<ContactPhoneNumber | null>(null);

  // Device Contacts cached for horizontal preview if permission is granted
  const [deviceContacts, setDeviceContacts] = useState<AppContact[]>([]);
  const [hasContactsPermission, setHasContactsPermission] = useState(false);

  // Dynamic demo balance state
  const [demoBalance, setDemoBalance] = useState(USER_PROFILE.demoBalance);

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

  const handleSelectActivity = (activity: DemoActivity) => {
    setSelectedAction({
      id: activity.id,
      title: activity.title,
      iconName: activity.iconName,
      description: `${activity.subtitle} • Amount: ₹${activity.amount.toLocaleString(
        'en-IN'
      )} (${activity.timestamp})`,
    });
    setShowActionModal(true);
  };

  const handleAddDemoCash = () => {
    setDemoBalance((prev) => prev + 500);
    setSelectedAction({
      id: 'add_cash',
      title: 'Demo Cash Added',
      iconName: 'checkmark-circle-outline',
      description: 'Added ₹500.00 to your simulated wallet. Offline simulation balance updated.',
    });
    setShowActionModal(true);
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
          activities={DEMO_ACTIVITIES}
          onSelectActivity={handleSelectActivity}
          onViewAll={() => onNavigateTab('activity')}
        />
      </ScrollView>

      {/* Full-Screen Contacts / Pay Anyone Modal */}
      <ContactsScreen
        visible={showContactsScreen}
        onClose={() => {
          setShowContactsScreen(false);
          refreshDeviceContacts();
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

      {/* Send Money Flow Modal (Phase 5 UI) */}
      <SendMoneyScreen
        visible={showSendMoney}
        recipient={sendMoneyRecipient}
        initialPhone={sendMoneyPhone}
        onClose={() => {
          setShowSendMoney(false);
          refreshDeviceContacts();
        }}
        onChangeRecipient={() => {
          setShowSendMoney(false);
          setShowContactsScreen(true);
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
