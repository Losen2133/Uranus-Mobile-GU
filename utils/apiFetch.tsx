import { LivestockData, LivestockProfileData, OrganizationData, OrganizationMember, Role, SensorData, UserSettings } from "@/interfaces/interfaces";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { Dispatch, SetStateAction } from "react";
import { TempUnit } from "./stringUtils";
const URANUS_URL = "https://uranus.luscsusjr.dpdns.org";

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
    loadingSetter: Dispatch<SetStateAction<boolean>>,
    errorSetter: Dispatch<SetStateAction<string | null>>,
    organizationSetter: Dispatch<SetStateAction<OrganizationData[]>>
) {
    try {
        if (loadingSetter) loadingSetter(true)
        if (errorSetter) errorSetter(null)

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

        if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
        }

        if (!response.ok) {
            throw new Error('Failed to load secure data.');
        }

        const json = await response.json();
        organizationSetter(json.data);
    } catch (error: any) {
        if (errorSetter) errorSetter(error.message || 'An error occurred');
    } finally {
        if (loadingSetter) loadingSetter(false);
    }
}

export async function fetchMemberData(
    loadingSetter: Dispatch<SetStateAction<boolean>>,
    errorSetter: Dispatch<SetStateAction<string | null>>,
    memberSetter: Dispatch<SetStateAction<OrganizationMember[]>>,
    roleSetter: Dispatch<SetStateAction<Role[]>>,
    selectedOrganizationId: number
) {
    try {
        if (loadingSetter) loadingSetter(true)
        if (errorSetter) errorSetter(null)

        const token = await SecureStore.getItemAsync('userToken');

        if(!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const membersResponse = await fetch(URANUS_URL + `/api/organizations/${selectedOrganizationId}/users`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Perfect security integration
            },
        });

        const rolesResponse = await fetch(URANUS_URL + '/api/roles', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Perfect security integration
            },
        });

        if (membersResponse.status === 401 || rolesResponse.status === 401) {
            throw new Error('Session expired. Please log in again.');
        }

        if (!membersResponse.ok || !rolesResponse.ok) {
            throw new Error('Failed to load secure data.');
        }

        const membersJson = await membersResponse.json();
        memberSetter(membersJson.data);
        const rolesJson = await rolesResponse.json();
        roleSetter(rolesJson);
    } catch (error: any) {
        if(errorSetter) errorSetter(error.message || 'An error occurred');
    } finally {
        if(loadingSetter) loadingSetter(false);
    }
}

export async function updateMemberRole(
    selectedRoleId: number | undefined,
    roleList: Role[],
    selectedMember: OrganizationMember | undefined,
    selectedOrganizationId: number | null,
    closerCallback: () => void,
    onRoleUpdated: () => void | Promise<void>
) {
    try {
        closerCallback();
        const token = await SecureStore.getItemAsync('userToken');

        if (!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const updateMemberRoleResponse = await fetch(URANUS_URL + `/api/organizations/${selectedOrganizationId}/users/${selectedMember?.id}/role`, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                role: roleList.find(role => role.id === selectedRoleId)?.name
            }),
        });

        const data = await updateMemberRoleResponse.json();

        if (!updateMemberRoleResponse.ok) {
            throw new Error(data.message ?? 'Failed to update role');
        }

        await onRoleUpdated();
    } catch (error) {
        throw new Error(error as any);
    }
}

export async function updateMemberStatus(
    selectedMember: OrganizationMember | undefined,
    selectedOrganizationId: number | null,
    onStatusChanged: () => void | Promise<void>
) {
    try{
        const token = await SecureStore.getItemAsync('userToken');

        if (!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const updateStatusResponse = await fetch(URANUS_URL + `/api/organizations/${selectedOrganizationId}/users/${selectedMember?.id}/status`, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                active: !selectedMember?.active
            }),
        });

        const data = await updateStatusResponse.json();

        if (!updateStatusResponse.ok) {
            throw new Error(data.message ?? 'Failed to update role');
        }

        await onStatusChanged();
    } catch (error) {
        throw new Error(error as any);
    }
}

export async function addMember(
    email: string,
    selectedRole: number | undefined,
    roleList: Role[],
    selectedOrganizationId: number | null,
    closerCallback: () => void,
    onMemberAdd: () => void | Promise<void>
) {
    try {
        closerCallback();
        const token = await SecureStore.getItemAsync('userToken');

        if (!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const addMemberResponse = await fetch(URANUS_URL + `/api/organizations/${selectedOrganizationId}/users`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: email,
                    role: roleList.find(role => role.id === selectedRole)?.name
                }),
            });

            const data = await addMemberResponse.json();

            if (!addMemberResponse.ok) {
                throw new Error(data.message ?? 'Failed to add member');
            }

            await onMemberAdd();
    } catch (error) {
        throw new Error(error as any);
    }
}

export async function deleteOrganization(
    toDeleteOrganizationId: number | undefined,
    onOrgDelete: () => void | Promise<void>
) {
    try {
        const token = await SecureStore.getItemAsync('userToken');

        if (!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const deleteStatusResponse = await fetch(URANUS_URL + `/api/organizations/${toDeleteOrganizationId}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
        })

        const data = await deleteStatusResponse.json();

        if (!deleteStatusResponse.ok) {
            throw new Error(data.message ?? 'Failed to delete organization');
        }

        await onOrgDelete();
    } catch (error) {
        throw new Error(error as any);
    }
}

export async function updateOrganization(
    orgName: string,
    orgDesc: string,
    toEditOrgId: number | undefined,
    errorSetter: Dispatch<SetStateAction<string | null>>,
    closerCallback: () => void,
    onOrgEditted: () => void | Promise<void>
) {
    try {
        closerCallback();
        const token = await SecureStore.getItemAsync('userToken');

        if (!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const updateOrganizationResponse = await fetch(URANUS_URL + `/api/organizations/${toEditOrgId}`, {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name: orgName,
                description: orgDesc
            }),
        })

        const data = await updateOrganizationResponse.json();

        if (!updateOrganizationResponse.ok) {
            throw new Error(data.message ?? 'Failed to create organization');
        }

        await onOrgEditted();
    } catch (error) {
        if (error instanceof Error) {
            errorSetter(error.message);
            throw error;
        }

        errorSetter(String(error));
        throw new Error(String(error));
    }
}

export async function createOrganization(
    orgName: string,
    orgDesc: string,
    errorSetter: Dispatch<SetStateAction<string | null>>,
    closerCallback: () => void,
    onOrgCreated: () => void | Promise<void>
) {
    try {
        closerCallback();
        const token = await SecureStore.getItemAsync('userToken');

        if (!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const createOrganizationResponse = await fetch(URANUS_URL + '/api/organizations', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name: orgName,
                description: orgDesc
            }),
        });

        const data = await createOrganizationResponse.json();

        if (!createOrganizationResponse.ok) {
            throw new Error(data.message ?? 'Failed to create organization');
        }

        await onOrgCreated();
    } catch (error) {
        if (error instanceof Error) {
            errorSetter(error.message);
            throw error;
        }

        errorSetter(String(error));
        throw new Error(String(error));
    }
}

export async function fetchLivestockData(
    loadingSetter: Dispatch<SetStateAction<boolean>>,
    errorSetter: Dispatch<SetStateAction<string | null>>,
    livestockSetter: Dispatch<SetStateAction<LivestockData[]>>,
    selectedOrganizationId: number
) {
    try {
        if (loadingSetter) loadingSetter(true)
        if (errorSetter) errorSetter(null)

        const token = await SecureStore.getItemAsync('userToken');

        if(!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const livestockResponse = await fetch(URANUS_URL + `/api/organizations/${selectedOrganizationId}/livestocks`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });


        if (livestockResponse.status === 401) {
            throw new Error('Session expired. Please log in again.');
        }

        if (!livestockResponse.ok) {
            throw new Error('Failed to load secure data.');
        }

        const livestockJson = await livestockResponse.json();
        livestockSetter(livestockJson.data);
    } catch (error: any) {
        if(errorSetter) errorSetter(error.message || 'An error occurred');
    } finally {
        if(loadingSetter) loadingSetter(false);
    }
}

// api/organizations/{organization}/livestocks/{livestock}

export async function fetchIndividualLivestock(
    loadingSetter: Dispatch<SetStateAction<boolean>>,
    errorSetter: Dispatch<SetStateAction<string | null>>,
    livestockSetter: Dispatch<SetStateAction<LivestockData | undefined>>,
    livestockId: number,
    selectedOrganizationId: number | null
) {
    try {
        if (loadingSetter) loadingSetter(true)
        if (errorSetter) errorSetter(null)

        const token = await SecureStore.getItemAsync('userToken');

        if(!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const response = await fetch(URANUS_URL + `/api/organizations/${selectedOrganizationId}/livestocks/${livestockId}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })

        if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
        }

        if (!response.ok) {
            throw new Error('Failed to load secure data.');
        }

        const json = await response.json();
        livestockSetter(json.data);
    } catch (error: any) {
        if(errorSetter) errorSetter(error.message || 'An error occurred');
    } finally {
        if(loadingSetter) loadingSetter(false);
    }
}

export async function fetchLivestockProfileData(
    loadingSetter: Dispatch<SetStateAction<boolean>>,
    errorSetter: Dispatch<SetStateAction<string | null>>,
    livestockProfileSetter: Dispatch<SetStateAction<LivestockProfileData[]>>,
    selectedOrganizationId: number | null
) {
    try {
        if (loadingSetter) loadingSetter(true)
        if (errorSetter) errorSetter(null)

        const token = await SecureStore.getItemAsync('userToken');

        if(!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const livestockProfileResponse = await fetch(URANUS_URL + `/api/organizations/${selectedOrganizationId}/livestock-profiles`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (livestockProfileResponse.status === 401) {
            throw new Error('Session expired. Please log in again.');
        }

        if (!livestockProfileResponse.ok) {
            throw new Error('Failed to load secure data.');
        }

        const livestockProfileJson = await livestockProfileResponse.json();
        livestockProfileSetter(livestockProfileJson.data);
    } catch (error: any) {
        if(errorSetter) errorSetter(error.message || 'An error occurred');
    } finally {
        if(loadingSetter) loadingSetter(false);
    }
}

export async function fetchIndividualLivestockProfile(
    loadingSetter: Dispatch<SetStateAction<boolean>>,
    errorSetter: Dispatch<SetStateAction<string | null>>,
    profileSetter: Dispatch<SetStateAction<LivestockProfileData| undefined>>,
    profileId: number,
    selectedOrganizationId: number
) {
    try {
        if (loadingSetter) loadingSetter(true)
        if (errorSetter) errorSetter(null)

        const token = await SecureStore.getItemAsync('userToken');

        if(!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const response = await fetch(URANUS_URL + `/api/organizations/${selectedOrganizationId}/livestock-profiles/${profileId}/`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })

        if (response.status === 401) {
            console.log("Failed 1");
            throw new Error('Session expired. Please log in again.');
            
        }

        if (!response.ok) {
            console.log("Failed 2");
            throw new Error('Failed to load secure data.');
        }

        
        const json = await response.json();
        profileSetter(json.data);
    } catch (error: any) {
        if(errorSetter) errorSetter(error.message || 'An error occurred');
    } finally {
        if(loadingSetter) loadingSetter(false); 
    }
}

type BaseLivestockParams = {
    closerCallBack: () => void;
    onLivestockCreated: () => void | Promise<void>;
    selectedOrganizationId: number | null;
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
): Promise<void> {
    const {
        closerCallBack,
        onLivestockCreated,
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

    try {
        closerCallBack();

        const token = await SecureStore.getItemAsync("userToken");

        if (!token) {
            throw new Error("No authorization token found. Please log in.");
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
                age: age,
                ideal_temp: {
                    tempUnit,
                    min: minTemp,
                    max: maxTemp,
                },
                ph_range: {
                    min: minPh,
                    max: maxPh,
                }
            }
            formData.append("data", JSON.stringify(data));
        }

        const response = await fetch(
            `${URANUS_URL}/api/organizations/${selectedOrganizationId}/livestocks`,
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    // DO NOT set Content-Type here
                },
                body: formData,
            }
        );

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(
                responseData.message ?? "Failed to create livestock"
            );
        }

        await onLivestockCreated();
    } catch (error) {
        console.log("CREATE LIVESTOCK ERROR:", error);
        throw error;
    }
}

type BaseLivestockProfileParams = {
    closerCallBack: () => void;
    onLivestockCreated: () => void | Promise<void>;
    selectedOrganizationId: number | null;
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
): Promise<void> {
    const {
        closerCallBack,
        onLivestockCreated,
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

    try {
        closerCallBack();

        const token = await SecureStore.getItemAsync("userToken");

        if (!token) {
            throw new Error("No authorization token found. Please log in.");
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
                age: age,
                ideal_temp: {
                    tempUnit,
                    min: minTemp,
                    max: maxTemp,
                },
                ph_range: {
                    min: minPh,
                    max: maxPh,
                }
            }
            formData.append("data", JSON.stringify(data));
        }

        const response = await fetch(
            `${URANUS_URL}/api/organizations/${selectedOrganizationId}/livestock-profiles`,
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    // DO NOT set Content-Type here
                },
                body: formData,
            }
        );

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(
                responseData.message ?? "Failed to create livestock profile"
            );
        }

        await onLivestockCreated();
    } catch (error) {
        console.log("CREATE LIVESTOCK PROFILE ERROR:", error);
        throw error;
    }
}


export async function deleteLivestockProfile(
    livestockProfileId: number | undefined,
    selectedOrganizationId: number | null,
    onLivestockProfileDelete: () => void | Promise<void>
) {
    try {
        const token = await SecureStore.getItemAsync('userToken');

        if (!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const deleteLivestockProfileResponse = await fetch(URANUS_URL + `/api/organizations/${selectedOrganizationId}/livestock-profiles/${livestockProfileId}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
        })

        const data = await deleteLivestockProfileResponse.json();

        if (!deleteLivestockProfileResponse.ok) {
            throw new Error(data.message ?? 'Failed to delete livestock profile');
        }

        await onLivestockProfileDelete();
    } catch (error) {
        throw new Error(error as any);
    }
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
    closerCallBack: () => void;
    onLivestockProfileEditted: () => void | Promise<void>;
    selectedOrganizationId: number | null;
    profileId: number | undefined;
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
        closerCallBack,
        selectedOrganizationId,
        description,
        livestockType,
        minTemp,
        maxTemp,
        tempUnit,
        minPh,
        maxPh,
        // errorSetter,
        onLivestockProfileEditted,
        profileId,
    } = params;

    try {
        closerCallBack();

        const token = await SecureStore.getItemAsync("userToken");

        if (!token) {
            throw new Error("No authorization token found. Please log in.");
        }

        const formData = new FormData();

        formData.append("description", description);
        
        if(livestockType === "plant") {
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
                age: age,
                ideal_temp: {
                    tempUnit,
                    min: minTemp,
                    max: maxTemp,
                },
                ph_range: {
                    min: minPh,
                    max: maxPh,
                }
            }
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

        if (!response.ok) {
            throw new Error(
                responseData.message ?? "Failed to update livestock profile"
            );
        }

        await onLivestockProfileEditted();
    }  catch (error) {
        console.log("UPDATE LIVESTOCK PROFILE ERROR:", error);
        throw error;
    }

}

export async function proceedToNextPhase(
    livestockId: number | undefined,
    selectedOrganizationId: number | null,
    onPhaseChanged: () => void | Promise<void>
) {
    try {
        const token = await SecureStore.getItemAsync('userToken');

        if (!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const response = await fetch(URANUS_URL + `/api/organizations/${selectedOrganizationId}/livestocks/${livestockId}/change-phase`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message ?? 'Failed to proceed to next phase');
        }

        await onPhaseChanged();
    } catch (error) {
        console.error('Error proceeding to next phase:', error);
        throw error;
    }
}

export async function harvestLivestock(
    livestockId: number | undefined,
    selectedOrganizationId: number | null,
    onHarvested: () => void | Promise<void>
) {
    try {
        const token = await SecureStore.getItemAsync('userToken');

        if (!token) {
            throw new Error('No authorization token found. Please log in.');
        }

        const response = await fetch(URANUS_URL + `/api/organizations/${selectedOrganizationId}/livestocks/${livestockId}/toggle-harvest`, {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message ?? 'Failed to harvest livestock');
        }

        await onHarvested();
    } catch (error) {
        console.error('Error harvesting livestock:', error);
        throw error;
    }
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
