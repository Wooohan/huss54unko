import { User, BlockedIP } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const dbRowToUser = (row: any): User => ({
  id: row.user_id,
  name: row.name,
  email: row.email,
  role: row.role as 'user' | 'admin',
  plan: row.plan as 'Free' | 'Starter' | 'Pro' | 'Enterprise',
  dailyLimit: row.daily_limit,
  recordsExtractedToday: row.records_extracted_today,
  lastActive: row.last_active || 'Never',
  ipAddress: row.ip_address || '',
  isOnline: row.is_online || false,
  isBlocked: row.is_blocked || false
});

const userToDbRow = (user: User) => ({
  user_id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  plan: user.plan,
  daily_limit: user.dailyLimit,
  records_extracted_today: user.recordsExtractedToday,
  last_active: user.lastActive,
  ip_address: user.ipAddress,
  is_online: user.isOnline,
  is_blocked: user.isBlocked || false
});

export const fetchUsersFromSupabase = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users`);
    if (!response.ok) {
      console.error('Error fetching users:', response.statusText);
      return [];
    }
    const data = await response.json();
    return (data || []).map(dbRowToUser);
  } catch (err) {
    console.error('Error in fetchUsersFromSupabase:', err);
    return [];
  }
};

export const fetchUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/by-email/${encodeURIComponent(email.toLowerCase())}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data) return null;
    return dbRowToUser(data);
  } catch (err) {
    console.error('Error in fetchUserByEmail:', err);
    return null;
  }
};

export const createUserInSupabase = async (user: User, passwordHash?: string): Promise<User | null> => {
  try {
    const dbRow: Record<string, unknown> = { ...userToDbRow(user) };
    if (passwordHash) {
      dbRow.password_hash = passwordHash;
    }

    const response = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbRow),
    });

    if (!response.ok) {
      console.error('Error creating user:', response.statusText);
      return null;
    }

    const data = await response.json();
    return dbRowToUser(data);
  } catch (err) {
    console.error('Error in createUserInSupabase:', err);
    return null;
  }
};

export const updateUserInSupabase = async (user: User): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/${encodeURIComponent(user.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.name,
        role: user.role,
        plan: user.plan,
        daily_limit: user.dailyLimit,
        records_extracted_today: user.recordsExtractedToday,
        last_active: user.lastActive,
        ip_address: user.ipAddress,
        is_online: user.isOnline,
        is_blocked: user.isBlocked || false
      }),
    });

    if (!response.ok) {
      console.error('Error updating user:', response.statusText);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in updateUserInSupabase:', err);
    return false;
  }
};

export const deleteUserFromSupabase = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      console.error('Error deleting user:', response.statusText);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in deleteUserFromSupabase:', err);
    return false;
  }
};

export const fetchBlockedIPsFromSupabase = async (): Promise<BlockedIP[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/blocked-ips`);
    if (!response.ok) {
      console.error('Error fetching blocked IPs:', response.statusText);
      return [];
    }
    const data = await response.json();
    return (data || []).map((row: any) => ({
      ip: row.ip_address,
      blockedAt: row.blocked_at,
      reason: row.reason || 'No reason provided'
    }));
  } catch (err) {
    console.error('Error in fetchBlockedIPsFromSupabase:', err);
    return [];
  }
};

export const blockIPInSupabase = async (ip: string, reason: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/blocked-ips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ip_address: ip,
        reason: reason || 'No reason provided'
      }),
    });

    if (!response.ok) {
      console.error('Error blocking IP:', response.statusText);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in blockIPInSupabase:', err);
    return false;
  }
};

export const unblockIPInSupabase = async (ip: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/blocked-ips/${encodeURIComponent(ip)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      console.error('Error unblocking IP:', response.statusText);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in unblockIPInSupabase:', err);
    return false;
  }
};

export const verifyUserPassword = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/verify-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase(), password }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.valid === true;
  } catch (err) {
    console.error('Error in verifyUserPassword:', err);
    return false;
  }
};

export const isIPBlocked = async (ip: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/blocked-ips/check/${encodeURIComponent(ip)}`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.blocked === true;
  } catch (err) {
    return false;
  }
};
