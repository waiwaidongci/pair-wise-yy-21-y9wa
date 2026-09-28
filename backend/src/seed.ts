import type { GridAsset } from "./models/GridAsset";
import type { FaultReport } from "./models/FaultReport";
import type { RepairTicket } from "./models/RepairTicket";
import type { Crew } from "./models/Crew";
import type { SparePartUsage } from "./models/SparePartUsage";
import type { SparePartStock } from "./models/SparePartStock";

interface SeedData {
  gridAsset: GridAsset[];
  faultReport: FaultReport[];
  repairTicket: RepairTicket[];
  crew: Crew[];
  sparePartUsage: SparePartUsage[];
  sparePartStock: SparePartStock[];
}

// Seeded snapshot used by the in-memory repositories. The same scenario is mirrored
// in frontend/src/mocks/seedData.ts for offline review.
export const seed: SeedData = {
  gridAsset: [
    {
      id: 1,
      asset_code: "asset code 1",
      asset_type: "VOLTAGE_LOW",
      feeder_line: "feeder line 1",
      voltage_level: "LOW",
      location_desc: "location desc 1",
      health_status: "NORMAL",
      owner_team_id: 1
    },
    {
      id: 2,
      asset_code: "asset code 2",
      asset_type: "TRIP",
      feeder_line: "feeder line 2",
      voltage_level: "MEDIUM",
      location_desc: "location desc 2",
      health_status: "WATCH",
      owner_team_id: 2
    },
    {
      id: 3,
      asset_code: "asset code 3",
      asset_type: "EQUIPMENT_DAMAGE",
      feeder_line: "feeder line 3",
      voltage_level: "HIGH",
      location_desc: "location desc 3",
      health_status: "DEGRADED",
      owner_team_id: 3
    }
  ],
  faultReport: [
    {
      id: 1,
      reporter_name: "reporter name 1",
      phone: "13800000001",
      asset_id: 1,
      fault_type: "VOLTAGE_LOW",
      address_desc: "address desc 1",
      severity: "severity 1",
      report_channel: "report channel 1",
      status: "ASSIGNED"
    },
    {
      id: 2,
      reporter_name: "reporter name 2",
      phone: "13800000002",
      asset_id: 2,
      fault_type: "TRIP",
      address_desc: "address desc 2",
      severity: "severity 2",
      report_channel: "report channel 2",
      status: "ARRIVED"
    },
    {
      id: 3,
      reporter_name: "reporter name 3",
      phone: "13800000003",
      asset_id: 3,
      fault_type: "EQUIPMENT_DAMAGE",
      address_desc: "address desc 3",
      severity: "severity 3",
      report_channel: "report channel 3",
      status: "WAIT_DISPATCH"
    }
  ],
  repairTicket: [
    {
      id: 1,
      fault_report_id: 1,
      team_id: 1,
      dispatcher_id: 1,
      priority: "HIGH",
      status: "REPAIRING",
      assigned_at: "2026-09-28T09:00:00Z",
      restored_at: ""
    },
    {
      id: 2,
      fault_report_id: 2,
      team_id: 2,
      dispatcher_id: 2,
      priority: "MEDIUM",
      status: "REPAIRING",
      assigned_at: "2026-09-28T10:00:00Z",
      restored_at: ""
    },
    {
      id: 3,
      fault_report_id: 3,
      team_id: 3,
      dispatcher_id: 3,
      priority: "LOW",
      status: "REPAIRING",
      assigned_at: "2026-09-28T11:00:00Z",
      restored_at: ""
    }
  ],
  crew: [
    {
      id: 1,
      name: "name 1",
      leader_id: 1,
      skill_tags: "skill tags 1",
      duty_status: "ASSIGNED",
      current_ticket_id: 1,
      contact_phone: "13800000001"
    },
    {
      id: 2,
      name: "name 2",
      leader_id: 2,
      skill_tags: "skill tags 2",
      duty_status: "ARRIVED",
      current_ticket_id: 2,
      contact_phone: "13800000002"
    },
    {
      id: 3,
      name: "name 3",
      leader_id: 3,
      skill_tags: "skill tags 3",
      duty_status: "WAIT_DISPATCH",
      current_ticket_id: 3,
      contact_phone: "13800000003"
    }
  ],
  sparePartUsage: [
    // Ticket 1: all usages approved -> restoration succeeds.
    {
      id: 1,
      ticket_id: 1,
      part_code: "SP-001",
      part_name: "低压熔断器",
      quantity: 3,
      warehouse_name: "中心仓库",
      approved_by: "仓管-王敏",
      usage_status: "APPROVED",
      issued_quantity: 3
    },
    {
      id: 2,
      ticket_id: 1,
      part_code: "SP-002",
      part_name: "绝缘胶带",
      quantity: 2,
      warehouse_name: "中心仓库",
      approved_by: "仓管-王敏",
      usage_status: "APPROVED",
      issued_quantity: 2
    },
    // Ticket 2: one approved, one pending -> restoration rejected with SP-003 pending.
    {
      id: 3,
      ticket_id: 2,
      part_code: "SP-001",
      part_name: "低压熔断器",
      quantity: 1,
      warehouse_name: "中心仓库",
      approved_by: "仓管-王敏",
      usage_status: "APPROVED",
      issued_quantity: 1
    },
    {
      id: 4,
      ticket_id: 2,
      part_code: "SP-003",
      part_name: "10kV 电缆中间接头",
      quantity: 1,
      warehouse_name: "中心仓库",
      approved_by: null,
      usage_status: "PENDING",
      issued_quantity: null
    },
    // Ticket 3: one pending and one stock-insufficient -> restoration rejected with both codes.
    {
      id: 5,
      ticket_id: 3,
      part_code: "SP-002",
      part_name: "绝缘胶带",
      quantity: 5,
      warehouse_name: "中心仓库",
      approved_by: null,
      usage_status: "PENDING",
      issued_quantity: null
    },
    {
      id: 6,
      ticket_id: 3,
      part_code: "SP-004",
      part_name: "柱上断路器控制器",
      quantity: 1,
      warehouse_name: "中心仓库",
      approved_by: "仓管-王敏",
      usage_status: "STOCK_INSUFFICIENT",
      issued_quantity: 1
    }
  ],
  sparePartStock: [
    // SP-001: 20 - 3 (ticket 1) - 1 (ticket 2) = 16
    { part_code: "SP-001", part_name: "低压熔断器", warehouse_name: "中心仓库", remaining_quantity: 16 },
    // SP-002: 10 - 2 (ticket 1) = 8, ticket 3 requests 5 (pending, not deducted)
    { part_code: "SP-002", part_name: "绝缘胶带", warehouse_name: "中心仓库", remaining_quantity: 8 },
    { part_code: "SP-003", part_name: "10kV 电缆中间接头", warehouse_name: "中心仓库", remaining_quantity: 4 },
    // SP-004: ticket 3 approval failed because only 0 remain for 1 requested
    { part_code: "SP-004", part_name: "柱上断路器控制器", warehouse_name: "中心仓库", remaining_quantity: 0 }
  ]
};
