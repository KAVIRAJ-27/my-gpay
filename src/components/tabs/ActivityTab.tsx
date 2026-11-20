import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, CommonStyles } from '@/theme';
import {
  getAllDemoTransactions,
  DemoTransactionRecord,
} from '@/services/database';
import { DemoBadge } from '../DemoBadge';

interface ActivityTabProps {
  onSelectActivity?: (activity: DemoTransactionRecord) => void;
}

export function ActivityTab({ onSelectActivity }: ActivityTabProps) {
  const [transactions, setTransactions] = useState<DemoTransactionRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'debit' | 'credit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<DemoTransactionRecord | null>(null);

  const loadTransactions = useCallback(async () => {
    try {
      const data = await getAllDemoTransactions();
      setTransactions(data);
    } catch {
      // Fail-safe
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filtered = transactions.filter((item) => {
    if (filter === 'debit' && item.type !== 'debit') return false;
    if (filter === 'credit' && item.type !== 'credit') return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchName = item.recipient_name.toLowerCase().includes(q);
      const matchNote = item.note.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      if (!matchName && !matchNote && !matchId) return false;
    }
    return true;
  });

  const handleRowPress = (item: DemoTransactionRecord) => {
    if (onSelectActivity) {
      onSelectActivity(item);
    } else {
      setSelectedTxn(item);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* Header with Demo Badge */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>All Activity</Text>
            <Text style={styles.subtitle}>
              Local SQLite transaction history • Offline simulation
            </Text>
          </View>
          <DemoBadge />
        </View>

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
            placeholder="Search by recipient, note, or ID..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={16}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {(['all', 'debit', 'credit'] as const).map((key) => {
            const isActive = filter === key;
            const label =
              key === 'all'
                ? 'All Transactions'
                : key === 'debit'
                ? 'Paid (Debit)'
                : 'Added (Credit)';
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
              <Ionicons
                name="file-tray-outline"
                size={36}
                color={Colors.textTertiary}
              />
              <Text style={styles.emptyText}>
                {searchQuery.trim().length > 0
                  ? 'No matching simulation records'
                  : 'No transactions in local database'}
              </Text>
            </View>
          ) : (
            filtered.map((item, index) => {
              const isCredit = item.type === 'credit';
              const isLast = index === filtered.length - 1;

              let iconName = 'paper-plane-outline';
              if (item.category === 'topup') iconName = 'add-circle-outline';
              if (item.category === 'reset') iconName = 'refresh-outline';
              if (isCredit && item.category !== 'topup') iconName = 'arrow-down-circle-outline';

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemRow, !isLast && styles.itemBorder]}
                  activeOpacity={0.7}
                  onPress={() => handleRowPress(item)}>
                  <View
                    style={[
                      styles.iconContainer,
                      isCredit ? styles.iconCredit : styles.iconDebit,
                    ]}>
                    <Ionicons
                      name={iconName as any}
                      size={20}
                      color={isCredit ? Colors.brandNu : Colors.primary}
                    />
                  </View>

                  <View style={styles.detailsCol}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.recipient_name}
                    </Text>
                    <Text style={styles.itemSubtitle} numberOfLines={1}>
                      {item.created_at_formatted}
                      {item.note ? ` • ${item.note}` : ''}
                    </Text>
                  </View>

                  <View style={styles.amountCol}>
                    <Text
                      style={[
                        styles.amountText,
                        isCredit ? styles.amountCredit : styles.amountDebit,
                      ]}>
                      {isCredit ? '+ ' : '- '}₹
                      {item.amount.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusText}>SIMULATED</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <Modal
          visible={selectedTxn !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedTxn(null)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Simulated Transaction</Text>
                <TouchableOpacity
                  onPress={() => setSelectedTxn(null)}
                  style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalContent}>
                {/* Big Amount */}
                <View style={styles.modalAmountBox}>
                  <Text
                    style={[
                      styles.modalAmountText,
                      selectedTxn.type === 'credit'
                        ? { color: Colors.brandNu }
                        : { color: Colors.textPrimary },
                    ]}>
                    {selectedTxn.type === 'credit' ? '+ ' : '- '}₹
                    {selectedTxn.amount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                  <View style={styles.modalSimPill}>
                    <Text style={styles.modalSimText}>
                      LOCAL SIMULATION ONLY
                    </Text>
                  </View>
                </View>

                {/* Details Breakdown */}
                <View style={styles.modalDetailsGroup}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Party / Recipient</Text>
                    <Text style={styles.modalValue}>
                      {selectedTxn.recipient_name}
                    </Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Masked Phone</Text>
                    <Text style={styles.modalValue}>
                      {selectedTxn.recipient_phone_masked}
                    </Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Date & Time</Text>
                    <Text style={styles.modalValue}>
                      {selectedTxn.created_at_formatted}
                    </Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Category</Text>
                    <Text style={styles.modalValue}>
                      {selectedTxn.category.toUpperCase()}
                    </Text>
                  </View>

                  {selectedTxn.note.trim().length > 0 && (
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Note</Text>
                      <Text style={styles.modalValue}>{selectedTxn.note}</Text>
                    </View>
                  )}
                </View>

                {/* Local Demo Record ID Box */}
                <View style={styles.recordIdContainer}>
                  <Text style={styles.recordIdLabel}>
                    LOCAL DEMO RECORD ID:
                  </Text>
                  <Text style={styles.recordIdText}>{selectedTxn.id}</Text>
                  <Text style={styles.recordIdDisclaimer}>
                    Local demo record ID — not a payment reference.
                  </Text>
                </View>

                {/* Safety Warning */}
                <View style={styles.safeNotice}>
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color={Colors.primary}
                  />
                  <Text style={styles.safeNoticeText}>
                    This entry is stored in your device's local SQLite database.
                    No bank or payment gateway connection was made.
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalDoneBtn}
                  onPress={() => setSelectedTxn(null)}>
                  <Text style={styles.modalDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.screenPadding,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.title1,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
    borderColor: Colors.primary,
  },
  filterText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  filterTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  listCard: {
    padding: Spacing.none,
    overflow: 'hidden',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
    gap: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textTertiary,
    fontSize: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconDebit: {
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
  },
  iconCredit: {
    backgroundColor: 'rgba(16, 231, 195, 0.12)',
  },
  detailsCol: {
    flex: 1,
  },
  itemTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  itemSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  amountText: {
    ...Typography.bodyBold,
    fontSize: 14,
    marginBottom: 2,
  },
  amountDebit: {
    color: Colors.textPrimary,
  },
  amountCredit: {
    color: Colors.brandNu,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#121826',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.2)',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitle: {
    ...Typography.title2,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  modalContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalAmountBox: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  modalAmountText: {
    ...Typography.hero,
    fontSize: 36,
    fontWeight: '800',
  },
  modalSimPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    marginTop: 6,
  },
  modalSimText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  modalDetailsGroup: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: 8,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  modalLabel: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  modalValue: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  recordIdContainer: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: Spacing.md,
    alignItems: 'center',
  },
  recordIdLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  recordIdText: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  recordIdDisclaimer: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  safeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.06)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: 10,
  },
  safeNoticeText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  modalFooter: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalDoneBtn: {
    height: 48,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoneText: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: Colors.textInverse,
  },
});
