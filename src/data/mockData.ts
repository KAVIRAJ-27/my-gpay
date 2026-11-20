/**
 * G Pay.nu - Mock Simulation Data
 * Exact values matching the user reference screenshots.
 * 
 * IMPORTANT:
 * All entries in this file are strictly for local offline prototype simulation.
 * No real banking or UPI integration is performed.
 */

export interface FictionalContact {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
  initials: string;
}

export interface DemoActivity {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: 'sent' | 'received';
  timestamp: string;
  category: string;
  iconName: string;
}

export const USER_PROFILE = {
  name: 'Kaviraj',
  fullName: 'KAVIRAJ. R',
  upiId: 'kaviraj5440@oksbi',
  phone: '8220249634',
  phoneMasked: '8220249634',
  demoBalance: 24850.00,
  currency: 'INR',
  currencySymbol: '₹',
  accountNumberMasked: '••••3526',
  bankName: 'Indian Bank',
};

export const FICTIONAL_CONTACTS: FictionalContact[] = [
  {
    id: 'c1',
    name: 'Kaja Mutton Stall',
    handle: 'kajamutton@oksbi',
    avatarColor: '#8E24AA', // Purple
    initials: 'K',
  },
  {
    id: 'c2',
    name: 'Kishore Saravanan',
    handle: 'kishores@okaxis',
    avatarColor: '#E91E63', // Pink
    initials: 'K',
  },
  {
    id: 'c3',
    name: 'Kanish',
    handle: 'kanish@okhdfcbank',
    avatarColor: '#D81B60', // Magenta
    initials: 'K',
  },
  {
    id: 'c4',
    name: 'JENITTABL ESSY',
    handle: 'jenittabl@okicici',
    avatarColor: '#3F51B5', // Indigo
    initials: 'JE',
  },
  {
    id: 'c5',
    name: 'Mr G SUKUMAR',
    handle: 'gsukumar@oksbi',
    avatarColor: '#2E7D32', // Dark Green
    initials: 'M',
  },
  {
    id: 'c6',
    name: 'Mr Sabesh E',
    handle: 'sabeshe@okaxis',
    avatarColor: '#689F38', // Lime Green
    initials: 'M',
  },
  {
    id: 'c7',
    name: 'KATHIRVEL T',
    handle: 'kathirvelt@oksbi',
    avatarColor: '#EF6C00', // Orange
    initials: 'K',
  },
  {
    id: 'c8',
    name: 'suresh kumar',
    handle: 'sureshk@okicici',
    avatarColor: '#E91E63', // Pink
    initials: 'S',
  },
  {
    id: 'c9',
    name: 'Narasimman A',
    handle: 'narasimmana@okaxis',
    avatarColor: '#1976D2', // Blue
    initials: 'N',
  },
  {
    id: 'c10',
    name: 'Airtel',
    handle: 'airtelbills@airtel',
    avatarColor: '#8E24AA', // Purple
    initials: 'A',
  },
];

export const DEMO_ACTIVITIES: DemoActivity[] = [
  {
    id: 'tx_1',
    title: 'Kaja Mutton Stall',
    subtitle: 'Paid • 19 November',
    amount: 10.00,
    type: 'sent',
    timestamp: '19 November',
    category: 'Groceries',
    iconName: 'restaurant-outline',
  },
  {
    id: 'tx_2',
    title: 'suresh kumar',
    subtitle: 'Paid • 19 November',
    amount: 10.00,
    type: 'sent',
    timestamp: '19 November',
    category: 'Transfer',
    iconName: 'person-outline',
  },
  {
    id: 'tx_3',
    title: 'Narasimman A',
    subtitle: 'Paid • 19 November',
    amount: 400.00,
    type: 'sent',
    timestamp: '19 November',
    category: 'Transfer',
    iconName: 'person-outline',
  },
  {
    id: 'tx_4',
    title: 'Kishore Saravanan',
    subtitle: 'Paid • 19 November',
    amount: 50.00,
    type: 'sent',
    timestamp: '19 November',
    category: 'Transfer',
    iconName: 'person-outline',
  },
  {
    id: 'tx_5',
    title: 'Airtel',
    subtitle: 'Paid • 18 November',
    amount: 39.00,
    type: 'sent',
    timestamp: '18 November',
    category: 'Bill',
    iconName: 'phone-portrait-outline',
  },
];

export interface QuickActionItem {
  id: string;
  title: string;
  iconName: string;
  description: string;
  badge?: string;
}

export const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'qa_scan_qr',
    title: 'Scan any\nQR code',
    iconName: 'qr-code',
    description: 'Scan any QR code to send demo money.',
  },
  {
    id: 'qa_pay_anyone',
    title: 'Pay\nanyone',
    iconName: 'person-add',
    description: 'Pay anyone using local demo contacts.',
  },
  {
    id: 'qa_bank_transfer',
    title: 'Bank\ntransfer',
    iconName: 'business',
    description: 'Transfer to any bank account with mock IFSC.',
  },
  {
    id: 'qa_mobile_recharge',
    title: 'Mobile\nrecharge',
    iconName: 'phone-portrait',
    description: 'Simulated mobile recharge.',
  },
];
