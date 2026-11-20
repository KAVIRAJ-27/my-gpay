import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import {
  AppContact,
  ContactPhoneNumber,
  ContactPermissionState,
  checkContactsPermission,
  requestContactsPermission,
  openAppSettings,
  loadDeviceContacts,
  filterContacts,
  maskPhoneNumber,
} from '@/services/contacts';
import { RecipientPreviewModal } from './RecipientPreviewModal';

interface ContactsScreenProps {
  visible: boolean;
  onClose: () => void;
  onSelectRecipient: (contact: AppContact, phone: ContactPhoneNumber) => void;
}

export function ContactsScreen({
  visible,
  onClose,
  onSelectRecipient,
}: ContactsScreenProps) {
  const [permissionState, setPermissionState] =
    useState<ContactPermissionState>('undetermined');
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<AppContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Favorites & Recents in-memory state
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [recentContacts, setRecentContacts] = useState<AppContact[]>([]);

  // Selection submodal state
  const [selectedContactForPreview, setSelectedContactForPreview] =
    useState<AppContact | null>(null);
  const [selectedPhone, setSelectedPhone] =
    useState<ContactPhoneNumber | null>(null);

  // Check initial permission when modal opens
  const initPermission = useCallback(async () => {
    setIsLoading(true);
    const status = await checkContactsPermission();
    setPermissionState(status);

    if (status === 'granted') {
      const data = await loadDeviceContacts();
      setContacts(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      initPermission();
    }
  }, [visible, initPermission]);

  // Request permission on user tap
  const handleRequestPermission = async () => {
    setIsLoading(true);
    const status = await requestContactsPermission();
    setPermissionState(status);

    if (status === 'granted') {
      const data = await loadDeviceContacts();
      setContacts(data);
    }
    setIsLoading(false);
  };

  // Toggle favorite contact
  const toggleFavorite = (contact: AppContact, e: any) => {
    e.stopPropagation?.();
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(contact.id)) {
        next.delete(contact.id);
      } else {
        next.add(contact.id);
      }
      return next;
    });
  };

  // Filter contacts by search query
  const filteredContacts = useMemo(() => {
    return filterContacts(contacts, searchQuery);
  }, [contacts, searchQuery]);

  // Split out favorites when no search query is active
  const favoriteContacts = useMemo(() => {
    if (searchQuery.trim().length > 0) return [];
    return contacts.filter((c) => favoriteIds.has(c.id));
  }, [contacts, favoriteIds, searchQuery]);

  // Handle contact selection -> open preview
  const handleContactRowPress = (contact: AppContact) => {
    setSelectedContactForPreview(contact);
    setSelectedPhone(contact.phoneNumbers[0] || null);
  };

  // Continue from recipient preview
  const handleContinuePayment = (
    contact: AppContact,
    phone: ContactPhoneNumber
  ) => {
    // Add to recent contacts
    setRecentContacts((prev) => {
      const filtered = prev.filter((p) => p.id !== contact.id);
      return [contact, ...filtered].slice(0, 5);
    });

    setSelectedContactForPreview(null);
    onSelectRecipient(contact, phone);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Pay Anyone</Text>
            <Text style={styles.headerSubtitle}>Select a contact to simulate payment</Text>
          </View>
        </View>

        {/* 1. Loading State */}
        {isLoading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading contacts...</Text>
          </View>
        )}

        {/* 2. Permission Request Screen (Undetermined / Pre-request) */}
        {!isLoading && permissionState === 'undetermined' && (
          <View style={styles.permissionCard}>
            <View style={styles.permissionIconCircle}>
              <Ionicons name="people-circle-outline" size={64} color={Colors.primary} />
            </View>
            <Text style={styles.permissionTitle}>Access Your Contacts</Text>
            <Text style={styles.permissionBody}>
              Allow G Pay.nu to access your phone contacts so you can quickly
              simulate paying anyone on your device.
            </Text>
            <View style={styles.privacyPill}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.primary} />
              <Text style={styles.privacyPillText}>
                Your contacts stay 100% on this device. No data is uploaded or transmitted.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.8}
              onPress={handleRequestPermission}>
              <Text style={styles.actionBtnText}>Allow Contact Access</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. Permission Denied State */}
        {!isLoading && permissionState === 'denied' && (
          <View style={styles.permissionCard}>
            <View style={[styles.permissionIconCircle, { borderColor: Colors.warning }]}>
              <Ionicons name="hand-left-outline" size={60} color={Colors.warning} />
            </View>
            <Text style={styles.permissionTitle}>Contacts Permission Needed</Text>
            <Text style={styles.permissionBody}>
              You denied contacts access. To select from your real phonebook,
              permission is required.
            </Text>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.warning }]}
              activeOpacity={0.8}
              onPress={handleRequestPermission}>
              <Text style={[styles.actionBtnText, { color: '#000' }]}>Retry Permission</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 4. Permission Permanently Denied Guidance */}
        {!isLoading && permissionState === 'permanently_denied' && (
          <View style={styles.permissionCard}>
            <View style={[styles.permissionIconCircle, { borderColor: Colors.danger }]}>
              <Ionicons name="settings-outline" size={60} color={Colors.danger} />
            </View>
            <Text style={styles.permissionTitle}>Permission Blocked</Text>
            <Text style={styles.permissionBody}>
              Contacts access is disabled in Android settings. Please open
              device settings to grant the Contacts permission.
            </Text>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.danger }]}
              activeOpacity={0.8}
              onPress={openAppSettings}>
              <Text style={[styles.actionBtnText, { color: '#FFF' }]}>
                Open Android Settings
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 5. Permission Granted -> Contact List */}
        {!isLoading && permissionState === 'granted' && (
          <View style={styles.listContainer}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={Colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search name or phone number..."
                placeholderTextColor={Colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>

            {/* List */}
            <FlatList
              data={filteredContacts}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListHeaderComponent={
                <>
                  {/* Favorites Section */}
                  {favoriteContacts.length > 0 && (
                    <View style={styles.sectionBlock}>
                      <Text style={styles.sectionTitle}>
                        Favorites ({favoriteContacts.length})
                      </Text>
                      {favoriteContacts.map((fav) => (
                        <TouchableOpacity
                          key={`fav_${fav.id}`}
                          style={styles.contactRow}
                          activeOpacity={0.7}
                          onPress={() => handleContactRowPress(fav)}>
                          <View style={styles.rowAvatar}>
                            <Text style={styles.rowAvatarText}>{fav.initials}</Text>
                          </View>
                          <View style={styles.rowInfo}>
                            <Text style={styles.rowName}>{fav.name}</Text>
                            <Text style={styles.rowPhone}>
                              {maskPhoneNumber(fav.primaryPhone)}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={(e) => toggleFavorite(fav, e)}
                            style={styles.starBtn}>
                            <Ionicons name="star" size={22} color="#FFD700" />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Recently Selected Section */}
                  {recentContacts.length > 0 && searchQuery.length === 0 && (
                    <View style={styles.sectionBlock}>
                      <Text style={styles.sectionTitle}>Recently Selected</Text>
                      {recentContacts.map((rec) => (
                        <TouchableOpacity
                          key={`rec_${rec.id}`}
                          style={styles.contactRow}
                          activeOpacity={0.7}
                          onPress={() => handleContactRowPress(rec)}>
                          <View
                            style={[
                              styles.rowAvatar,
                              { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                            ]}>
                            <Text style={[styles.rowAvatarText, { color: Colors.textPrimary }]}>
                              {rec.initials}
                            </Text>
                          </View>
                          <View style={styles.rowInfo}>
                            <Text style={styles.rowName}>{rec.name}</Text>
                            <Text style={styles.rowPhone}>
                              {maskPhoneNumber(rec.primaryPhone)}
                            </Text>
                          </View>
                          <Ionicons
                            name="time-outline"
                            size={18}
                            color={Colors.textTertiary}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <Text style={styles.sectionTitle}>
                    {searchQuery.length > 0
                      ? `Matching Contacts (${filteredContacts.length})`
                      : `All Device Contacts (${contacts.length})`}
                  </Text>
                </>
              }
              renderItem={({ item }) => {
                const isFav = favoriteIds.has(item.id);
                return (
                  <TouchableOpacity
                    style={styles.contactRow}
                    activeOpacity={0.7}
                    onPress={() => handleContactRowPress(item)}>
                    <View style={styles.rowAvatar}>
                      <Text style={styles.rowAvatarText}>{item.initials}</Text>
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.rowPhone}>
                        {maskPhoneNumber(item.primaryPhone)}
                        {item.phoneNumbers.length > 1
                          ? ` • ${item.phoneNumbers.length} numbers`
                          : ''}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => toggleFavorite(item, e)}
                      style={styles.starBtn}>
                      <Ionicons
                        name={isFav ? 'star' : 'star-outline'}
                        size={22}
                        color={isFav ? '#FFD700' : Colors.textTertiary}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="search-outline"
                    size={48}
                    color={Colors.textTertiary}
                  />
                  <Text style={styles.emptyTitle}>No Contacts Found</Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery.length > 0
                      ? `No contact matching "${searchQuery}"`
                      : 'No contacts found on this device.'}
                  </Text>
                </View>
              }
            />
          </View>
        )}

        {/* Recipient Preview Modal */}
        <RecipientPreviewModal
          visible={selectedContactForPreview !== null}
          contact={selectedContactForPreview}
          selectedPhone={selectedPhone}
          onSelectPhone={setSelectedPhone}
          onClose={() => setSelectedContactForPreview(null)}
          onContinue={handleContinuePayment}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.title2,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textTertiary,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textTertiary,
    marginTop: Spacing.md,
  },
  permissionCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  permissionIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 210, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  permissionTitle: {
    ...Typography.title1,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  permissionBody: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  privacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.06)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.2)',
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  privacyPillText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.primary,
    flex: 1,
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    width: '100%',
    alignItems: 'center',
  },
  actionBtnText: {
    ...Typography.button,
    color: '#000',
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161C2E',
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.xxl,
  },
  sectionBlock: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginVertical: Spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111726',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  rowAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rowAvatarText: {
    ...Typography.title2,
    fontSize: 16,
    color: Colors.primary,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontSize: 15,
    marginBottom: 2,
  },
  rowPhone: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textTertiary,
  },
  starBtn: {
    padding: Spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    ...Typography.title2,
    fontSize: 16,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
