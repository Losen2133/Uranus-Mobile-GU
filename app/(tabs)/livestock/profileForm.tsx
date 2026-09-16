import useAppToast from "@/components/AppToast";
import { livestockDescriptionField, livestockTypeField, numberField, speciesNameField } from "@/components/FormFields";
import SkeletonLoading from "@/components/SkeletonLoading";
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useOrganization } from "@/hooks/useOrganization";
import { useUserSettings } from "@/hooks/useUserSettings";
import { LivestockFishTypeData, LivestockPlantTypeData, LivestockProfileData } from "@/interfaces/interfaces";
import { createLivestockProfile, fetchIndividualLivestockProfile, updateLivestockProfile } from "@/utils/apiFetch";
import { convertTemperature, TempUnit } from "@/utils/stringUtils";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";


export default function LivestockProfileFormPage() {
    const { selectedProfileId } = useLocalSearchParams<{selectedProfileId: string}>();
    const toEditProfileId = Number(selectedProfileId) ?? undefined;
    const [toEditProfile, setToEditProfile] = useState<LivestockProfileData>();
    const [loading, setLoading] = useState(!!toEditProfileId);
    const [livestockType, setLivestockType] =  useState<"plant" | "fish">();
    const [speciesName, setSpeciesName] = useState<string | undefined>('');
    const [isInvalidSpeciesName, setIsInvalidSpeciesName] = useState(false);
    const [description, setDescription] = useState('');
    const [isInvalidDescription, setIsInvalidDescription] = useState(false);
    const [tempUnit, setTempUnit] = useState<TempUnit>("celcius");
    const [isInvalidMinTemp, setIsInvalidMinTemp] = useState(false);
    const [minTemp, setMinTemp] = useState<number>();
    const [isInvalidMaxTemp, setIsInvalidMaxTemp] = useState(false);
    const [maxTemp, setMaxTemp] = useState<number>();
    const [isInvalidMinPh, setIsInvalidMinPh] = useState(false);
    const [minPh, setMinPh] = useState<number>();
    const [isInvalidMaxPh, setIsInvalidMaxPh] = useState(false);
    const [maxPh, setMaxPh] = useState<number>();
    const [isInvalidHarvestDays, setIsInvalidHarvestDays] = useState(false);
    const [harvestDays, setHarvestDays] = useState<number>();
    const [isInvalidNurseryDays, setIsInvalidNurseryDays] = useState(false);
    const [nurseryDays, setNurseryDays] = useState<number>();
    const [isInvalidGrowthDays, setIsInvalidGrowthDays] = useState(false);
    const [growthDays, setGrowthDays] = useState<number>();
    const [isInvalidAge, setIsInvalidAge] = useState(false);
    const [age, setAge] = useState<number>();
    const [isProfileAction, setIsProfileAction] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const { fetchedUserSettings } = useUserSettings();
    const { selectedOrganizationId } = useOrganization();
    const router = useRouter();
    const { showToast } = useAppToast();
    const isEditMode = !!toEditProfileId;
    const [fieldMode, setFieldMode] = useState<"manual" | "auto">("manual");
    
    const handleFetchLivestockProfile = useCallback(async () => {
        if (!selectedOrganizationId || !toEditProfileId) {
            return;
        }

        // setLoading(true);

        try {
            await fetchIndividualLivestockProfile(
                setToEditProfile,
                toEditProfileId,
                selectedOrganizationId
            );
        } catch (error) {
            // const message =
            //     error instanceof Error
            //         ? error.message
            //         : "An unexpected error occurred";

            showToast({
                action: "error",
                title: "Failed to Fetch Livestock Profile",
                description: "Failed to fetch the profile, please try again later.",
            });
        } finally {
            // setLoading(false);
        }
    }, [selectedOrganizationId, toEditProfileId, showToast]);

    const handleUpdateLivestockProfile = async () => {
        if (!selectedOrganizationId || !toEditProfileId || !toEditProfile) {
            return;
        }

        try {
            if (toEditProfile.type === "plant") {
                await updateLivestockProfile({
                    selectedOrganizationId,
                    profileId: toEditProfileId,
                    livestockType: "plant",
                    description,
                    speciesName,
                    minTemp,
                    maxTemp,
                    tempUnit,
                    minPh,
                    maxPh,
                    harvestDays,
                    nurseryDays,
                });
            } else {
                await updateLivestockProfile({
                    selectedOrganizationId,
                    profileId: toEditProfileId,
                    livestockType: "fish",
                    description,
                    speciesName,
                    minTemp,
                    maxTemp,
                    tempUnit,
                    minPh,
                    maxPh,
                    growthDays,
                    age,
                });
            }

            setIsProfileAction(false);

            router.back();

            showToast({
                action: "success",
                title: "Livestock Profile Updated",
                description: `${speciesName} updated successfully`,
            });
        } catch (error) {
            // const message =
            //     error instanceof Error
            //         ? error.message
            //         : "Failed to update livestock profile";

            setIsProfileAction(false);

            showToast({
                action: "error",
                title: "Livestock Profile Update Failed",
                description: "Failed to update livestock profile, please try again later.",
            });
        }
    };

    const handleCreateLivestockProfile = async () => {
        if (!selectedOrganizationId || !livestockType) {
            return;
        }

        try {
            if (livestockType === "plant") {
                await createLivestockProfile({
                    selectedOrganizationId,
                    livestockType: "plant",
                    description,
                    speciesName,
                    minTemp,
                    maxTemp,
                    tempUnit,
                    minPh,
                    maxPh,
                    harvestDays,
                    nurseryDays,
                });
            } else {
                await createLivestockProfile({
                    selectedOrganizationId,
                    livestockType: "fish",
                    description,
                    speciesName,
                    minTemp,
                    maxTemp,
                    tempUnit,
                    minPh,
                    maxPh,
                    growthDays,
                    age,
                });
            }

            setIsProfileAction(false);

            router.back();

            showToast({
                action: "success",
                title: "Livestock Profile Created",
                description: `${speciesName} created successfully`,
            });
        } catch (error) {
            // const message =
            //     error instanceof Error
            //         ? error.message
            //         : "Failed to create livestock profile";

            setIsProfileAction(false)

            showToast({
                action: "error",
                title: "Livestock Profile Creation Failed",
                description: "Failed to created livestock profile, please try again later",
            });
        }
    };

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    await handleFetchLivestockProfile();
                } finally {
                    setLoading(false);
                }
            }
            if (selectedOrganizationId && toEditProfileId) {
                fetchData();
            }
        }, [selectedOrganizationId, toEditProfileId])
    )

    useEffect(() => {
        if (fetchedUserSettings?.temp_unit) {
            setTempUnit(fetchedUserSettings.temp_unit as TempUnit);
        }
    }, [fetchedUserSettings]);

    useEffect(() => {
        if (!toEditProfile) {
            return;
        }

        setLivestockType(toEditProfile.type);
        setSpeciesName(toEditProfile.species_name ?? "");
        setDescription(toEditProfile.description ?? "");

        // Temperature
        setMinTemp(toEditProfile.data?.ideal_temp?.min);
        setMaxTemp(toEditProfile.data?.ideal_temp?.max);

        // pH
        setMinPh(toEditProfile.data?.ph_range?.min);
        setMaxPh(toEditProfile.data?.ph_range?.max);

        // Plant-specific
        if (toEditProfile.type === "plant") {
            setHarvestDays(toEditProfile.data?.harvest_days);
            setNurseryDays(toEditProfile.data?.nursery_days);

            // Clear fish fields
            setGrowthDays(undefined);
            setAge(undefined);
        }

        // Fish-specific
        if (toEditProfile.type === "fish") {
            setGrowthDays(toEditProfile.data?.growth_days);
            setAge(toEditProfile.data?.age);

            // Clear plant fields
            setHarvestDays(undefined);
            setNurseryDays(undefined);
        }

        setFieldMode("auto");
    }, [toEditProfile]);

    // const resetLivestockFields = () => {
    //     setSpeciesName("");
    //     setMinTemp(undefined);
    //     setMaxTemp(undefined);
    //     setMinPh(undefined);
    //     setMaxPh(undefined);
    //     setHarvestDays(undefined);
    //     setNurseryDays(undefined);
    //     setGrowthDays(undefined);
    //     setAge(undefined);
    // };

    const everythingIsOk = () => {
        let valid = true;

        // Reset errors first
        setIsInvalidDescription(false);
        setIsInvalidSpeciesName(false);
        setIsInvalidMinTemp(false);
        setIsInvalidMaxTemp(false);
        setIsInvalidMinPh(false);
        setIsInvalidMaxPh(false);
        setIsInvalidHarvestDays(false);
        setIsInvalidNurseryDays(false);

        if (!description.trim()) {
            setIsInvalidDescription(true);
            valid = false;
        }

        if (!speciesName?.trim()) {
            setIsInvalidSpeciesName(true);
            valid = false;
        }

        const minTempCelcius = minTemp !== undefined
            ? convertTemperature(minTemp, tempUnit, "celcius")
            : undefined;

        if (
            minTempCelcius === undefined ||
            minTempCelcius <= 0 ||
            minTempCelcius >= 100
        ) {
            setIsInvalidMinTemp(true);
            valid = false;
        }

        const maxTempCelcius = maxTemp !== undefined
            ? convertTemperature(maxTemp, tempUnit, "celcius")
            : undefined;

        if (
            maxTempCelcius === undefined ||
            maxTempCelcius <= 0 ||
            maxTempCelcius >= 100
        ) {
            setIsInvalidMaxTemp(true);
            valid = false;
        }

        if (minPh === undefined || minPh < 0 || minPh > 14) {
            setIsInvalidMinPh(true);
            valid = false;
        }

        if (maxPh === undefined || maxPh < 0 || maxPh > 14) {
            setIsInvalidMaxPh(true);
            valid = false;
        }

        if (livestockType === "plant" && !harvestDays) {
            setIsInvalidHarvestDays(true);
            valid = false;
        }

        if (livestockType === "plant" && !nurseryDays) {
            setIsInvalidNurseryDays(true);
            valid = false;
        }

        if (livestockType === "fish" && !growthDays) {
            setIsInvalidGrowthDays(true);
            valid = false;
        }

        if (livestockType === "fish" && !age) {
            setIsInvalidAge(true);
            valid = false;
        }

        return valid;
    };

    const handleSubmit = () => {
        if (!everythingIsOk()) {
            return;
        }

        setIsProfileAction(true);
    };

    const handleUpdateProfile = () => {
        if (!everythingIsOk()) {
            return;
        }

        if (!hasFormChanges()) {
            return;
        }

        setIsProfileAction(true);
    };

    const isFormComplete =
        livestockType !== undefined &&
        description.trim().length > 0 &&
        !!speciesName?.trim() &&
        minTemp !== undefined &&
        maxTemp !== undefined &&
        minPh !== undefined &&
        maxPh !== undefined &&
        (
            livestockType === "fish"
                ? growthDays !== undefined && age !== undefined
                : harvestDays !== undefined && nurseryDays !== undefined
        );

    const hasFormChanges = () => {
        if (!toEditProfile) {
            return false;
        }

        const originalData = toEditProfile.data;

        // Basic fields
        // if (livestockType !== toEditProfile.type) {
        //     return true;
        // }

        // if (speciesName !== (toEditProfile.species_name ?? "")) {
        //     return true;
        // }

        if (description !== (toEditProfile.description ?? "")) {
            return true;
        }

        // Temperature
        if (minTemp !== originalData?.ideal_temp?.min) {
            return true;
        }

        if (maxTemp !== originalData?.ideal_temp?.max) {
            return true;
        }

        // pH
        if (minPh !== originalData?.ph_range?.min) {
            return true;
        }

        if (maxPh !== originalData?.ph_range?.max) {
            return true;
        }

        // Plant
        if (livestockType === "plant") {
            const plantData = originalData as LivestockPlantTypeData;

            if (harvestDays !== plantData.harvest_days) {
                return true;
            }

            if (nurseryDays !== plantData.nursery_days) {
                return true;
            }
        }

        // Fish
        if (livestockType === "fish") {
            const fishData = originalData as LivestockFishTypeData;

            if (growthDays !== fishData.growth_days) {
                return true;
            }

            if (age !== fishData.age) {
                return true;
            }
        }

        return false;
    };

    const hasChanges = hasFormChanges();

    return (
        <>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                {isEditMode && loading ? (
                    <SkeletonLoading skeletonVariant="store"/>
                ) : isEditMode && !toEditProfile ? (
                    null
                ) : (
                    <ScrollView className="mb-12">
                        <VStack className="flex-1 p-5"
                            space="md"
                        >
                            
                            {livestockTypeField(livestockType, setLivestockType, fieldMode)}
                            {livestockType && (
                                <>
                                    {livestockType === "plant" && (
                                        <>
                                            {<Divider />}
                                            {speciesNameField(
                                                fieldMode,
                                                speciesName ?? "",
                                                setSpeciesName,
                                                isInvalidSpeciesName,
                                                "Ex: Tomato"
                                            )}
                                        </>
                                    )}
                                    {livestockType === "fish" && (
                                        <>
                                            {<Divider />}
                                            {speciesNameField(
                                                fieldMode,
                                                speciesName ?? "",
                                                setSpeciesName,
                                                isInvalidSpeciesName,
                                                "Ex: Tilapia"
                                            )}
                                        </>
                                    )}
                                    {<Divider />}
                                    {livestockDescriptionField(
                                        description,
                                        setDescription,
                                        isInvalidDescription
                                    )}
                                    {<Divider />}
                                    {numberField(
                                        fieldMode,
                                        "Ideal Minimum Temperature",
                                        "Please enter a valid temperature",
                                        minTemp,
                                        setMinTemp,
                                        isInvalidMinTemp,
                                        toEditProfile?.data?.ideal_temp?.min ?? 0,
                                    )}
                                    {numberField(
                                        fieldMode,
                                        "Ideal Maximum Temperature",
                                        "Please enter a valid temperature",
                                        maxTemp,
                                        setMaxTemp,
                                        isInvalidMaxTemp,
                                        toEditProfile?.data?.ideal_temp?.max ?? 0,
                                    )}
                                    {<Divider />}
                                    {numberField(
                                        fieldMode,
                                        "Ideal Minimum pH Level",
                                        "Please enter a valid pH level",
                                        minPh,
                                        setMinPh,
                                        isInvalidMinPh,
                                        toEditProfile?.data?.ph_range?.min ?? 0,
                                    )}

                                    {numberField(
                                        fieldMode,
                                        "Ideal Maximum pH Level",
                                        "Please enter a valid pH level",
                                        maxPh,
                                        setMaxPh,
                                        isInvalidMaxPh,
                                        toEditProfile?.data?.ph_range?.max ?? 0,
                                    )}
                                    {livestockType === "plant" && (
                                        <>
                                            {numberField(
                                                fieldMode,
                                                "Days in the Nursery",
                                                "Please input a valid amount of days",
                                                nurseryDays,
                                                setNurseryDays,
                                                isInvalidNurseryDays,
                                                (toEditProfile?.data as LivestockPlantTypeData)?.nursery_days ?? 0,
                                                "This days are for how long the plant should be in the nursery"
                                            )}

                                            {numberField(
                                                fieldMode,
                                                "Days until Harvest",
                                                "Please input a valid amount of days",
                                                harvestDays,
                                                setHarvestDays,
                                                isInvalidHarvestDays,
                                                (toEditProfile?.data as LivestockPlantTypeData)?.harvest_days ?? 0,
                                                "This days are for how long the plant should stay in the growbed"
                                            )}
                                        </>
                                    )}
                                    {(livestockType === "fish") && (
                                        <>
                                            {numberField(
                                                fieldMode,
                                                "Days it takes to mature",
                                                "Please input a valid amount of days",
                                                growthDays,
                                                setGrowthDays,
                                                isInvalidGrowthDays,
                                                (toEditProfile?.data as LivestockFishTypeData)?.growth_days ?? 0,
                                                "This days are for how long it takes for the fish to mature for harvest"
                                            )}

                                            {numberField(
                                                fieldMode,
                                                "Current Age in Days",
                                                "Please input a valid amount of days",
                                                age,
                                                setAge,
                                                isInvalidAge,
                                                (toEditProfile?.data as LivestockFishTypeData)?.age ?? 0,
                                                "This is the current age of the fish in days"
                                            )}
                                        </>
                                    )}
                                    {!isEditMode && (
                                        <Button
                                            onPress={handleSubmit}
                                            isDisabled={!isFormComplete}
                                        >
                                            <ButtonText>Create Profile</ButtonText>
                                        </Button>
                                    )}
                                    {isEditMode && (
                                        <Button
                                            onPress={handleUpdateProfile}
                                            isDisabled={!isFormComplete || !hasChanges}
                                        >
                                            <ButtonText>Save Edit</ButtonText>
                                        </Button>
                                    )}
                                </>
                            )}
                        </VStack>
                    </ScrollView>
                )}
            </KeyboardAvoidingView>
            <AlertDialog
                isOpen={isProfileAction}
                onClose={() => setIsProfileAction(false)}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading className="text-foreground font-semibold text-lg">
                            {isEditMode ? "Confirm Profile Edit" : "Confirm Profile Creation"}
                        </Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-3 mb-4">
                        <Text className="text-sm text-muted-foreground">
                            {isEditMode
                                ? "Are you sure you want to save the changes made to this livestock profile?"
                                : "Are you sure you want to create this livestock profile?"}
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button variant="outline" onPress={() => setIsProfileAction(false)}>
                            <ButtonText>Cancel</ButtonText>
                        </Button>
                        
                        <Button onPress={() => {
                            if (isEditMode) {
                                handleUpdateLivestockProfile();
                            } else {
                                handleCreateLivestockProfile();
                            }
                            
                        }}>
                            <ButtonText>Confirm</ButtonText>
                        </Button>
                        
                        
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
    
}