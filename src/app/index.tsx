import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, BackHandler, Alert } from 'react-native';
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
import { QuickActionItem, USER_PROFILE } from '@/data/mockData';
import {
  getDemoBalance,
  addDemoFunds,
  resetDemoWallet,
  DemoTransactionRecord,
} from '@/services/database';

export default function MainAppScreen() {
  const { isAuthenticated, lockSimulator } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [detailModalItem, setDetailModalItem] = useState<QuickActionItem | null>(null);
  const [demoBalance, setDemoBalance] = useState<number>(USER_PROFILE.demoBalance);

  // Sync SQLite balance
  const refreshBalance = useCallback(async () => {
    try {
      const b = await getDemoBalance();
      setDemoBalance(b);
    } catch {
      // Fail-safe
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshBalance();
    }
  }, [isAuthenticated, refreshBalance]);

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

  const handleAddFundsFromMoneyTab = async () => {
    try {
      const res = await addDemoFunds(1000, 'Top-up from Money tab');
      setDemoBalance(res.newBalance);
      setDetailModalItem({
        id: 'topup_success',
        title: 'Demo Balance Topped Up',
        iconName: 'wallet-outline',
        description: `Added ₹1,000.00 to local simulated demo wallet.\nUpdated Balance: ₹${res.newBalance.toLocaleString(
          'en-IN',
          { minimumFractionDigits: 2 }
        )}\n\nStored in device SQLite database. Offline simulation prototype only.`,
      });
    } catch {
      // Fail-safe
    }
  };

  const handleResetWalletFromMoneyTab = async () => {
    try {
      const res = await resetDemoWallet();
      setDemoBalance(res.newBalance);
      setDetailModalItem({
        id: 'reset_success',
        title: 'Demo Wallet Reset',
        iconName: 'refresh-outline',
        description: `Your local simulated demo wallet has been reset to the initial balance of ₹${res.newBalance.toLocaleString(
          'en-IN',
          { minimumFractionDigits: 2 }
        )}.\n\nAll real banking systems remain 100% disconnected.`,
      });
    } catch {
      // Fail-safe
    }
  };

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
            <HomeDashboard
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                refreshBalance();
              }}
              balance={demoBalance}
              onBalanceChange={(newB) => setDemoBalance(newB)}
            />
          )}

          {activeTab === 'money' && (
            <MoneyTab
              balance={demoBalance}
              onAddFunds={handleAddFundsFromMoneyTab}
              onResetWallet={handleResetWalletFromMoneyTab}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityTab
              onSelectActivity={(txn: DemoTransactionRecord) => {
                setDetailModalItem({
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
                  }\n\nLocal Demo Record ID: ${txn.id}\n(Stored in SQLite — not a payment reference)`,
                });
              }}
            />
          )}

          {activeTab === 'you' && <YouTab onLock={lockSimulator} />}
        </View>

        {/* Polished Custom Bottom Navigation Bar */}
        <CustomBottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            refreshBalance();
          }}
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
