import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/theme';

export type TabKey = 'home' | 'money' | 'activity' | 'you';

interface TabItem {
  key: TabKey;
  label: string;
  iconOutline: string;
  iconFilled: string;
}

const TABS: TabItem[] = [
  {
    key: 'home',
    label: 'Home',
    iconOutline: 'home-outline',
    iconFilled: 'home',
  },
  {
    key: 'money',
    label: 'Money',
    iconOutline: 'wallet-outline',
    iconFilled: 'wallet',
  },
  {
    key: 'activity',
    label: 'Activity',
    iconOutline: 'time-outline',
    iconFilled: 'time',
  },
  {
    key: 'you',
    label: 'You',
    iconOutline: 'person-outline',
    iconFilled: 'person',
  },
];

interface CustomBottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export function CustomBottomNav({ activeTab, onTabChange }: CustomBottomNavProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              activeOpacity={0.7}
              onPress={() => onTabChange(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}>
              {isActive && <View style={styles.activeGlow} />}
              <Ionicons
                name={(isActive ? tab.iconFilled : tab.iconOutline) as any}
                size={22}
                color={isActive ? Colors.primary : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  activeGlow: {
    position: 'absolute',
    top: 2,
    width: 38,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
