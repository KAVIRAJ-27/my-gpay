import * as SQLite from 'expo-sqlite';
import { USER_PROFILE } from '@/data/mockData';

export interface DemoTransactionRecord {
  id: string;
  recipient_name: string;
  recipient_phone_masked: string;
  amount: number;
  note: string;
  type: 'debit' | 'credit';
  category: 'transfer' | 'topup' | 'reset';
  status: 'SIMULATED';
  timestamp: number;
  created_at_formatted: string;
}

export interface DemoWalletRecord {
  wallet_id: string;
  balance: number;
  currency: string;
  last_updated: number;
}

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Format a numeric timestamp into a human-readable date/time string
 */
export function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const day = date.getDate().toString().padStart(2, '0');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // '0' should be '12'

  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

/**
 * Generate an unambiguous internal demo record ID
 * Strictly formatted as DEMO-TXN-... to prevent confusion with real UPI refs
 */
export function generateDemoRecordId(): string {
  const now = Date.now();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DEMO-TXN-${now}-${rand}`;
}

/**
 * Initialize the SQLite database and create schemas if needed
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  const db = await SQLite.openDatabaseAsync('gpay_nu_demo.db');
  dbInstance = db;

  // Create demo wallet table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS demo_wallet (
      wallet_id TEXT PRIMARY KEY,
      balance REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      last_updated INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS demo_transactions (
      id TEXT PRIMARY KEY,
      recipient_name TEXT NOT NULL,
      recipient_phone_masked TEXT NOT NULL,
      amount REAL NOT NULL,
      note TEXT,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'SIMULATED',
      timestamp INTEGER NOT NULL,
      created_at_formatted TEXT NOT NULL
    );
  `);

  // Ensure initial wallet record exists with default demo balance
  const walletRow = await db.getFirstAsync<DemoWalletRecord>(
    'SELECT * FROM demo_wallet WHERE wallet_id = ?',
    ['default_wallet']
  );

  if (!walletRow) {
    const initialBalance = USER_PROFILE.demoBalance; // 24850.00
    const now = Date.now();
    await db.runAsync(
      'INSERT INTO demo_wallet (wallet_id, balance, currency, last_updated) VALUES (?, ?, ?, ?)',
      ['default_wallet', initialBalance, 'INR', now]
    );

    // Seed 2 initial sample demo transactions for a realistic initial Activity tab
    const seed1Id = `DEMO-TXN-${now - 3600000 * 24}-1021`;
    const seed2Id = `DEMO-TXN-${now - 3600000 * 48}-1022`;

    await db.runAsync(
      `INSERT INTO demo_transactions 
        (id, recipient_name, recipient_phone_masked, amount, note, type, category, status, timestamp, created_at_formatted) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        seed1Id,
        'Alex Rivera',
        '+91 98765 •••••',
        350.00,
        'Coffee & snacks',
        'debit',
        'transfer',
        'SIMULATED',
        now - 3600000 * 24,
        formatTimestamp(now - 3600000 * 24),
      ]
    );

    await db.runAsync(
      `INSERT INTO demo_transactions 
        (id, recipient_name, recipient_phone_masked, amount, note, type, category, status, timestamp, created_at_formatted) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        seed2Id,
        'Priya Sharma',
        '+91 98450 •••••',
        1200.00,
        'Weekend dinner share',
        'debit',
        'transfer',
        'SIMULATED',
        now - 3600000 * 48,
        formatTimestamp(now - 3600000 * 48),
      ]
    );
  }

  return db;
}

/**
 * Retrieve current simulated balance from SQLite
 */
export async function getDemoBalance(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ balance: number }>(
    'SELECT balance FROM demo_wallet WHERE wallet_id = ?',
    ['default_wallet']
  );
  return row ? row.balance : USER_PROFILE.demoBalance;
}

/**
 * Execute an atomic local simulated transfer
 * Validates sufficient funds, deducts balance, and logs simulated transaction atomically
 */
export async function executeDemoTransfer(params: {
  recipientName: string;
  recipientPhoneMasked: string;
  amount: number;
  note?: string;
}): Promise<{ transaction: DemoTransactionRecord; newBalance: number }> {
  const db = await getDatabase();
  const { recipientName, recipientPhoneMasked, amount, note = '' } = params;

  if (amount <= 0) {
    throw new Error('Simulated transfer amount must be greater than zero.');
  }

  const now = Date.now();
  const txnId = generateDemoRecordId();
  const formattedTime = formatTimestamp(now);

  let newBalance = 0;
  let createdTxn: DemoTransactionRecord | null = null;

  // Use SQLite transaction for atomic deduction and insertion
  await db.withTransactionAsync(async () => {
    // 1. Check current balance
    const currentWallet = await db.getFirstAsync<DemoWalletRecord>(
      'SELECT balance FROM demo_wallet WHERE wallet_id = ?',
      ['default_wallet']
    );

    const currentBalance = currentWallet ? currentWallet.balance : 0;

    if (currentBalance < amount) {
      throw new Error(
        `Insufficient demo balance. Available: ₹${currentBalance.toLocaleString(
          'en-IN',
          { minimumFractionDigits: 2 }
        )}, Required: ₹${amount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
        })}`
      );
    }

    newBalance = currentBalance - amount;

    // 2. Update wallet balance
    await db.runAsync(
      'UPDATE demo_wallet SET balance = ?, last_updated = ? WHERE wallet_id = ?',
      [newBalance, now, 'default_wallet']
    );

    // 3. Insert transaction record
    await db.runAsync(
      `INSERT INTO demo_transactions 
        (id, recipient_name, recipient_phone_masked, amount, note, type, category, status, timestamp, created_at_formatted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        txnId,
        recipientName,
        recipientPhoneMasked,
        amount,
        note.trim(),
        'debit',
        'transfer',
        'SIMULATED',
        now,
        formattedTime,
      ]
    );

    createdTxn = {
      id: txnId,
      recipient_name: recipientName,
      recipient_phone_masked: recipientPhoneMasked,
      amount,
      note: note.trim(),
      type: 'debit',
      category: 'transfer',
      status: 'SIMULATED',
      timestamp: now,
      created_at_formatted: formattedTime,
    };
  });

  if (!createdTxn) {
    throw new Error('Transaction execution failed.');
  }

  return { transaction: createdTxn, newBalance };
}

/**
 * Add simulated demo funds to local wallet
 */
export async function addDemoFunds(
  amount: number,
  note = 'Simulated top-up'
): Promise<{ transaction: DemoTransactionRecord; newBalance: number }> {
  const db = await getDatabase();
  const now = Date.now();
  const txnId = generateDemoRecordId();
  const formattedTime = formatTimestamp(now);

  let newBalance = 0;
  let createdTxn: DemoTransactionRecord | null = null;

  await db.withTransactionAsync(async () => {
    const currentWallet = await db.getFirstAsync<DemoWalletRecord>(
      'SELECT balance FROM demo_wallet WHERE wallet_id = ?',
      ['default_wallet']
    );

    const currentBalance = currentWallet ? currentWallet.balance : 0;
    newBalance = currentBalance + amount;

    await db.runAsync(
      'UPDATE demo_wallet SET balance = ?, last_updated = ? WHERE wallet_id = ?',
      [newBalance, now, 'default_wallet']
    );

    await db.runAsync(
      `INSERT INTO demo_transactions 
        (id, recipient_name, recipient_phone_masked, amount, note, type, category, status, timestamp, created_at_formatted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        txnId,
        'Demo Cash Top-up',
        'Local Wallet',
        amount,
        note,
        'credit',
        'topup',
        'SIMULATED',
        now,
        formattedTime,
      ]
    );

    createdTxn = {
      id: txnId,
      recipient_name: 'Demo Cash Top-up',
      recipient_phone_masked: 'Local Wallet',
      amount,
      note,
      type: 'credit',
      category: 'topup',
      status: 'SIMULATED',
      timestamp: now,
      created_at_formatted: formattedTime,
    };
  });

  return { transaction: createdTxn!, newBalance };
}

/**
 * Reset local demo wallet to default initial balance (24,850.00)
 */
export async function resetDemoWallet(): Promise<{ newBalance: number }> {
  const db = await getDatabase();
  const now = Date.now();
  const initialBalance = USER_PROFILE.demoBalance; // 24850.00
  const txnId = generateDemoRecordId();
  const formattedTime = formatTimestamp(now);

  await db.withTransactionAsync(async () => {
    // Reset balance
    await db.runAsync(
      'UPDATE demo_wallet SET balance = ?, last_updated = ? WHERE wallet_id = ?',
      [initialBalance, now, 'default_wallet']
    );

    // Record reset event in transactions log
    await db.runAsync(
      `INSERT INTO demo_transactions 
        (id, recipient_name, recipient_phone_masked, amount, note, type, category, status, timestamp, created_at_formatted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        txnId,
        'Wallet Reset',
        'Initial State',
        initialBalance,
        'Demo wallet reset to initial prototype state',
        'credit',
        'reset',
        'SIMULATED',
        now,
        formattedTime,
      ]
    );
  });

  return { newBalance: initialBalance };
}

/**
 * Retrieve all transactions sorted newest first
 */
export async function getAllDemoTransactions(): Promise<DemoTransactionRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DemoTransactionRecord>(
    'SELECT * FROM demo_transactions ORDER BY timestamp DESC'
  );
  return rows;
}

/**
 * Retrieve recent transactions for preview (limit 4)
 */
export async function getRecentDemoTransactions(
  limit = 4
): Promise<DemoTransactionRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DemoTransactionRecord>(
    'SELECT * FROM demo_transactions ORDER BY timestamp DESC LIMIT ?',
    [limit]
  );
  return rows;
}
