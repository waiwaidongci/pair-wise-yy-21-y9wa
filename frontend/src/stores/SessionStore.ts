import { defineStore } from "pinia";
import { Role, type Role as RoleType } from "../constants/Role";

const STORAGE_KEY = "grid-repair-role";

const readInitialRole = (): RoleType => {
  if (typeof localStorage === "undefined") return "LEADER";
  const saved = localStorage.getItem(STORAGE_KEY) as RoleType | null;
  return saved && (Role as readonly string[]).includes(saved) ? saved : "LEADER";
};

// Dev session shim shared by the API request header and the RBAC button visibility.
export const useSessionStore = defineStore("session", {
  state: () => ({ role: readInitialRole() as RoleType }),
  actions: {
    setRole(role: RoleType) {
      this.role = role;
      if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, role);
    }
  }
});
