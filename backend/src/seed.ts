import type { SparePartUsage } from "./models/SparePartUsage";
import type { SparePartStock } from "./models/SparePartStock";
import type { SparePartStockLog } from "./models/SparePartStockLog";

interface SeedState {
  gridAsset: any[];
  faultReport: any[];
  repairTicket: any[];
  crew: any[];
  sparePartUsage: SparePartUsage[];
  sparePartStock: SparePartStock[];
  sparePartStockLog: SparePartStockLog[];
}

const now = "2026-09-28T08:00:00Z";

const initialSparePartUsage: SparePartUsage[] = [
  {
    id: 1,
    ticket_id: 1,
    part_code: "DLQ-10kV-001",
    part_name: "10kV柱上断路器",
    quantity: 2,
    actual_quantity: 2,
    warehouse_name: "中心仓库",
    approved_by: "",
    usage_status: "PENDING",
    created_at: "2026-09-28T06:10:00Z",
    approved_at: "",
    returned_at: ""
  },
  {
    id: 2,
    ticket_id: 1,
    part_code: "BLQ-010-002",
    part_name: "10kV跌落式熔断器",
    quantity: 3,
    actual_quantity: 3,
    warehouse_name: "中心仓库",
    approved_by: "",
    usage_status: "PENDING",
    created_at: "2026-09-28T06:12:00Z",
    approved_at: "",
    returned_at: ""
  },
  {
    id: 3,
    ticket_id: 2,
    part_code: "DLQ-10kV-001",
    part_name: "10kV柱上断路器",
    quantity: 1,
    actual_quantity: 1,
    warehouse_name: "中心仓库",
    approved_by: "",
    usage_status: "PENDING",
    created_at: "2026-09-28T07:05:00Z",
    approved_at: "",
    returned_at: ""
  },
  {
    id: 4,
    ticket_id: 3,
    part_code: "JDX-JK-009",
    part_name: "架空绝缘导线(米)",
    quantity: 50,
    actual_quantity: 50,
    warehouse_name: "城东前置仓",
    approved_by: "",
    usage_status: "PENDING",
    created_at: "2026-09-28T07:20:00Z",
    approved_at: "",
    returned_at: ""
  }
];

const initialSparePartStock: SparePartStock[] = [
  { id: 1, part_code: "DLQ-10kV-001", part_name: "10kV柱上断路器", warehouse_name: "中心仓库", remaining_quantity: 2, updated_at: now },
  { id: 2, part_code: "BLQ-010-002", part_name: "10kV跌落式熔断器", warehouse_name: "中心仓库", remaining_quantity: 8, updated_at: now },
  { id: 3, part_code: "JDX-JK-009", part_name: "架空绝缘导线(米)", warehouse_name: "城东前置仓", remaining_quantity: 120, updated_at: now }
];

export const seed: SeedState = {
  "gridAsset": [
    {
      "id": 1,
      "asset_code": "asset code 1",
      "asset_type": "VOLTAGE_LOW",
      "feeder_line": "feeder line 1",
      "voltage_level": "LOW",
      "location_desc": "location desc 1",
      "health_status": "ASSIGNED",
      "owner_team_id": 1
    },
    {
      "id": 2,
      "asset_code": "asset code 2",
      "asset_type": "TRIP",
      "feeder_line": "feeder line 2",
      "voltage_level": "MEDIUM",
      "location_desc": "location desc 2",
      "health_status": "ARRIVED",
      "owner_team_id": 2
    },
    {
      "id": 3,
      "asset_code": "asset code 3",
      "asset_type": "EQUIPMENT_DAMAGE",
      "feeder_line": "feeder line 3",
      "voltage_level": "HIGH",
      "location_desc": "location desc 3",
      "health_status": "WAIT_DISPATCH",
      "owner_team_id": 3
    }
  ],
  "faultReport": [
    {
      "id": 1,
      "reporter_name": "reporter name 1",
      "phone": "13800000001",
      "asset_id": 1,
      "fault_type": "VOLTAGE_LOW",
      "address_desc": "address desc 1",
      "severity": "severity 1",
      "report_channel": "report channel 1",
      "status": "ASSIGNED"
    },
    {
      "id": 2,
      "reporter_name": "reporter name 2",
      "phone": "13800000002",
      "asset_id": 2,
      "fault_type": "TRIP",
      "address_desc": "address desc 2",
      "severity": "severity 2",
      "report_channel": "report channel 2",
      "status": "ARRIVED"
    },
    {
      "id": 3,
      "reporter_name": "reporter name 3",
      "phone": "13800000003",
      "asset_id": 3,
      "fault_type": "EQUIPMENT_DAMAGE",
      "address_desc": "address desc 3",
      "severity": "severity 3",
      "report_channel": "report channel 3",
      "status": "WAIT_DISPATCH"
    }
  ],
  "repairTicket": [
    {
      "id": 1,
      "fault_report_id": 1,
      "team_id": 1,
      "dispatcher_id": 1,
      "priority": "priority 1",
      "status": "REPAIRING",
      "assigned_at": "2026-09-28T05:30:00Z",
      "restored_at": ""
    },
    {
      "id": 2,
      "fault_report_id": 2,
      "team_id": 2,
      "dispatcher_id": 2,
      "priority": "priority 2",
      "status": "REPAIRING",
      "assigned_at": "2026-09-28T06:20:00Z",
      "restored_at": ""
    },
    {
      "id": 3,
      "fault_report_id": 3,
      "team_id": 3,
      "dispatcher_id": 3,
      "priority": "priority 3",
      "status": "REPAIRING",
      "assigned_at": "2026-09-28T07:00:00Z",
      "restored_at": ""
    }
  ],
  "crew": [
    {
      "id": 1,
      "name": "name 1",
      "leader_id": 1,
      "skill_tags": "skill tags 1",
      "duty_status": "ASSIGNED",
      "current_ticket_id": 1,
      "contact_phone": "13800000001"
    },
    {
      "id": 2,
      "name": "name 2",
      "leader_id": 2,
      "skill_tags": "skill tags 2",
      "duty_status": "ARRIVED",
      "current_ticket_id": 2,
      "contact_phone": "13800000002"
    },
    {
      "id": 3,
      "name": "name 3",
      "leader_id": 3,
      "skill_tags": "skill tags 3",
      "duty_status": "WAIT_DISPATCH",
      "current_ticket_id": 3,
      "contact_phone": "13800000003"
    }
  ],
  "sparePartUsage": initialSparePartUsage,
  "sparePartStock": initialSparePartStock,
  "sparePartStockLog": []
};
