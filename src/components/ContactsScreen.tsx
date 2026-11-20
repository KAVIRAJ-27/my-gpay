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
import { Spacing, BorderRadius, Typography } from '@/theme';
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
import { ContactAvatar } from './common/ContactAvatar';
import { useTheme } from '@/context/ThemeContext';

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
  const { colors } = useTheme();
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

  // Handle contact item tap
  const handleContactRowPress = (contact: AppContact) => {
    setRecentContacts((prev) => {
      const filtered = prev.filter((c) => c.id !== contact.id);
      return [contact, ...filtered].slice(0, 5);
    });

    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      setSelectedPhone(contact.phoneNumbers[0]);
    } else {
      setSelectedPhone({
        number: contact.primaryPhone,
        formattedNumber: contact.primaryPhone,
        label: 'mobile',
      });
    }

    setSelectedContactForPreview(contact);
  };

  // Callback from preview submodal
  const handleContinuePayment = (
    recipient: AppContact,
    phone: ContactPhoneNumber
  ) => {
    setSelectedContactForPreview(null);
    onSelectRecipient(recipient, phone);
  };

  // Filtered contacts based on search query
  const filteredContacts = useMemo(() => {
    return filterContacts(contacts, searchQuery);
  }, [contacts, searchQuery]);

  // Favorite contacts list
  const favoriteContacts = useMemo(() => {
    return contacts.filter((c) => favoriteIds.has(c.id));
  }, [contacts, favoriteIds]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        {/* Header Bar */}
        <View style={[styles.header, { borderBottomColor: colors.divider }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
            accessibilityLabel="Close contacts">
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Pay Anyone</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textTertiary }]}>
              Local Offline Simulation
            </Text>
          </View>
        </View>

        {/* 1. Loading State */}
        {isLoading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textTertiary }]}>
              Reading device contacts...
            </Text>
          </View>
        )}

        {/* 2. Permission Undetermined State */}
        {!isLoading && permissionState === 'undetermined' && (
          <View style={styles.permissionCard}>
            <View
              style={[
                styles.permissionIconCircle,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceSubtle,
                },
              ]}>
              <Ionicons name="people-outline" size={56} color={colors.primary} />
            </View>
            <Text style={[styles.permissionTitle, { color: colors.textPrimary }]}>
              Pay Your Contacts
            </Text>
            <Text style={[styles.permissionBody, { color: colors.textSecondary }]}>
              Allow G Pay.nu to access your phone contacts to simulate sending
              money directly to friends and family.
            </Text>
            <View
              style={[
                styles.privacyPill,
                {
                  backgroundColor: colors.badgeBackground,
                  borderColor: colors.badgeBorder,
                },
              ]}>
              <Ionicons name="shield-checkmark" size={14} color={colors.badgeText} />
              <Text style={[styles.privacyPillText, { color: colors.badgeText }]}>
                100% On-Device • Never uploaded or synced externally
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={handleRequestPermission}>
              <Text style={[styles.actionBtnText, { color: colors.textInverse }]}>
                Continue & Select Contacts
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. Permission Denied State */}
        {!isLoading && permissionState === 'denied' && (
          <View style={styles.permissionCard}>
            <View
              style={[
                styles.permissionIconCircle,
                {
                  borderColor: colors.warning,
                  backgroundColor: colors.warningSurface,
                },
              ]}>
              <Ionicons name="alert-circle-outline" size={56} color={colors.warning} />
            </View>
            <Text style={[styles.permissionTitle, { color: colors.textPrimary }]}>
              Permission Required
            </Text>
            <Text style={[styles.permissionBody, { color: colors.textSecondary }]}>
              Contacts permission was not granted. G Pay.nu needs contacts
              access to simulate payments to real phone numbers.
            </Text>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={handleRequestPermission}>
              <Text style={[styles.actionBtnText, { color: colors.textInverse }]}>
                Retry Permission
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 4. Permission Permanently Denied Guidance */}
        {!isLoading && permissionState === 'permanently_denied' && (
          <View style={styles.permissionCard}>
            <View
              style={[
                styles.permissionIconCircle,
                {
                  borderColor: colors.danger,
                  backgroundColor: colors.dangerSurface,
                },
              ]}>
              <Ionicons name="settings-outline" size={56} color={colors.danger} />
            </View>
            <Text style={[styles.permissionTitle, { color: colors.textPrimary }]}>
              Permission Blocked
            </Text>
            <Text style={[styles.permissionBody, { color: colors.textSecondary }]}>
              Contacts access is disabled in Android settings. Please open
              device settings to grant the Contacts permission.
            </Text>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={openAppSettings}>
              <Text style={[styles.actionBtnText, { color: colors.textInverse }]}>
                Open Android Settings
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 5. Permission Granted -> Contact List */}
        {!isLoading && permissionState === 'granted' && (
          <View style={styles.listContainer}>
            {/* Search Bar */}
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                },
              ]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search name or phone number..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
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
                      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                        Favorites ({favoriteContacts.length})
                      </Text>
                      {favoriteContacts.map((fav) => (
                        <TouchableOpacity
                          key={`fav_${fav.id}`}
                          style={[
                            styles.contactRow,
                            {
                              backgroundColor: colors.surface,
                              borderColor: colors.border,
                            },
                          ]}
                          activeOpacity={0.7}
                          onPress={() => handleContactRowPress(fav)}>
                          <ContactAvatar name={fav.name} initials={fav.initials} size={44} />
                          <View style={styles.rowInfo}>
                            <Text style={[styles.rowName, { color: colors.textPrimary }]}>
                              {fav.name}
                            </Text>
                            <Text style={[styles.rowPhone, { color: colors.textSecondary }]}>
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
                      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                        Recently Selected
                      </Text>
                      {recentContacts.map((rec) => (
                        <TouchableOpacity
                          key={`rec_${rec.id}`}
                          style={[
                            styles.contactRow,
                            {
                              backgroundColor: colors.surface,
                              borderColor: colors.border,
                            },
                          ]}
                          activeOpacity={0.7}
                          onPress={() => handleContactRowPress(rec)}>
                          <ContactAvatar name={rec.name} initials={rec.initials} size={44} />
                          <View style={styles.rowInfo}>
                            <Text style={[styles.rowName, { color: colors.textPrimary }]}>
                              {rec.name}
                            </Text>
                            <Text style={[styles.rowPhone, { color: colors.textSecondary }]}>
                              {maskPhoneNumber(rec.primaryPhone)}
                            </Text>
                          </View>
                          <Ionicons
                            name="time-outline"
                            size={18}
                            color={colors.textTertiary}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <Text style={[styles.sectionTitle, { color: colors.primary }]}>
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
                    style={[
                      styles.contactRow,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleContactRowPress(item)}>
                    <ContactAvatar name={item.name} initials={item.initials} size={44} />
                    <View style={styles.rowInfo}>
                      <Text
                        style={[styles.rowName, { color: colors.textPrimary }]}
                        numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.rowPhone, { color: colors.textSecondary }]}>
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
                        color={isFav ? '#FFD700' : colors.textTertiary}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="search-outline"
                    size={44}
                    color={colors.textTertiary}
                  />
                  <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                    No Contacts Found
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginTop: Spacing.md,
  },
  permissionCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  permissionIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  permissionBody: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  privacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  privacyPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    width: '100%',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
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
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginVertical: Spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: 6,
    borderWidth: 1,
    gap: 12,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  rowPhone: {
    fontSize: 12,
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
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
});
