import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { MoneyHeaderArt } from '../common/MoneyHeaderArt';
import { USER_PROFILE, DEMO_ACTIVITIES, DemoActivity } from '@/data/mockData';

interface MoneyTabProps {
  balance?: number;
  onAddFunds: () => void;
  onResetWallet?: () => void;
}

export function MoneyTab({
  balance = USER_PROFILE.demoBalance,
  onAddFunds,
  onResetWallet,
}: MoneyTabProps) {
  const { colors } = useTheme();

  // State for item detail modals
  const [selectedTxn, setSelectedTxn] = useState<DemoActivity | null>(null);
  const [cibilScoreVisible, setCibilScoreVisible] = useState(false);
  const [loanModalVisible, setLoanModalVisible] = useState(false);
  const [flexCardModalVisible, setFlexCardModalVisible] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  const formattedBalance = balance.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* 1. TOP HEADER ART (MOON, RIVER, LIT SKYSCRAPERS, PERSON ON HILL) */}
        <View style={styles.headerArtWrapper}>
          <MoneyHeaderArt />
          {/* Three-Dot Overflow Menu Button */}
          <TouchableOpacity
            style={styles.overflowBtn}
            activeOpacity={0.7}
            onPress={() => setShowOverflowMenu(true)}>
            <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 2. TITLE: "Money" */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>Money</Text>
        </View>

        {/* 3. BANK ACCOUNT ROW (INDIAN BANK ••••3526) */}
        <View style={styles.accountCard}>
          <View style={styles.bankLeft}>
            {/* Indian Bank Circular Emblem */}
            <View style={styles.bankLogoBadge}>
              <Ionicons name="business" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.bankInfo}>
              <Text style={styles.bankName}>{USER_PROFILE.bankName}</Text>
              <Text style={styles.accountNumber}>{USER_PROFILE.accountNumberMasked}</Text>
              <Text style={styles.accountType}>Savings account</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.checkBalanceBtn}
            activeOpacity={0.7}
            onPress={onAddFunds}>
            <Text style={styles.checkBalanceText}>Check balance</Text>
          </TouchableOpacity>
        </View>

        {/* 4. CIBIL SCORE ROW */}
        <View style={styles.cibilRow}>
          <View style={styles.cibilLeft}>
            <View style={styles.cibilIconBadge}>
              <Ionicons name="speedometer-outline" size={22} color="#81C995" />
            </View>
            <View style={styles.cibilInfo}>
              <Text style={styles.cibilTitle}>CIBIL score</Text>
              <Text style={styles.cibilSubtitle}>Check for free, instantly</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.cibilCheckBtn}
            activeOpacity={0.7}
            onPress={() => setCibilScoreVisible(true)}>
            <Text style={styles.checkBalanceText}>Check</Text>
          </TouchableOpacity>
        </View>

        {/* 5. "CREDIT FOR YOU" SECTION (DUAL CARDS) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Credit for you</Text>
        </View>

        <View style={styles.dualCardsRow}>
          {/* Card 1: Flex by Google Pay */}
          <TouchableOpacity
            style={[styles.creditCardBox, { backgroundColor: colors.surface }]}
            activeOpacity={0.8}
            onPress={() => setFlexCardModalVisible(true)}>
            <View style={styles.cardTopRow}>
              <View style={styles.cardIconCircle}>
                <Ionicons name="card-outline" size={18} color="#FBBC04" />
              </View>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>New</Text>
              </View>
            </View>
            <Text style={styles.creditCardTitle}>Flex by Google Pay</Text>
            <Text style={styles.creditCardSub}>UPI credit card made simple</Text>
            <Text style={styles.checkDetailsLink}>Check details</Text>
          </TouchableOpacity>

          {/* Card 2: Personal Loan */}
          <TouchableOpacity
            style={[styles.creditCardBox, { backgroundColor: colors.surface }]}
            activeOpacity={0.8}
            onPress={() => setLoanModalVisible(true)}>
            <View style={styles.cardTopRow}>
              <View style={[styles.cardIconCircle, { backgroundColor: 'rgba(251, 188, 4, 0.15)' }]}>
                <Ionicons name="wallet-outline" size={18} color="#FBBC04" />
              </View>
            </View>
            <Text style={styles.creditCardTitle}>Personal loan</Text>
            <Text style={styles.creditCardSub}>Up to ₹40 lakh, instant approval</Text>
            <Text style={styles.checkDetailsLink}>Check details</Text>
          </TouchableOpacity>
        </View>

        {/* 6. "TRANSACTION HISTORY" SECTION */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Transaction history</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onAddFunds}>
            <Text style={styles.seeAllLink}>See all &gt;</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction Items matching Screenshot 3 */}
        <View style={styles.txnListContainer}>
          {DEMO_ACTIVITIES.map((txn, index) => {
            const isLast = index === DEMO_ACTIVITIES.length - 1;
            const avatarColor =
              index === 0 ? '#8E24AA' : index === 1 ? '#E91E63' : index === 2 ? '#1976D2' : index === 3 ? '#E50914' : '#8E24AA';
            const initial = txn.title[0].toUpperCase();

            return (
              <TouchableOpacity
                key={txn.id}
                style={[styles.txnRow, !isLast && styles.txnBorder]}
                activeOpacity={0.7}
                onPress={() => setSelectedTxn(txn)}>
                <View style={[styles.txnAvatar, { backgroundColor: avatarColor }]}>
                  <Text style={styles.txnAvatarText}>{initial}</Text>
                </View>
                <View style={styles.txnDetails}>
                  <Text style={styles.txnTitle}>{txn.title}</Text>
                  <Text style={styles.txnDate}>{txn.timestamp}</Text>
                </View>
                <Text style={styles.txnAmount}>₹{txn.amount}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* TRANSACTION DETAIL MODAL */}
      <Modal
        visible={selectedTxn !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTxn(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Transaction Details</Text>
              <TouchableOpacity onPress={() => setSelectedTxn(null)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            {selectedTxn && (
              <View style={styles.modalBody}>
                <View style={[styles.txnAvatarLarge, { backgroundColor: '#8E24AA' }]}>
                  <Text style={styles.txnAvatarLargeText}>{selectedTxn.title[0]}</Text>
                </View>
                <Text style={styles.modalRecipientName}>{selectedTxn.title}</Text>
                <Text style={styles.modalAmountBig}>₹{selectedTxn.amount}.00</Text>
                <View style={styles.modalBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#81C995" />
                  <Text style={styles.modalBadgeText}>Completed • Simulated</Text>
                </View>
                <View style={styles.modalMetaRow}>
                  <Text style={styles.modalMetaLabel}>Date &amp; Time</Text>
                  <Text style={styles.modalMetaValue}>{selectedTxn.timestamp}, 2026</Text>
                </View>
                <View style={styles.modalMetaRow}>
                  <Text style={styles.modalMetaLabel}>From</Text>
                  <Text style={styles.modalMetaValue}>Indian Bank ••••3526</Text>
                </View>
                <View style={styles.modalMetaRow}>
                  <Text style={styles.modalMetaLabel}>UPI Transaction ID</Text>
                  <Text style={[styles.modalMetaValue, { color: colors.primary }]}>DEMO_TXN_{selectedTxn.id.toUpperCase()}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* CIBIL SCORE MODAL */}
      <Modal
        visible={cibilScoreVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCibilScoreVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Your CIBIL Score</Text>
              <TouchableOpacity onPress={() => setCibilScoreVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.cibilModalContent}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>785</Text>
                <Text style={styles.scoreRating}>Excellent</Text>
              </View>
              <Text style={styles.scoreDesc}>
                Your credit score is in the top tier! You are eligible for the best pre-approved credit cards and loans with zero processing fees.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* THREE-DOT OVERFLOW MENU MODAL */}
      <Modal
        visible={showOverflowMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOverflowMenu(false)}>
        <TouchableOpacity
          style={styles.menuBackdrop}
          activeOpacity={1}
          onPress={() => setShowOverflowMenu(false)}>
          <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowOverflowMenu(false);
                Alert.alert('Money & Accounts', 'G Pay.nu simulated accounts manager.');
              }}>
              <Text style={styles.menuItemText}>Get help</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowOverflowMenu(false);
                Alert.alert('Send Feedback', 'Feedback simulation active.');
              }}>
              <Text style={styles.menuItemText}>Send feedback</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* FLEX CARD & PERSONAL LOAN SIMULATION MODALS */}
      <Modal
        visible={loanModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLoanModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Personal Loan</Text>
              <TouchableOpacity onPress={() => setLoanModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.cibilModalContent}>
              <Ionicons name="wallet-outline" size={48} color="#FBBC04" style={{ marginBottom: 12 }} />
              <Text style={styles.scoreNumber}>₹4,00,000</Text>
              <Text style={styles.scoreRating}>Pre-Approved Credit Limit</Text>
              <Text style={styles.scoreDesc}>
                Simulated pre-approved personal loan at 10.49% p.a. Zero documentation required for demo testing.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={flexCardModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFlexCardModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Flex by Google Pay</Text>
              <TouchableOpacity onPress={() => setFlexCardModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.cibilModalContent}>
              <Ionicons name="card" size={48} color="#1A73E8" style={{ marginBottom: 12 }} />
              <Text style={styles.scoreNumber}>RuPay Virtual Card</Text>
              <Text style={styles.scoreRating}>UPI Linked Credit</Text>
              <Text style={styles.scoreDesc}>
                Link your virtual credit card to scan and pay at any UPI QR code instantly with 50-day interest-free period.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

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
  headerArtWrapper: {
    position: 'relative',
    width: '100%',
  },
  overflowBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 8,
    zIndex: 10,
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankLogoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFB300', // Yellow badge matching Indian Bank in screenshot
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 14,
    color: '#E8EAED',
    fontWeight: '500',
  },
  accountType: {
    fontSize: 12,
    color: '#9AA0A6',
    marginTop: 2,
  },
  checkBalanceBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  checkBalanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8AB4F8',
  },
  cibilRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 4,
  },
  cibilLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cibilIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A2C34',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cibilInfo: {
    flex: 1,
  },
  cibilTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cibilSubtitle: {
    fontSize: 12,
    color: '#9AA0A6',
  },
  cibilCheckBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8AB4F8',
  },
  dualCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  creditCardBox: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(251, 188, 4, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#004A77',
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C2E7FF',
  },
  creditCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  creditCardSub: {
    fontSize: 11,
    lineHeight: 15,
    color: '#9AA0A6',
    minHeight: 30,
  },
  checkDetailsLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8AB4F8',
    marginTop: 12,
  },
  txnListContainer: {
    paddingHorizontal: 16,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  txnBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  txnAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  txnAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  txnDetails: {
    flex: 1,
  },
  txnTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  txnDate: {
    fontSize: 12,
    color: '#9AA0A6',
  },
  txnAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBody: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  txnAvatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  txnAvatarLargeText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalRecipientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  modalAmountBig: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  modalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(129, 201, 149, 0.15)',
    gap: 6,
    marginBottom: 20,
  },
  modalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#81C995',
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalMetaLabel: {
    fontSize: 13,
    color: '#9AA0A6',
  },
  modalMetaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cibilModalContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#81C995',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scoreRating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#81C995',
  },
  scoreDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: '#9AA0A6',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: 16,
  },
  menuCard: {
    width: 160,
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});
