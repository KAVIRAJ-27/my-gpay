import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/theme';
import { DashboardHeader } from './DashboardHeader';
import { BalanceCard } from './BalanceCard';
import { QuickActionsGrid } from './QuickActionsGrid';
import { PeoplePreview } from './PeoplePreview';
import { RecentActivityPreview } from './RecentActivityPreview';
import { ActionPlaceholderModal } from './ActionPlaceholderModal';
import { NotificationModal } from './NotificationModal';
import { ProfileModal } from './ProfileModal';

import {
  USER_PROFILE,
  QUICK_ACTIONS,
  FICTIONAL_CONTACTS,
  DEMO_ACTIVITIES,
  QuickActionItem,
  FictionalContact,
  DemoActivity,
} from '@/data/mockData';
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

  // Dynamic demo balance state
  const [demoBalance, setDemoBalance] = useState(USER_PROFILE.demoBalance);

  const handleSelectQuickAction = (action: QuickActionItem) => {
    setSelectedAction(action);
    setShowActionModal(true);
  };

  const handleSelectContact = (contact: FictionalContact) => {
    setSelectedAction({
      id: contact.id,
      title: `Pay ${contact.name}`,
      iconName: 'person-circle-outline',
      description: `Simulated payment interface for demo contact: ${contact.handle}`,
    });
    setShowActionModal(true);
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
          contacts={FICTIONAL_CONTACTS}
          onSelectContact={handleSelectContact}
          onExploreMore={() => {
            setSelectedAction({
              id: 'explore_people',
              title: 'Explore Contacts',
              iconName: 'people-outline',
              description: 'Phonebook integration will be introduced in Phase 4. Fictional sample contacts only.',
            });
            setShowActionModal(true);
          }}
        />

        {/* Recent Activity */}
        <RecentActivityPreview
          activities={DEMO_ACTIVITIES}
          onSelectActivity={handleSelectActivity}
          onViewAll={() => onNavigateTab('activity')}
        />
      </ScrollView>

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
