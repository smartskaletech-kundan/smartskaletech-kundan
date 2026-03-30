import { useState } from "react";

const SUPER_ADMIN_EMAIL = "smartskale001@gmail.com";
const SUPER_ADMIN_PASSWORD = "SmartSkale@26";
const ACCOUNTS_KEY = "kdm_owner_accounts";
const SESSION_KEY = "kdm_auth_session";
const STAFF_ACCOUNTS_KEY = "kdm_staff_accounts";

export interface OwnerAccount {
  id: string;
  email: string;
  password: string;
  hotelName: string;
  ownerName: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  staffRole:
    | "Receptionist"
    | "Restaurant Staff"
    | "Housekeeping"
    | "Manager"
    | "Kitchen Staff"
    | "Security"
    | "Front Desk";
  status: "active" | "inactive";
  createdAt: string;
}

export interface AuthSession {
  email: string;
  role: "superadmin" | "owner" | "staff";
  hotelName: string;
  ownerName: string;
  staffRole?: string;
  isLoggedIn: boolean;
}

function getStoredSession(): AuthSession | null {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    if (!s) return null;
    const parsed = JSON.parse(s);
    return parsed?.isLoggedIn ? parsed : null;
  } catch {
    return null;
  }
}

function getOwnerAccountsRaw(): OwnerAccount[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function getStaffAccountsRaw(): StaffAccount[] {
  try {
    return JSON.parse(localStorage.getItem(STAFF_ACCOUNTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useMultiOwnerAuth() {
  const [session, setSession] = useState<AuthSession | null>(() =>
    getStoredSession(),
  );

  const authed = !!session?.isLoggedIn;
  const role = session?.role ?? null;

  const login = (email: string, password: string): boolean => {
    const normalizedEmail = email.trim().toLowerCase();
    // Check super admin
    if (
      normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase() &&
      password === SUPER_ADMIN_PASSWORD
    ) {
      const s: AuthSession = {
        email: SUPER_ADMIN_EMAIL,
        role: "superadmin",
        hotelName: "Hotel KDM Palace",
        ownerName: "Super Admin",
        isLoggedIn: true,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      setSession(s);
      return true;
    }
    // Check owner accounts
    const accounts = getOwnerAccountsRaw();
    const account = accounts.find(
      (a) =>
        a.email.toLowerCase() === normalizedEmail && a.password === password,
    );
    if (account) {
      if (account.status !== "approved") {
        return false; // not approved
      }
      const s: AuthSession = {
        email: account.email,
        role: "owner",
        hotelName: account.hotelName,
        ownerName: account.ownerName,
        isLoggedIn: true,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      setSession(s);
      return true;
    }
    // Check staff accounts
    const staffAccounts = getStaffAccountsRaw();
    const staffAccount = staffAccounts.find(
      (a) =>
        a.email.toLowerCase() === normalizedEmail &&
        a.password === password &&
        a.status === "active",
    );
    if (staffAccount) {
      const s: AuthSession = {
        email: staffAccount.email,
        role: "staff",
        hotelName: "Hotel KDM Palace",
        ownerName: staffAccount.name,
        staffRole: staffAccount.staffRole,
        isLoggedIn: true,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      setSession(s);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  const signupOwner = (data: {
    hotelName: string;
    ownerName: string;
    email: string;
    phone: string;
    password: string;
  }): { success: boolean; error?: string } => {
    const accounts = getOwnerAccountsRaw();
    if (
      accounts.find((a) => a.email.toLowerCase() === data.email.toLowerCase())
    ) {
      return { success: false, error: "Email already registered." };
    }
    const newAccount: OwnerAccount = {
      id: `owner_${Date.now()}`,
      email: data.email,
      password: data.password,
      hotelName: data.hotelName,
      ownerName: data.ownerName,
      phone: data.phone,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    accounts.push(newAccount);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    return { success: true };
  };

  const getOwnerAccounts = (): OwnerAccount[] => getOwnerAccountsRaw();

  const approveOwner = (id: string) => {
    const accounts = getOwnerAccountsRaw().map((a) =>
      a.id === id ? { ...a, status: "approved" as const } : a,
    );
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  };

  const rejectOwner = (id: string) => {
    const accounts = getOwnerAccountsRaw().map((a) =>
      a.id === id ? { ...a, status: "rejected" as const } : a,
    );
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  };

  // Check if a pending account was rejected (for login error messaging)
  const getAccountStatus = (
    email: string,
  ): "pending" | "approved" | "rejected" | "notfound" => {
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())
      return "approved";
    const account = getOwnerAccountsRaw().find(
      (a) => a.email.toLowerCase() === email.toLowerCase(),
    );
    return account ? account.status : "notfound";
  };

  const getStaffAccounts = (): StaffAccount[] => getStaffAccountsRaw();

  const addStaffAccount = (data: {
    name: string;
    email: string;
    password: string;
    staffRole: StaffAccount["staffRole"];
  }): { success: boolean; error?: string } => {
    const normalizedEmail = data.email.toLowerCase();
    // Check uniqueness across staff accounts
    const staffAccounts = getStaffAccountsRaw();
    if (staffAccounts.find((a) => a.email.toLowerCase() === normalizedEmail)) {
      return {
        success: false,
        error: "Email already exists in staff accounts.",
      };
    }
    // Check uniqueness across owner accounts
    const ownerAccounts = getOwnerAccountsRaw();
    if (ownerAccounts.find((a) => a.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: "Email already registered as an owner." };
    }
    // Check against super admin
    if (normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: "Email already in use." };
    }
    const newAccount: StaffAccount = {
      id: `staff_${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password,
      staffRole: data.staffRole,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    staffAccounts.push(newAccount);
    localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(staffAccounts));
    return { success: true };
  };

  const updateStaffAccount = (
    id: string,
    data: Partial<StaffAccount>,
  ): void => {
    const accounts = getStaffAccountsRaw().map((a) =>
      a.id === id ? { ...a, ...data } : a,
    );
    localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(accounts));
  };

  const deleteStaffAccount = (id: string): void => {
    const accounts = getStaffAccountsRaw().filter((a) => a.id !== id);
    localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(accounts));
  };

  return {
    authed,
    role,
    session,
    login,
    logout,
    signupOwner,
    getOwnerAccounts,
    approveOwner,
    rejectOwner,
    getAccountStatus,
    getStaffAccounts,
    addStaffAccount,
    updateStaffAccount,
    deleteStaffAccount,
  };
}
