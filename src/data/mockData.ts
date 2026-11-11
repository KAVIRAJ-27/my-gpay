/**
 * G Pay.nu - Mock Simulation Data
 * 
 * IMPORTANT:
 * All entries in this file are strictly fictional for local prototype simulation.
 * No real phone numbers, bank accounts, or financial transactions are referenced.
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
  fullName: 'Kaviraj K.',
  upiId: 'kaviraj@nuwallet',
  phoneMasked: '+91 98•••• 1234',
  demoBalance: 24850.00,
  currency: 'INR',
  currencySymbol: '₹',
  accountNumberMasked: '•••• •••• 5842',
  bankName: 'Axis Demo Bank',
};

export const FICTIONAL_CONTACTS: FictionalContact[] = [
  {
    id: 'c1',
    name: 'Alex Rivera',
    handle: 'alex.r@nu',
    avatarColor: '#6366F1',
    initials: 'AR',
  },
  {
    id: 'c2',
    name: 'Priya Sharma',
    handle: 'priya.s@nu',
    avatarColor: '#10B981',
    initials: 'PS',
  },
  {
    id: 'c3',
    name: 'David Kim',
    handle: 'david.k@nu',
    avatarColor: '#F59E0B',
    initials: 'DK',
  },
  {
    id: 'c4',
    name: 'Sneha Patel',
    handle: 'sneha.p@nu',
    avatarColor: '#EC4899',
    initials: 'SP',
  },
  {
    id: 'c5',
    name: 'Rohan Verma',
    handle: 'rohan.v@nu',
    avatarColor: '#00D2FF',
    initials: 'RV',
  },
  {
    id: 'c6',
    name: 'Ananya Roy',
    handle: 'ananya.r@nu',
    avatarColor: '#8B5CF6',
    initials: 'AR',
  },
];

export const DEMO_ACTIVITIES: DemoActivity[] = [
  {
    id: 'tx_1',
    title: 'Metro Supermarket',
    subtitle: 'Paid to merchant • Simulation',
    amount: 420.00,
    type: 'sent',
    timestamp: 'Today, 2:45 PM',
    category: 'Groceries',
    iconName: 'cart-outline',
  },
  {
    id: 'tx_2',
    title: 'Salary Credit (Demo)',
    subtitle: 'From Acme Corp • Simulation',
    amount: 35000.00,
    type: 'received',
    timestamp: 'Yesterday, 9:15 AM',
    category: 'Income',
    iconName: 'arrow-down-circle-outline',
  },
  {
    id: 'tx_3',
    title: 'Blue Tokai Cafe',
    subtitle: 'Paid to merchant • Simulation',
    amount: 280.00,
    type: 'sent',
    timestamp: '10 Nov, 5:30 PM',
    category: 'Food & Dining',
    iconName: 'cafe-outline',
  },
  {
    id: 'tx_4',
    title: 'Electricity Bill (Demo)',
    subtitle: 'State Power Board • Simulation',
    amount: 1450.00,
    type: 'sent',
    timestamp: '08 Nov, 11:20 AM',
    category: 'Utilities',
    iconName: 'flash-outline',
  },
  {
    id: 'tx_5',
    title: 'Refund: Online Order',
    subtitle: 'Demo Store Refund • Simulation',
    amount: 650.00,
    type: 'received',
    timestamp: '05 Nov, 4:10 PM',
    category: 'Refund',
    iconName: 'refresh-outline',
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
    id: 'scan_qr',
    title: 'Scan QR',
    iconName: 'qr-code-outline',
    description: 'Simulated QR Scanner for offline merchant demo codes.',
  },
  {
    id: 'pay_anyone',
    title: 'Pay anyone',
    iconName: 'person-add-outline',
    description: 'Simulated contact payment interface.',
  },
  {
    id: 'bank_transfer',
    title: 'Bank transfer',
    iconName: 'business-outline',
    description: 'Simulated account-to-account transfer simulation.',
  },
  {
    id: 'recharge',
    title: 'Mobile recharge',
    iconName: 'phone-portrait-outline',
    description: 'Simulated mobile prepaid/postpaid recharge flow.',
  },
  {
    id: 'pay_bills',
    title: 'Pay bills',
    iconName: 'receipt-outline',
    description: 'Simulated utilities, electricity, and water bill payment.',
  },
  {
    id: 'self_transfer',
    title: 'Self transfer',
    iconName: 'swap-horizontal-outline',
    description: 'Simulated transfer between user demo accounts.',
  },
];
