import { useState } from "react";

const ADMIN_PIN = "admin123";
const STORAGE_KEY = "kdm_admin_auth";

export function useLocalAdminAuth() {
  const [authed, setAuthed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true",
  );

  const login = (pin: string): boolean => {
    if (pin === ADMIN_PIN) {
      localStorage.setItem(STORAGE_KEY, "true");
      setAuthed(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
  };

  return { authed, login, logout };
}
