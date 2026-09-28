export const Role = ["DISPATCHER", "LEADER", "WAREHOUSE_KEEPER", "AUDITOR"] as const;
export type Role = (typeof Role)[number];

export const RoleText: Record<Role, string> = {
  DISPATCHER: "调度员",
  LEADER: "抢修班组长",
  WAREHOUSE_KEEPER: "仓管",
  AUDITOR: "审计员"
};
