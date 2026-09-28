export const Role = ["DISPATCHER", "LEADER", "WAREHOUSE_KEEPER", "AUDITOR"] as const;
export type Role = (typeof Role)[number];

export const ROLE_LABEL: Record<Role, string> = {
  DISPATCHER: "调度员",
  LEADER: "班组长",
  WAREHOUSE_KEEPER: "仓管",
  AUDITOR: "审计员"
};
