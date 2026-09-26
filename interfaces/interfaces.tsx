import { TempUnit } from "@/utils/stringUtils";

export interface OrganizationMember {
  id: number;
  name: string;
  email: string;
  image_url: string,
  role_id: number;
  role: string;
  active: boolean;
  joined_at: string;
}

export interface SelectedOrgDashboardData {
  members: SelectedOrgMembersSummaryData
  livestocks: SelectedOrgLivestocksSummaryData
  logs: SelectedOrgLivestocksLogsSummaryData
}

export interface SelectedOrgMembersSummaryData {
  total: number,
  active: number,
  inactive: number,
  roles: {
    owner: number,
    admin: number,
    observer: number,
    maintenance: number
  }
}

export interface SelectedOrgLivestocksSummaryData {
  total: number,
  fish: number,
  plant: number,
  harvested: number
}

export interface SelectedOrgLivestocksLogsSummaryData {
  total: number,
  logs: number,
  concerns: {
    total: number,
    open: number,
    closed: number,
    severity: {
      low: number,
      moderate: number,
      high: number,
      critical: number
    }
  }
}

export interface OrganizationDashboardData {
  id: number;
  organization_name: string;
  owner: {
    name: string;
    email: string;
  }
  members_count: number
  livestocks: {
    total: number,
    fish: number,
    plant: number
  }
  sensors_count: number;
}

export interface OrganizationData {
  id: number;
  owner_id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  members: OrganizationMember[];
}

export interface OrganizationFetchResponse {
  status: string;
  data: OrganizationData[];
}

export interface OrgMembersFetchResponse {
  status: string;
  data: OrganizationMember[];
}

export interface UserData {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    created_at: string;
    updated_at: string;
    onboarding_mobile: boolean;
    onboarding_webapp: boolean;
    image_url: string,
    settings: UserSettings;
}

export interface UserOrgRoleResponse {
  status: string;
  data: UserOrgRoleData
}

interface UserOrgRoleData {
  role_id: number;
  role: string;
}

export interface UserSettings {
  temp_unit: string;
}

export interface Role {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

// export interface LivestockProfileData {
//   id: number;
//   organization_id: number;
//   added_by: number;
//   type: string;
//   speciesName: string;
//   data: LivestockPlantTypeData | LivestockFishTypeData;
//   description: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface LivestockData {
//   id: number;
//   organization_id: number;
//   added_by: number;
//   type: string;
//   speciesName: string;
//   data: LivestockPlantTypeData | LivestockFishTypeData;
//   description: string;
//   created_at: string;
//   updated_at: string;
// }

export interface LivestockPlantTypeData {
  harvest_days: number;
  phase: "nursery" | "growbed";
  phase_changed_on: string;
  ideal_temp: {
    temp_unit: TempUnit;
    min: number;
    max: number;
  };
  ph_range: {
    min: number;
    max: number;
  };
  nursery_days: number;
}

export interface LivestockFishTypeData {
  growth_days: number;
  age: number;
  // harvestWeight: number;
  ideal_temp: {
    temp_unit: TempUnit;
    min: number;
    max: number;
  };
  ph_range: {
    min: number;
    max: number;
  };
}

interface BaseLivestockData {
    id: number;
    organization_id: number;
    added_by: {
      id: number,
      name: string,
      email: string
    }
    species_name: string;
    livestock_name: string;
    description: string;
    created_at: string;
    updated_at: string;
    harvested: boolean;
    image_url: string;
    open_concerns_count: number;
    date_of_harvest: string;
}

export interface PlantLivestockData extends BaseLivestockData {
    type: "plant";
    data: LivestockPlantTypeData;
}

export interface FishLivestockData extends BaseLivestockData {
    type: "fish";
    data: LivestockFishTypeData;
}

export type LivestockData =
    | PlantLivestockData
    | FishLivestockData;

interface BaseLivestockProfileData {
    id: number;
    organization_id: number;
    added_by: number;
    species_name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface PlantLivestockProfileData extends BaseLivestockProfileData {
    type: "plant";
    data: LivestockPlantTypeData;
}

export interface FishLivestockProfileData extends BaseLivestockProfileData {
    type: "fish";
    data: LivestockFishTypeData;
}

export type LivestockProfileData = 
    | PlantLivestockProfileData
    | FishLivestockProfileData;

export interface LiveStockLogs {
  id: number;
  livestock_id: number;
  data: JSON;
  recorded_by: number;
  created_at: string;
  updated_at: string;
}

export interface SensorData {
  id: number;
  organization_id: number;
  name: string;
  type: string;
  status: string;
  metadata: {
    chip_id: string;
    device_id: string;
    device_model: string;
    firmware_version: string;
  };
  created_at: string;
  updated_at: string;
  purpose: string;
  sensor_type: string;
  registration_status: string;
  registered_at: string;
  last_seen_at: string;
  is_offline: boolean;
}

interface BaseLivestockLogsData {
  id: number;
  livestock_id: number;
  image_url: string;
  recorded_by: {
    id: number;
    name: string;
  };
  resolved_by: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface LivestockLogsLogTypeData {
  title: string;
  description: string;
}

export interface LivestockLogsConcernTypeData {
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  status: 'open' | 'closed';
  action_taken: string;
}

export interface LogLivestockLogData extends BaseLivestockLogsData {
  type: 'log';
  data: LivestockLogsLogTypeData;
}

export interface ConcernLivestockLogData extends BaseLivestockLogsData {
  type: 'concern';
  data: LivestockLogsConcernTypeData;
}

export type LivestockLogData = 
  | LogLivestockLogData
  | ConcernLivestockLogData