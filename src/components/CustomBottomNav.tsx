import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius } from '@/theme';
import { useTheme } from '@/context/ThemeContext';

export type TabKey = 'home' | 'money' | 'you' | 'activity';

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
    iconOutline: 'cash-outline',
    iconFilled: 'cash',
  },
  {
    key: 'you',
    label: 'You',
    iconOutline: 'person-circle-outline',
    iconFilled: 'person-circle',
  },
];

interface CustomBottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export function CustomBottomNav({ activeTab, onTabChange }: CustomBottomNavProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      ]}>
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
              {/* Material 3 active pill background */}
              <View
                style={[
                  styles.iconContainer,
                  isActive && {
                    backgroundColor: colors.pillActive,
                  },
                ]}>
                <Ionicons
                  name={(isActive ? tab.iconFilled : tab.iconOutline) as any}
                  size={20}
                  color={isActive ? colors.pillActiveText : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.textPrimary : colors.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
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
    borderTopWidth: 1,
    paddingBottom: Spacing.sm,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 4,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 60,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
    letterSpacing: 0.1,
  },
});
