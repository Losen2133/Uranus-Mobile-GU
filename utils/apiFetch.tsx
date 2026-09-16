import { LivestockData, LivestockLogData, LivestockProfileData, OrganizationDashboardData, OrganizationData, OrganizationMember, Role, SensorData, UserData, UserOrgRoleResponse, UserSettings } from "@/interfaces/interfaces";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { Dispatch, SetStateAction } from "react";
import { TempUnit } from "./stringUtils";
const URANUS_URL = "https://uranus.luscsusjr.dpdns.org";

export async function verifyMe(
    userDataSetter: Dispatch<SetStateAction<UserData | null>>,
    userSettingsDataSetter: Dispatch<SetStateAction<UserSettings | null>>
) {
    try {
        const token = await SecureStore.getItemAsync('userToken');

        if(!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const response = await fetch(URANUS_URL + '/api/me', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
        }

        if (!response.ok) {
            throw new Error('Failed to load secure data.');
        }

        const json = await response.json();

        userDataSetter(json);
        userSettingsDataSetter(json.settings);
    } catch (error: any) {
        console.error("updateUserSettings error:", error);
        throw error;
    }
}

export async function fetchOrgDashboard(
    orgDashboardDataSetter: Dispatch<SetStateAction<OrganizationDashboardData[] | undefined>>
) {
    try {
        const token = await SecureStore.getItemAsync('userToken');

        if(!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const response = await fetch(URANUS_URL + `/api/organizations/dashboard`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
        }

        if (!response.ok) {
            throw new Error('Failed to load secure data.');
        }

        const json = await response.json();
        orgDashboardDataSetter(json.data);
    } catch (error) {
        console.error("updateUserSettings error:", error);
        throw error;
    }
}

export async function fetchUserSettings(
    loadingSetter: Dispatch<SetStateAction<boolean>>,
    errorSetter: Dispatch<SetStateAction<string | null>>,
    userSettingsSetter: Dispatch<SetStateAction<UserSettings | null>>
) {
    try {
        if (loadingSetter) loadingSetter(true)
        if (errorSetter) errorSetter(null)

        const token = await SecureStore.getItemAsync('userToken');

        if(!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const response = await fetch(URANUS_URL + '/api/user-settings', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
        }

        if (!response.ok) {
            throw new Error('Failed to load secure data.');
        }

        const json = await response.json();
        userSettingsSetter(json.settings);

    } catch (error: any) {
        if (errorSetter) errorSetter(error.message || 'An error occurred');
    } finally {
        if (loadingSetter) loadingSetter(false);
    }
}

export async function updateUserSettings(
    userSettings: UserSettings
) {
    try {
        const token = await SecureStore.getItemAsync("userToken");

        if (!token) {
            throw new Error("No authentication token found.");
        }

        // console.log("Sending settings:", userSettings);

        const response = await fetch(
            URANUS_URL + "/api/user-settings",
            {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(userSettings),
            }
        );

        const data = await response.json();

        // console.log("Update response:", data);

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to update user settings."
            );
        }

        return data.settings;
    } catch (error) {
        console.error("updateUserSettings error:", error);
        throw error;
    }
}

export async function fetchOrganizations(
    organizationSetter: Dispatch<SetStateAction<OrganizationData[]>>
) {
    const token = await SecureStore.getItemAsync('userToken');

    if(!token) {
        throw new Error('No authorization token found. Please log in.');
    }

    const response = await fetch(URANUS_URL + '/api/organizations', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },

    });

    if(response.status === 500) {
        console.log("Reached");
        throw new Error('This is a test error');
    }

    if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
        throw new Error('Failed to load secure data.');
    }

    const json = await response.json();

    organizationSetter(json.data);
}

export async function fetchMemberData(
    memberSetter: Dispatch<SetStateAction<OrganizationMember[]>>,
    roleSetter: Dispatch<SetStateAction<Role[]>>,
    selectedOrganizationId: number
) {
    const token = await SecureStore.getItemAsync('userToken');

    if (!token) {
        throw new Error('No authorization token found. Please log in.');
    }

    const [membersResponse, rolesResponse] = await Promise.all([
        fetch(
            URANUS_URL + `/api/organizations/${selectedOrganizationId}/users`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        ),

        fetch(
            URANUS_URL + '/api/roles',
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        ),
    ]);

    if (
        membersResponse.status === 401 ||
        rolesResponse.status === 401
    ) {
        throw new Error('Session expired. Please log in again.');
    }

    if (!membersResponse.ok || !rolesResponse.ok) {
        throw new Error('Failed to load secure data.');
    }

    const membersJson = await membersResponse.json();
    const rolesJson = await rolesResponse.json();

    memberSetter(membersJson.data);
    roleSetter(rolesJson);

    return {
        members: membersJson.data,
        roles: rolesJson,
    };
}

export async function updateMemberRole(
    role: string,
    memberId: number,
    organizationId: number
) {
    const token = await SecureStore.getItemAsync('userToken');

    if (!token) {
        throw new Error('No authorization token found. Please log in.');
    }

    const response = await fetch(
        URANUS_URL +
            `/api/organizations/${organizationId}/users/${memberId}/role`,
        {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                role,
            }),
        }
    );

    const data = await response.json();

    if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
        throw new Error(
            data.message ?? 'Failed to update member role.'
        );
    }

    return data;
}

export async function updateMemberStatus(
    active: boolean,
    memberId: number,
    organizationId: number
) {
    const token = await SecureStore.getItemAsync('userToken');

    if (!token) {
        throw new Error('No authorization token found. Please log in.');
    }

    const response = await fetch(
        URANUS_URL +
            `/api/organizations/${organizationId}/users/${memberId}/status`,
        {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                active,
            }),
        }
    );

    const data = await response.json();

    if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
        throw new Error(
            data.message ?? 'Failed to update member status.'
        );
    }

    return data;
}

export async function addMember(
    email: string,
    role: string,
    organizationId: number
) {
    const token = await SecureStore.getItemAsync('userToken');

    if (!token) {
        throw new Error('No authorization token found. Please log in.');
    }

    const response = await fetch(
        URANUS_URL + `/api/organizations/${organizationId}/users`,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                email,
                role,
            }),
        }
    );

    const data = await response.json();

    if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
        throw new Error(
            data.message ?? 'Failed to add member.'
        );
    }

    return data;
}

export async function deleteOrganization(
    organizationId: number
) {
    const token = await SecureStore.getItemAsync('userToken');

    if (!token) {
        throw new Error('No authorization token found. Please log in.');
    }

    const response = await fetch(
        URANUS_URL + `/api/organizations/${organizationId}`,
        {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
        throw new Error(
            data.message ?? 'Failed to delete organization.'
        );
    }

    return data;
}

export async function updateOrganization(
    orgName: string,
    orgDesc: string,
    toEditOrgId: number
) {
    const token = await SecureStore.getItemAsync('userToken');

    if (!token) {
        throw new Error('No authorization token found. Please log in.');
    }

    const response = await fetch(
        URANUS_URL + `/api/organizations/${toEditOrgId}`,
        {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: orgName,
                description: orgDesc,
            }),
        }
    );

    const data = await response.json();

    if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
        throw new Error(
            data.message ?? 'Failed to update organization.'
        );
    }

    return data;
}

export async function createOrganization(
    orgName: string,
    orgDesc: string
) {
    const token = await SecureStore.getItemAsync('userToken');

    if (!token) {
        throw new Error('No authorization token found. Please log in.');
    }

    const response = await fetch(
        URANUS_URL + '/api/organizations',
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: orgName,
                description: orgDesc,
            }),
        }
    );

    const data = await response.json();

    if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
        throw new Error(
            data.message ?? 'Failed to create organization.'
        );
    }

    return data;
}

export async function fetchLivestockData(
    selectedOrganizationId: number,
    livestockSetter: Dispatch<SetStateAction<LivestockData[]>>
) {
    const token = await SecureStore.getItemAsync('userToken');

    if (!token) {
        throw new Error('No authorization token found. Please log in.');
    }

    const response = await fetch(
        URANUS_URL +
            `/api/organizations/${selectedOrganizationId}/livestocks`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
        throw new Error('Failed to load secure data.');
    }

    const json = await response.json();

    livestockSetter(json.data);
}

// api/organizations/{organization}/livestocks/{livestock}

export async function fetchIndividualLivestock(
    livestockSetter: Dispatch<SetStateAction<LivestockData | undefined>>,
    livestockId: number,
    selectedOrganizationId: number
) {
    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error(
            "No authorization token found. Please log in."
        );
    }

    const response = await fetch(
        URANUS_URL +
            `/api/organizations/${selectedOrganizationId}/livestocks/${livestockId}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status === 401) {
        throw new Error(
            "Session expired. Please log in again."
        );
    }

    if (!response.ok) {
        throw new Error("Failed to load secure data.");
    }

    const data = await response.json();

    livestockSetter(data.data);
}

export async function fetchLivestockProfileData(
    livestockProfileSetter: Dispatch<SetStateAction<LivestockProfileData[]>>,
    selectedOrganizationId: number
) {
    const token = await SecureStore.getItemAsync('userToken');

    if (!token) {
        throw new Error('No authorization token found. Please log in.');
    }

    const response = await fetch(
        URANUS_URL +
            `/api/organizations/${selectedOrganizationId}/livestock-profiles`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
        throw new Error('Failed to load secure data.');
    }

    const data = await response.json();

    livestockProfileSetter(data.data);
}

export async function fetchIndividualLivestockProfile(
    profileSetter: Dispatch<SetStateAction<LivestockProfileData | undefined>>,
    profileId: number,
    selectedOrganizationId: number
) {
    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error(
            "No authorization token found. Please log in."
        );
    }

    const response = await fetch(
        URANUS_URL +
            `/api/organizations/${selectedOrganizationId}/livestock-profiles/${profileId}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status === 401) {
        throw new Error(
            "Session expired. Please log in again."
        );
    }

    if (!response.ok) {
        throw new Error("Failed to load secure data.");
    }

    const data = await response.json();

    profileSetter(data.data);
}

type BaseLivestockParams = {
    selectedOrganizationId: number;
    image: ImagePicker.ImagePickerAsset | null;
    liveStockName: string;
    description: string;
    speciesName: string | undefined;
    minTemp: number | undefined;
    maxTemp: number | undefined;
    tempUnit: TempUnit;
    minPh: number | undefined;
    maxPh: number | undefined;
};

type PlantLivestockParams = BaseLivestockParams & {
    livestockType: "plant";
    harvestDays: number | undefined;
    nurseryDays: number | undefined;
};

type FishLivestockParams = BaseLivestockParams & {
    livestockType: "fish";
    growthDays: number | undefined;
    age: number | undefined;
};

type CreateLivestockParams =
    | PlantLivestockParams
    | FishLivestockParams;

export async function createLivestock(
    params: CreateLivestockParams
) {
    const {
        livestockType,
        selectedOrganizationId,
        image,
        liveStockName,
        description,
        speciesName,
        minTemp,
        maxTemp,
        tempUnit,
        minPh,
        maxPh,
    } = params;

    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error(
            "No authorization token found. Please log in."
        );
    }

    const formData = new FormData();

    formData.append("livestock_name", liveStockName);
    formData.append("type", livestockType);
    formData.append("species_name", speciesName ?? "");
    formData.append("description", description);

    if (image?.uri) {
        const file = new File(image.uri);
        formData.append("image", file);
    }

    if (livestockType === "plant") {
        const { harvestDays, nurseryDays } = params;

        const data = {
            harvest_days: harvestDays,
            phase: "nursery",
            phase_changed_on: null,
            ideal_temp: {
                tempUnit,
                min: minTemp,
                max: maxTemp,
            },
            ph_range: {
                min: minPh,
                max: maxPh,
            },
            nursery_days: nurseryDays,
        };

        formData.append("data", JSON.stringify(data));
    } else {
        const { growthDays, age } = params;

        const data = {
            growth_days: growthDays,
            age,
            ideal_temp: {
                tempUnit,
                min: minTemp,
                max: maxTemp,
            },
            ph_range: {
                min: minPh,
                max: maxPh,
            },
        };

        formData.append("data", JSON.stringify(data));
    }

    const response = await fetch(
        `${URANUS_URL}/api/organizations/${selectedOrganizationId}/livestocks`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        }
    );

    const responseData = await response.json();

    if (response.status === 401) {
        throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok) {
        throw new Error(
            responseData.message ?? "Failed to create livestock"
        );
    }

    return responseData;
}

type BaseLivestockProfileParams = {
    selectedOrganizationId: number;
    description: string;
    speciesName: string | undefined;
    minTemp: number | undefined;
    maxTemp: number | undefined;
    tempUnit: TempUnit;
    minPh: number | undefined;
    maxPh: number | undefined;
};

type PlantLivestockProfileParams = BaseLivestockProfileParams & {
    livestockType: "plant";
    harvestDays: number | undefined;
    nurseryDays: number | undefined;
};

type FishLivestockProfileParams = BaseLivestockProfileParams & {
    livestockType: "fish";
    growthDays: number | undefined;
    age: number | undefined;
};

type LivestockProfileParams =
    | PlantLivestockProfileParams
    | FishLivestockProfileParams;

export async function createLivestockProfile(
    params: LivestockProfileParams
) {
    const {
        livestockType,
        selectedOrganizationId,
        description,
        speciesName,
        minTemp,
        maxTemp,
        tempUnit,
        minPh,
        maxPh,
    } = params;

    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error(
            "No authorization token found. Please log in."
        );
    }

    const formData = new FormData();

    formData.append("type", livestockType);
    formData.append("species_name", speciesName ?? "");
    formData.append("description", description);

    if (livestockType === "plant") {
        const { harvestDays, nurseryDays } = params;

        const data = {
            harvest_days: harvestDays,
            phase: "nursery",
            phase_changed_on: null,
            ideal_temp: {
                tempUnit,
                min: minTemp,
                max: maxTemp,
            },
            ph_range: {
                min: minPh,
                max: maxPh,
            },
            nursery_days: nurseryDays,
        };

        formData.append("data", JSON.stringify(data));
    } else {
        const { growthDays, age } = params;

        const data = {
            growth_days: growthDays,
            age,
            ideal_temp: {
                tempUnit,
                min: minTemp,
                max: maxTemp,
            },
            ph_range: {
                min: minPh,
                max: maxPh,
            },
        };

        formData.append("data", JSON.stringify(data));
    }

    const response = await fetch(
        `${URANUS_URL}/api/organizations/${selectedOrganizationId}/livestock-profiles`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        }
    );

    const responseData = await response.json();

    if (response.status === 401) {
        throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok) {
        throw new Error(
            responseData.message ??
                "Failed to create livestock profile"
        );
    }

    return responseData;
}


export async function deleteLivestockProfile(
    livestockProfileId: number,
    selectedOrganizationId: number
) {
    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error(
            "No authorization token found. Please log in."
        );
    }

    const response = await fetch(
        URANUS_URL +
            `/api/organizations/${selectedOrganizationId}/livestock-profiles/${livestockProfileId}`,
        {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status === 401) {
        throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok) {
        const data = await response.json();

        throw new Error(
            data.message ?? "Failed to delete livestock profile"
        );
    }

    return true;
}

export async function fetchSensorChartLink(
    loadingSetter: Dispatch<SetStateAction<boolean>>,
    errorSetter: Dispatch<SetStateAction<string | null>>,
    chartLinkSetter: Dispatch<SetStateAction<string | undefined>>,
    sensorId: number | undefined,
    selectedOrganizationId: number | null,
) {
    try {
        if (loadingSetter) loadingSetter(true)
        if (errorSetter) errorSetter(null)

        const token = await SecureStore.getItemAsync('userToken');

        if(!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const sensorChartLinkResponse = await fetch(URANUS_URL + `/api/organizations/${selectedOrganizationId}/sensors/${sensorId}/chart-link`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })

        if (sensorChartLinkResponse.status === 401) {
            throw new Error('Session expired. Please log in again.');
        }

        if (!sensorChartLinkResponse.ok) {
            throw new Error('Failed to load secure data.');
        }

        const sensorChartLinkJson = await sensorChartLinkResponse.json();
        console.log("Sensor Chart Link JSON:", sensorChartLinkJson);
        chartLinkSetter(sensorChartLinkJson.url)
    } catch (error: any) {
        if(errorSetter) errorSetter(error.message || 'An error occurred');
    } finally {
        if(loadingSetter) loadingSetter(false);
    }
}

type UpdateLivestockProfileParams = {
    selectedOrganizationId: number;
    profileId: number;
    description: string;
    speciesName: string | undefined;
    minTemp: number | undefined;
    maxTemp: number | undefined;
    tempUnit: TempUnit;
    minPh: number | undefined;
    maxPh: number | undefined;
} & (
    | {
        livestockType: "plant";
        harvestDays: number | undefined;
        nurseryDays: number | undefined;
    }
    | {
        livestockType: "fish";
        growthDays: number | undefined;
        age: number | undefined;
    }
);

export async function updateLivestockProfile(
    params: UpdateLivestockProfileParams
) {
    const {
        selectedOrganizationId,
        profileId,
        description,
        livestockType,
        minTemp,
        maxTemp,
        tempUnit,
        minPh,
        maxPh,
    } = params;

    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error(
            "No authorization token found. Please log in."
        );
    }

    const formData = new FormData();

    formData.append("description", description);

    if (livestockType === "plant") {
        const { harvestDays, nurseryDays } = params;

        const data = {
            harvest_days: harvestDays,
            phase: "nursery",
            phase_changed_on: null,
            ideal_temp: {
                tempUnit,
                min: minTemp,
                max: maxTemp,
            },
            ph_range: {
                min: minPh,
                max: maxPh,
            },
            nursery_days: nurseryDays,
        };

        formData.append("data", JSON.stringify(data));
    } else {
        const { growthDays, age } = params;

        const data = {
            growth_days: growthDays,
            age,
            ideal_temp: {
                tempUnit,
                min: minTemp,
                max: maxTemp,
            },
            ph_range: {
                min: minPh,
                max: maxPh,
            },
        };

        formData.append("data", JSON.stringify(data));
    }

    formData.append("_method", "PATCH");

    const response = await fetch(
        `${URANUS_URL}/api/organizations/${selectedOrganizationId}/livestock-profiles/${profileId}`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        }
    );

    const responseData = await response.json();

    if (response.status === 401) {
        throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok) {
        throw new Error(
            responseData.message ?? "Failed to update livestock profile"
        );
    }

    return responseData;
}

export async function proceedToNextPhase(
    livestockId: number,
    selectedOrganizationId: number
) {
    const token = await SecureStore.getItemAsync('userToken');

    if (!token) {
        throw new Error(
            'No authorization token found. Please log in.'
        );
    }

    const response = await fetch(
        URANUS_URL +
            `/api/organizations/${selectedOrganizationId}/livestocks/${livestockId}/change-phase`,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (response.status === 401) {
        throw new Error(
            'Session expired. Please log in again.'
        );
    }

    if (!response.ok) {
        throw new Error(
            data.message ?? 'Failed to proceed to next phase'
        );
    }

    return data;
}

export async function harvestLivestock(
    livestockId: number,
    selectedOrganizationId: number
) {
    const token = await SecureStore.getItemAsync('userToken');

    if (!token) {
        throw new Error(
            'No authorization token found. Please log in.'
        );
    }

    const response = await fetch(
        URANUS_URL +
            `/api/organizations/${selectedOrganizationId}/livestocks/${livestockId}/toggle-harvest`,
        {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (response.status === 401) {
        throw new Error(
            'Session expired. Please log in again.'
        );
    }

    if (!response.ok) {
        throw new Error(
            data.message ?? 'Failed to harvest livestock'
        );
    }

    return data;
}

export async function fetchSensorData(
    loadingSetter: Dispatch<SetStateAction<boolean>>,
    errorSetter: Dispatch<SetStateAction<string | null>>,
    livestockSetter: Dispatch<SetStateAction<SensorData[] | undefined>>,
    selectedOrganizationId: number | null,
) {
    try {
        if (loadingSetter) loadingSetter(true)
        if (errorSetter) errorSetter(null)

        const token = await SecureStore.getItemAsync('userToken');

        if(!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        // api/organizations/{organization}/sensors
        const sensorResponse = await fetch(URANUS_URL + `/api/organizations/${selectedOrganizationId}/sensors`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (sensorResponse.status === 401) {
            throw new Error('Session expired. Please log in again.');
        }

        if (!sensorResponse.ok) {
            throw new Error('Failed to load sensor data.');
        }

        const sensorJson = await sensorResponse.json();
        livestockSetter(sensorJson.data);
    } catch (error: any) {
        if(errorSetter) errorSetter(error.message || 'An error occurred');
    } finally {
        if(loadingSetter) loadingSetter(false);
    }
}

export async function fetchLivestockLogData(
    livestockId: number,
    livestockLogsSetter: Dispatch<SetStateAction<LivestockLogData[]>>
) {
    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error(
            "No authorization token found. Please log in."
        );
    }

    const response = await fetch(
        URANUS_URL + `/api/livestocks/${livestockId}/logs`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status === 401) {
        throw new Error(
            "Session expired. Please log in again."
        );
    }

    if (!response.ok) {
        throw new Error("Failed to load secure data.");
    }

    const data = await response.json();

    livestockLogsSetter(data.data);
}

export async function resolveConcernLog(
    livestockId: number,
    logId: number,
    actionTaken: string
) {
    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error(
            "No authorization token found. Please log in."
        );
    }

    const response = await fetch(
        URANUS_URL + `/api/livestocks/${livestockId}/logs/${logId}`,
        {
            method: "PATCH",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                data: {
                    action_taken: actionTaken,
                },
            }),
        }
    );

    const data = await response.json();

    if (response.status === 401) {
        throw new Error(
            "Session expired. Please log in again."
        );
    }

    if (!response.ok) {
        throw new Error(
            data.message ?? "Failed to resolve concern"
        );
    }

    return data;
}

type BaseLivestockLogParams = {
    selectedLivestockId: number;
    image: ImagePicker.ImagePickerAsset | null;
    logTitle: string;
    logDescription: string;
};

type LogLivestockLogParams = BaseLivestockLogParams & {
    logType: "log";
};

type ConcernLivestockLogParams = BaseLivestockLogParams & {
    logType: "concern";
    concernSeverity:
        | "low"
        | "moderate"
        | "high"
        | "critical"
        | undefined;
};

type CreateLivestockLogParams =
    | LogLivestockLogParams
    | ConcernLivestockLogParams;

export async function createLivestockLog(
    params: CreateLivestockLogParams
) {
    const {
        logType,
        selectedLivestockId,
        image,
        logTitle,
        logDescription,
    } = params;

    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error(
            "No authorization token found. Please log in."
        );
    }

    const formData = new FormData();

    formData.append("type", logType);

    if (image?.uri) {
        const file = new File(image.uri);

        formData.append("image", file);
    }

    if (logType === "log") {
        const data = {
            title: logTitle,
            description: logDescription,
        };

        formData.append("data", JSON.stringify(data));
    } else {
        const { concernSeverity } = params;

        const data = {
            title: logTitle,
            description: logDescription,
            severity: concernSeverity,
            status: "open",
            action_taken: null,
        };

        formData.append("data", JSON.stringify(data));
    }

    const response = await fetch(
        URANUS_URL +
            `/api/livestocks/${selectedLivestockId}/logs`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        }
    );

    const responseData = await response.json();

    if (response.status === 401) {
        throw new Error(
            "Session expired. Please log in again."
        );
    }

    if (!response.ok) {
        throw new Error(
            responseData.message ?? "Failed to create log"
        );
    }

    return responseData;
}

export async function getMyOrgRole(
    selectedOrganizationId: number,
    userRoleSetter: Dispatch<SetStateAction<UserOrgRoleResponse | undefined>>
) {
    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error(
            "No authorization token found. Please log in."
        );
    }

    const response = await fetch(
        URANUS_URL +
            `/api/organizations/${selectedOrganizationId}/my-role`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status === 401) {
        throw new Error(
            "Session expired. Please log in again."
        );
    }

    if (!response.ok) {
        throw new Error("Failed to load secure data.");
    }

    const data = await response.json();

    userRoleSetter(data.data);
}

export async function deleteLivestockLog(
    livestockId: number,
    logId: number
) {
    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error(
            "No authorization token found. Please log in."
        );
    }

    const response = await fetch(
        URANUS_URL + `/api/livestocks/${livestockId}/logs/${logId}`,
        {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status === 401) {
        throw new Error(
            "Session expired. Please log in again."
        );
    }

    if (!response.ok) {
        const data = await response.json();

        throw new Error(
            data.message ?? "Failed to delete log"
        );
    }

    return true;
}

export async function deleteLivestock(
    livestockId: number,
    selectedOrganizationId: number
) {
    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error("No authorization token found. Please log in.");
    }

    const response = await fetch(URANUS_URL + `/api/organizations/${selectedOrganizationId}/livestocks/${livestockId}`, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
        throw new Error(data.message ?? 'Failed to delete livestock');
    }

    return data;

}
