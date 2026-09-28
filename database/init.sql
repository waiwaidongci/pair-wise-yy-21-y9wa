CREATE TABLE IF NOT EXISTS grid_asset (
  id INTEGER PRIMARY KEY,
  asset_code TEXT,
  asset_type TEXT,
  feeder_line TEXT,
  voltage_level TEXT,
  location_desc TEXT,
  health_status TEXT,
  owner_team_id TEXT
);

CREATE TABLE IF NOT EXISTS fault_report (
  id INTEGER PRIMARY KEY,
  reporter_name TEXT,
  phone TEXT,
  asset_id TEXT,
  fault_type TEXT,
  address_desc TEXT,
  severity TEXT,
  report_channel TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS repair_ticket (
  id INTEGER PRIMARY KEY,
  fault_report_id TEXT,
  team_id TEXT,
  dispatcher_id TEXT,
  priority TEXT,
  status TEXT,
  assigned_at TEXT,
  restored_at TEXT
);

CREATE TABLE IF NOT EXISTS crew (
  id INTEGER PRIMARY KEY,
  name TEXT,
  leader_id TEXT,
  skill_tags TEXT,
  duty_status TEXT,
  current_ticket_id TEXT,
  contact_phone TEXT
);

CREATE TABLE IF NOT EXISTS spare_part_usage (
  id INTEGER PRIMARY KEY,
  ticket_id TEXT,
  part_code TEXT,
  part_name TEXT,
  quantity TEXT,
  warehouse_name TEXT,
  approved_by TEXT,
  usage_status TEXT,
  -- 实发数量：审批通过后按该数量核销仓库余量
  issued_quantity TEXT
);

-- 备件仓库余量，按 仓库 + 备件编码 维护
CREATE TABLE IF NOT EXISTS spare_part_stock (
  part_code TEXT,
  warehouse_name TEXT,
  part_name TEXT,
  remaining_quantity INTEGER,
  PRIMARY KEY (part_code, warehouse_name)
);

-- 备件库存流水：审批出库扣减、退回补回
CREATE TABLE IF NOT EXISTS spare_part_stock_log (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  part_code TEXT,
  warehouse_name TEXT,
  usage_id INTEGER,
  change_type TEXT,
  change_quantity INTEGER,
  remaining_quantity INTEGER,
  actor TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT
);
