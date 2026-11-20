import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/theme';
import { FictionalContact } from '@/data/mockData';
import { AppContact } from '@/services/contacts';

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
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>People</Text>
          <Text style={styles.sectionSubtitle}>
            {isRealContacts
              ? 'Device Contacts • Local Simulation'
              : 'Fictional sample contacts • Tap Explore to select contacts'}
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={onExploreMore}>
          <Text style={styles.exploreLink}>Explore</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* New / Add contact tile */}
        <TouchableOpacity
          style={styles.contactItem}
          activeOpacity={0.75}
          onPress={onExploreMore}>
          <View style={styles.newAvatarCircle}>
            <Ionicons name="add" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.contactName} numberOfLines={1}>
            New Pay
          </Text>
        </TouchableOpacity>

        {/* Contacts */}
        {contacts.map((contact) => {
          const isAppContact = 'initials' in contact;
          const initials = isAppContact
            ? (contact as AppContact).initials
            : (contact as FictionalContact).name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

          const firstName = contact.name.split(' ')[0];

          return (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactItem}
              activeOpacity={0.75}
              onPress={() => onSelectContact(contact)}>
              <View
                style={[
                  styles.avatarCircle,
                  !isAppContact && {
                    backgroundColor: (contact as FictionalContact).avatarColor,
                  },
                ]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Text style={styles.contactName} numberOfLines={1}>
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
    marginBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.title2,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  exploreLink: {
    ...Typography.button,
    fontSize: 13,
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.md,
  },
  contactItem: {
    alignItems: 'center',
    width: 64,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 210, 255, 0.4)',
  },
  newAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    backgroundColor: 'rgba(0, 210, 255, 0.08)',
  },
  avatarText: {
    ...Typography.title2,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  contactName: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
