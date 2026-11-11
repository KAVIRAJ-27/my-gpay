import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, CommonStyles } from '@/theme';
import { DEMO_ACTIVITIES, DemoActivity } from '@/data/mockData';

interface ActivityTabProps {
  onSelectActivity: (activity: DemoActivity) => void;
}

export function ActivityTab({ onSelectActivity }: ActivityTabProps) {
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = DEMO_ACTIVITIES.filter((item) => {
    if (filter === 'sent' && item.type !== 'sent') return false;
    if (filter === 'received' && item.type !== 'received') return false;
    if (
      searchQuery.trim() &&
      !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>All Activity</Text>
      <Text style={styles.subtitle}>
        Fictional transaction history for local UI testing
      </Text>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons
          name="search-outline"
          size={18}
          color={Colors.textSecondary}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search sample transactions..."
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(['all', 'sent', 'received'] as const).map((key) => {
          const isActive = filter === key;
          const label = key === 'all' ? 'All Transactions' : key === 'sent' ? 'Paid' : 'Received';
          return (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              activeOpacity={0.7}
              onPress={() => setFilter(key)}>
              <Text
                style={[
                  styles.filterText,
                  isActive && styles.filterTextActive,
                ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Activity List */}
      <View style={[CommonStyles.card, styles.listCard]}>
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={36} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No matching simulation records</Text>
          </View>
        ) : (
          filtered.map((item, index) => {
            const isReceived = item.type === 'received';
            const isLast = index === filtered.length - 1;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemRow, !isLast && styles.itemBorder]}
                activeOpacity={0.7}
                onPress={() => onSelectActivity(item)}>
                <View
                  style={[
                    styles.iconBox,
                    isReceived ? styles.iconReceived : styles.iconSent,
                  ]}>
                  <Ionicons
                    name={item.iconName as any}
                    size={20}
                    color={isReceived ? Colors.success : Colors.primary}
                  />
                </View>

                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemSub}>{item.timestamp}</Text>
                  <Text style={styles.categoryPill}>{item.category}</Text>
                </View>

                <View style={styles.amountCol}>
                  <Text
                    style={[
                      styles.amountText,
                      isReceived ? styles.amountReceived : styles.amountSent,
                    ]}>
                    {isReceived ? '+ ' : '- '}₹
                    {item.amount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                  <Text style={styles.statusLabel}>Completed (Demo)</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    ...Typography.hero,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  filterChip: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.primary,
  },
  listCard: {
    padding: 0,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconReceived: {
    backgroundColor: Colors.successSurface,
    borderWidth: 1,
    borderColor: Colors.successBorder,
  },
  iconSent: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  itemSub: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  categoryPill: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 3,
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  amountReceived: {
    color: Colors.success,
  },
  amountSent: {
    color: Colors.textPrimary,
  },
  statusLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 3,
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 8,
  },
});
