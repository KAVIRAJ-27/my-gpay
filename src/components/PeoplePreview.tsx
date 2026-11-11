import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { FictionalContact } from '@/data/mockData';

interface PeoplePreviewProps {
  contacts: FictionalContact[];
  onSelectContact: (contact: FictionalContact) => void;
  onExploreMore: () => void;
}

export function PeoplePreview({
  contacts,
  onSelectContact,
  onExploreMore,
}: PeoplePreviewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>People</Text>
          <Text style={styles.sectionSubtitle}>
            Fictional simulation contacts • No phonebook access
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
        {/* New / Add simulated contact tile */}
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

        {/* Fictional Sample Contacts */}
        {contacts.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            style={styles.contactItem}
            activeOpacity={0.75}
            onPress={() => onSelectContact(contact)}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: contact.avatarColor },
              ]}>
              <Text style={styles.initialsText}>{contact.initials}</Text>
            </View>
            <Text style={styles.contactName} numberOfLines={1}>
              {contact.name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
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
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.title2,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  exploreLink: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    gap: 16,
  },
  contactItem: {
    alignItems: 'center',
    width: 64,
  },
  newAvatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  initialsText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contactName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
