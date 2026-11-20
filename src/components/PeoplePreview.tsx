import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius } from '@/theme';
import { FictionalContact } from '@/data/mockData';
import { AppContact } from '@/services/contacts';
import { ContactAvatar } from './common/ContactAvatar';
import { useTheme } from '@/context/ThemeContext';

export type ContactItemType = FictionalContact | AppContact;

interface PeoplePreviewProps {
  contacts: ContactItemType[];
  isRealContacts?: boolean;
  onSelectContact: (contact: ContactItemType) => void;
  onExploreMore: () => void;
}

export function PeoplePreview({
  contacts,
  isRealContacts = false,
  onSelectContact,
  onExploreMore,
}: PeoplePreviewProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>People</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textTertiary }]}>
            {isRealContacts
              ? 'Device Contacts • Local Simulation'
              : 'Frequent Contacts • Local Simulation'}
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={onExploreMore}>
          <Text style={[styles.exploreLink, { color: colors.primary }]}>Explore</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* New / Add contact circle */}
        <TouchableOpacity
          style={styles.contactItem}
          activeOpacity={0.75}
          onPress={onExploreMore}>
          <View
            style={[
              styles.newAvatarCircle,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.primary,
              },
            ]}>
            <Ionicons name="add" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.contactName, { color: colors.textSecondary }]} numberOfLines={1}>
            New Pay
          </Text>
        </TouchableOpacity>

        {/* Contacts with Google Pay pastel avatars */}
        {contacts.map((contact) => {
          const firstName = contact.name.split(' ')[0];
          return (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactItem}
              activeOpacity={0.75}
              onPress={() => onSelectContact(contact)}>
              <View style={styles.avatarWrapper}>
                <ContactAvatar name={contact.name} size={52} />
              </View>
              <Text
                style={[styles.contactName, { color: colors.textPrimary }]}
                numberOfLines={1}>
                {firstName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  exploreLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    gap: 14,
    paddingVertical: 4,
  },
  contactItem: {
    alignItems: 'center',
    width: 62,
  },
  avatarWrapper: {
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  newAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  contactName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
