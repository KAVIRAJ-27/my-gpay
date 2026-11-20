import * as LegacyContacts from 'expo-contacts/legacy';
import { Contact, ContactField } from 'expo-contacts';
import { Linking, Platform } from 'react-native';

export type ContactPermissionState =
  | 'undetermined'
  | 'granted'
  | 'denied'
  | 'permanently_denied';

export interface ContactPhoneNumber {
  id?: string;
  label: string;
  number: string;
  formattedNumber: string;
}

export interface AppContact {
  id: string;
  name: string;
  initials: string;
  phoneNumbers: ContactPhoneNumber[];
  primaryPhone: string;
  isFavorite?: boolean;
}

/**
 * Format phone number for clean readability without exposing raw format
 */
export function formatPhoneNumber(num: string): string {
  const cleaned = num.replace(/[^\d+]/g, '');
  return cleaned || num.trim();
}

/**
 * Mask phone number for UI display and privacy (e.g. +91 98765 •••••)
 */
export function maskPhoneNumber(num: string): string {
  const clean = formatPhoneNumber(num);
  if (clean.length <= 4) {
    return clean;
  }
  const visiblePrefix = clean.slice(0, Math.min(6, clean.length - 4));
  const visibleSuffix = clean.slice(-2);
  const maskedMiddle = '•'.repeat(Math.max(3, clean.length - visiblePrefix.length - visibleSuffix.length));
  return `${visiblePrefix} ${maskedMiddle} ${visibleSuffix}`;
}

/**
 * Generate 1-2 letter initials from a contact's display name
 */
export function getInitials(name: string): string {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Check current contacts permission state
 */
export async function checkContactsPermission(): Promise<ContactPermissionState> {
  try {
    const res = await LegacyContacts.getPermissionsAsync();
    if (res.granted) {
      return 'granted';
    }
    if (res.status === 'denied') {
      return res.canAskAgain ? 'denied' : 'permanently_denied';
    }
    return 'undetermined';
  } catch (error) {
    return 'undetermined';
  }
}

/**
 * Request contacts permission interactively from the user
 */
export async function requestContactsPermission(): Promise<ContactPermissionState> {
  try {
    const res = await LegacyContacts.requestPermissionsAsync();
    if (res.granted) {
      return 'granted';
    }
    if (res.status === 'denied') {
      return res.canAskAgain ? 'denied' : 'permanently_denied';
    }
    return 'denied';
  } catch (error) {
    return 'denied';
  }
}

/**
 * Open system application settings for permanently denied guidance
 */
export async function openAppSettings(): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      await Linking.openSettings();
    }
  } catch {
    // Fail-safe
  }
}

/**
 * Load and deduplicate real device contacts with minimal necessary fields
 */
export async function loadDeviceContacts(): Promise<AppContact[]> {
  const contactMap = new Map<string, AppContact>();

  // Strategy 1: Modern Expo SDK 58 Contact class (fast, modern projection)
  try {
    if (typeof (Contact as any)?.getAllDetails === 'function') {
      const details = await (Contact as any).getAllDetails([
        ContactField.FULL_NAME,
        ContactField.GIVEN_NAME,
        ContactField.FAMILY_NAME,
        ContactField.PHONES,
        ContactField.IS_FAVOURITE,
      ]);

      if (details && Array.isArray(details) && details.length > 0) {
        for (const item of details) {
          const rawName = (item.fullName || `${item.givenName || ''} ${item.familyName || ''}`).trim();
          if (!rawName) continue;
          const phoneList = Array.isArray(item.phones) ? item.phones : [];
          const validPhones: ContactPhoneNumber[] = [];
          const seen = new Set<string>();

          for (const p of phoneList) {
            const num = p?.number;
            if (!num) continue;
            const formatted = formatPhoneNumber(num);
            if (formatted.length < 5 || seen.has(formatted)) continue;
            seen.add(formatted);
            validPhones.push({
              id: p.id,
              label: p.label || 'mobile',
              number: num,
              formattedNumber: formatted,
            });
          }

          if (validPhones.length === 0) continue;

          const key = `${rawName.toLowerCase()}_${validPhones[0].formattedNumber}`;
          if (!contactMap.has(key)) {
            contactMap.set(key, {
              id: (item as any).id || key,
              name: rawName,
              initials: getInitials(rawName),
              phoneNumbers: validPhones,
              primaryPhone: validPhones[0].formattedNumber,
              isFavorite: !!item.isFavourite,
            });
          }
        }
      }
    }
  } catch (err1) {
    // Continue to Strategy 2
  }

  // Strategy 2: Legacy getContactsAsync
  if (contactMap.size === 0) {
    try {
      const res = await LegacyContacts.getContactsAsync({});
      if (res && res.data && res.data.length > 0) {
        for (const c of res.data) {
          const name = c.name?.trim() || `${c.firstName || ''} ${c.lastName || ''}`.trim();
          if (!name) continue;

          const phones = c.phoneNumbers || [];
          const validPhones: ContactPhoneNumber[] = [];
          const seenNumbers = new Set<string>();

          for (const p of phones) {
            if (!p.number) continue;
            const formatted = formatPhoneNumber(p.number);
            if (formatted.length < 5 || seenNumbers.has(formatted)) continue;
            seenNumbers.add(formatted);
            validPhones.push({
              id: p.id,
              label: p.label || 'mobile',
              number: p.number,
              formattedNumber: formatted,
            });
          }

          if (validPhones.length === 0) continue;

          const key = `${name.toLowerCase()}_${validPhones[0].formattedNumber}`;
          if (!contactMap.has(key)) {
            contactMap.set(key, {
              id: c.id || key,
              name,
              initials: getInitials(name),
              phoneNumbers: validPhones,
              primaryPhone: validPhones[0].formattedNumber,
            });
          }
        }
      }
    } catch (err2) {
      // Continue
    }
  }

  const sortedList = Array.from(contactMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  return sortedList;
}

/**
 * Filter contacts by search query (name case-insensitive or phone digits)
 */
export function filterContacts(contacts: AppContact[], query: string): AppContact[] {
  const q = query.trim().toLowerCase();
  if (!q) return contacts;

  const digitsQuery = q.replace(/[^\d+]/g, '');

  return contacts.filter((contact) => {
    // 1. Match name
    if (contact.name.toLowerCase().includes(q)) {
      return true;
    }
    // 2. Match phone number digits
    if (digitsQuery.length > 0) {
      for (const phone of contact.phoneNumbers) {
        if (phone.formattedNumber.includes(digitsQuery)) {
          return true;
        }
      }
    }
    return false;
  });
}
