import React, { useState, useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { AuthScreen } from '@/components/AuthScreen';
import { HomeDashboard } from '@/components/HomeDashboard';
import { MoneyTab } from '@/components/tabs/MoneyTab';
import { ActivityTab } from '@/components/tabs/ActivityTab';
import { YouTab } from '@/components/tabs/YouTab';
import { CustomBottomNav, TabKey } from '@/components/CustomBottomNav';
import { ActionPlaceholderModal } from '@/components/ActionPlaceholderModal';
import { QuickActionItem, DemoActivity } from '@/data/mockData';

export default function MainAppScreen() {
  const { isAuthenticated, lockSimulator } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [detailModalItem, setDetailModalItem] = useState<QuickActionItem | null>(null);

  // Handle Android hardware back navigation
  useEffect(() => {
    const onBackPress = () => {
      if (!isAuthenticated) {
        return false; // Exit app if at auth screen
      }
      if (activeTab !== 'home') {
        setActiveTab('home'); // Return to Home tab from secondary tabs
        return true;
      }
      return false; // Standard exit from Home
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );
    return () => subscription.remove();
  }, [isAuthenticated, activeTab]);

  // If locked, strictly render the Phase 2 Authentication Screen
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Once authenticated, render Dashboard with Bottom Navigation
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Tab Content */}
        <View style={styles.content}>
          {activeTab === 'home' && (
            <HomeDashboard onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'money' && (
            <MoneyTab
              onAddFunds={() => {
                setDetailModalItem({
                  id: 'topup',
                  title: 'Add Simulated Funds',
                  iconName: 'card-outline',
                  description:
                    'Simulated top-up interface. Mock funds are stored locally in the prototype database.',
                });
              }}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityTab
              onSelectActivity={(activity: DemoActivity) => {
                setDetailModalItem({
                  id: activity.id,
                  title: activity.title,
                  iconName: activity.iconName,
                  description: `${activity.subtitle} • ₹${activity.amount.toLocaleString(
                    'en-IN'
                  )} (${activity.timestamp})`,
                });
              }}
            />
          )}

          {activeTab === 'you' && <YouTab onLock={lockSimulator} />}
        </View>

        {/* Polished Custom Bottom Navigation Bar */}
        <CustomBottomNav
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />

        {/* Shared Detail / Placeholder Modal */}
        <ActionPlaceholderModal
          action={detailModalItem}
          visible={detailModalItem !== null}
          onClose={() => setDetailModalItem(null)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
});
