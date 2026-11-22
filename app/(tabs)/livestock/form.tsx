import useAppToast from "@/components/AppToast";
import { frequencyField, imageField, imagePickerModal, livestockDescriptionField, livestockNameField, livestockProfilePickerField, livestockTypeField, notifyField, numberField, speciesNameField, timePicker, useLivestockProfileField } from "@/components/FormFields";
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useOrganization } from "@/hooks/useOrganization";
import { useUserSettings } from "@/hooks/useUserSettings";
import { LivestockProfileData } from "@/interfaces/interfaces";
import { createLivestock, fetchLivestockProfileData } from "@/utils/apiFetch";
import { convertTemperature, TempUnit } from "@/utils/stringUtils";
import { validateRequiredText, validateWholeNumber } from "@/utils/validation";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

export default function LivestockFormPage() {
    const [livestockProfiles, setLivestockProfiles] = useState<LivestockProfileData[]>([]);
    const { selectedOrganizationId } = useOrganization();
    const { fetchedUserSettings } = useUserSettings();
    const [loading, setLoading] = useState(false);
    const [onAction, setOnAction] = useState(false);
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
    const [livestockType, setLivestockType] = useState<"plant" | "fish">();
    const [livestockName, setLivestockName] = useState('');
    const [description, setDescription] = useState('');
    const [useProfile, setUseProfile] = useState<boolean>();
    const [selectedProfile, setSelectedProfile] = useState<LivestockProfileData | null>(null);
    const [selectedProfileId, setSelectedProfileId] = useState<number>();
    const [speciesName, setSpeciesName] = useState<string | undefined>('');
    const [tempUnit, setTempUnit] = useState<TempUnit>("celcius");
    const [minTemp, setMinTemp] = useState<number>();
    const [maxTemp, setMaxTemp] = useState<number>();
    const [minPh, setMinPh] = useState<number>();
    const [maxPh, setMaxPh] = useState<number>();
    const [harvestDays, setHarvestDays] = useState<number>();
    const [nurseryDays, setNurseryDays] = useState<number>();
    const [growthDays, setGrowthDays] = useState<number>();
    const [age, setAge] = useState<number>();
    const [isCreatingLivestock, setIsCreatingLivestock] = useState(false);
    const [notify, setNotify] = useState(false);
    const [frequency, setFrequency] = useState<'daily' | 'weekly'>();
    const [notificationTime, setNotificationTime] = useState<Date | undefined>();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const router = useRouter();
    const { showToast } = useAppToast();

    const temperatureUnitLabel: Record<TempUnit, string> = {
        celcius: "°C",
        fahrenheit: "°F",
        kelvin: "K",
    };

    const currentTemperatureUnit =
        temperatureUnitLabel[tempUnit] ?? "°C";
    
    const handleFetchLivestockProfiles = async () => {
        if (!selectedOrganizationId) {
            return;
        }

        setLoading(true);

        try {
            await fetchLivestockProfileData(
                setLivestockProfiles,
                selectedOrganizationId
            );
        } catch (error) {
            // const message =
            //     error instanceof Error
            //         ? error.message
            //         : "An unexpected error occurred";

            showToast({
                action: "error",
                title: "Failed to Fetch Livestock Profiles",
                description: "Failed to fetch available livestock profiles, please try again later",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLivestock = async () => {
        if (!selectedOrganizationId || !livestockType) {
            return;
        }

        setLoading(true);

        try {
            setOnAction(true);

            if (livestockType === "plant") {
                await createLivestock({
                    selectedOrganizationId,
                    livestockType: "plant",
                    image,
                    liveStockName: livestockName,
                    description,
                    speciesName,
                    minTemp,
                    maxTemp,
                    tempUnit,
                    minPh,
                    maxPh,
                    harvestDays,
                    nurseryDays,
                    notify,
                    frequency,
                    notificationTime,
                });
            } else {
                await createLivestock({
                    selectedOrganizationId,
                    livestockType: "fish",
                    image,
                    liveStockName: livestockName,
                    description,
                    speciesName,
                    minTemp,
                    maxTemp,
                    tempUnit,
                    minPh,
                    maxPh,
                    growthDays,
                    age,
                    notify,
                    frequency,
                    notificationTime,
                });
            }

            showToast({
                action: "success",
                title: "Livestock Created",
                description: `${livestockName}, created successfully`,
            });

            setIsCreatingLivestock(false);
            setOnAction(false);

            router.back();
        } catch (error) {
            // const message =
            //     error instanceof Error
            //         ? error.message
            //         : `Failed to create ${livestockName}`;

            showToast({
                action: "error",
                title: "Livestock Creation Failed",
                description: "Failed to create livestock, please try again later.",
            });

            setIsCreatingLivestock(false);
            setOnAction(false);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (selectedOrganizationId) {
                handleFetchLivestockProfiles();
            }
        }, [selectedOrganizationId])
    )

    useEffect(() => {
        if (fetchedUserSettings?.temp_unit) {
            setTempUnit(fetchedUserSettings.temp_unit as TempUnit);
        }
    }, [fetchedUserSettings]);

    useEffect(() => {
        if (useProfile === false) {
            resetLivestockFields();
        }
    }, [useProfile]);

    const pickImage = async () => {
        try {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                showToast({
                    action: "warning",
                    title: "Photo Access Needed",
                    description: "Allow photo-library access to choose an image.",
                });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setImage(result.assets[0]);
            }
        } catch (error) {
            showToast({
                action: "error",
                title: "Image Selection Failed",
                description: error instanceof Error ? error.message : "Unable to select an image.",
            });
        }
    };

    const takePhoto = async () => {
        try {
            const permission =
                await ImagePicker.requestCameraPermissionsAsync();

            if (!permission.granted) {
                showToast({
                    action: "warning",
                    title: "Camera Access Needed",
                    description: "Allow camera access to take a photo.",
                });
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setImage(result.assets[0]);
            }
        } catch (error) {
            showToast({
                action: "error",
                title: "Camera Failed",
                description: error instanceof Error ? error.message : "Unable to take a photo.",
            });
        }
    };

    const applyLivestockProfile = (profile: LivestockProfileData) => {
        setSpeciesName(profile.species_name);

        setMinTemp(profile.data.ideal_temp.min);
        setMaxTemp(profile.data.ideal_temp.max);
        setMinPh(profile.data.ph_range.min);
        setMaxPh(profile.data.ph_range.max);

        // console.log("Species Name:", profile.species_name);
        // console.log("Min Temperature:", profile.data.ideal_temp.min);
        // console.log("Max Temperature:", profile.data.ideal_temp.max);
        // console.log("Min pH:", profile.data.ph_range.min);
        // console.log("Max pH:", profile.data.ph_range.max);

        if (profile.type === "plant") {
            setHarvestDays(profile.data.harvest_days);
            setNurseryDays(profile.data.nursery_days);

            // console.log("Harvest Days:", profile.data.harvest_days);
            // console.log("Nursery Days:", profile.data.nursery_days);
        } else if (profile.type === "fish") {
            setGrowthDays(profile.data.growth_days);
            setAge(profile.data.age)

            // console.log("Growth Days:", profile.data.growth_days);
            // console.log("Age:", profile.data.age)
        }
    };

    const resetLivestockFields = () => {
        setSelectedProfileId(undefined);
        setSpeciesName("");
        setMinTemp(undefined);
        setMaxTemp(undefined);
        setMinPh(undefined);
        setMaxPh(undefined);
        setHarvestDays(undefined);
        setNurseryDays(undefined);
        setGrowthDays(undefined);
        setAge(undefined);
    };

    const handleLivestockTypeChange = (nextType: "plant" | "fish" | undefined) => {
        if (livestockType === nextType) {
            return;
        }

        setLivestockType(nextType);
        setSelectedProfile(null);
        resetLivestockFields();
    };

    const getValidationErrors = (): Record<string, string> => {
        const errors: Record<string, string> = {};
        const nameError = validateRequiredText(livestockName, "Livestock name");
        const descriptionError = validateRequiredText(description, "Description");

        if (nameError) errors.livestockName = nameError;
        if (descriptionError) errors.description = descriptionError;
        if (useProfile === undefined) errors.useProfile = "Choose whether to use a livestock profile.";
        if (useProfile && !selectedProfile) errors.profile = "Select a livestock profile.";
        if ((useProfile === false || selectedProfile) && !speciesName?.trim()) {
            errors.speciesName = "Species name is required.";
        }

        const minTempCelsius = minTemp === undefined
            ? undefined
            : convertTemperature(minTemp, tempUnit, "celcius");
        const maxTempCelsius = maxTemp === undefined
            ? undefined
            : convertTemperature(maxTemp, tempUnit, "celcius");

        if (
            minTempCelsius === undefined ||
            !Number.isFinite(minTempCelsius) ||
            minTempCelsius <= 0 ||
            minTempCelsius >= 100
        ) {
            errors.minTemp = "Enter a temperature greater than 0°C and less than 100°C.";
        }
        if (
            maxTempCelsius === undefined ||
            !Number.isFinite(maxTempCelsius) ||
            maxTempCelsius <= 0 ||
            maxTempCelsius >= 100
        ) {
            errors.maxTemp = "Enter a temperature greater than 0°C and less than 100°C.";
        } else if (minTempCelsius !== undefined && maxTempCelsius <= minTempCelsius) {
            errors.maxTemp = "Maximum temperature must be greater than minimum temperature.";
        }

        if (minPh === undefined || !Number.isFinite(minPh) || minPh < 0 || minPh > 14) {
            errors.minPh = "Enter a pH value from 0 to 14.";
        }
        if (maxPh === undefined || !Number.isFinite(maxPh) || maxPh < 0 || maxPh > 14) {
            errors.maxPh = "Enter a pH value from 0 to 14.";
        } else if (minPh !== undefined && maxPh <= minPh) {
            errors.maxPh = "Maximum pH must be greater than minimum pH.";
        }

        if (livestockType === "plant") {
            const harvestDaysError = validateWholeNumber(harvestDays, "Harvest days");
            const nurseryDaysError = validateWholeNumber(nurseryDays, "Nursery days");
            if (harvestDaysError) errors.harvestDays = harvestDaysError;
            if (nurseryDaysError) errors.nurseryDays = nurseryDaysError;
        }

        if (livestockType === "fish") {
            const growthDaysError = validateWholeNumber(growthDays, "Growth days");
            const ageError = validateWholeNumber(age, "Age", true);
            if (growthDaysError) errors.growthDays = growthDaysError;
            if (ageError) errors.age = ageError;
        }

        if (notify) {
            if (!frequency) errors.frequency = "Choose a notification frequency.";
            if (!notificationTime || Number.isNaN(notificationTime.getTime())) {
                errors.notificationTime = "Select a notification time.";
            }
        }

        return errors;
    };

    const validationErrors = hasSubmitted ? getValidationErrors() : {};

    const handleSubmit = () => {
        setHasSubmitted(true);

        if (Object.keys(getValidationErrors()).length > 0) {
            return;
        }

        setIsCreatingLivestock(true);
    };

    return (
        <>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView className="mb-12">
                    <VStack className="flex-1 p-5"
                        space="md"
                    >
                        {livestockTypeField(livestockType, handleLivestockTypeChange, "manual")}
                        <Divider />
                        {livestockType && (
                            <>
                                {imageField(image?.uri ?? null, setIsImagePickerOpen, "Livestock Image")}
                                <Divider />
                                {livestockNameField(
                                    livestockName,
                                    setLivestockName,
                                    validationErrors.livestockName
                                )}
                                
                                {livestockDescriptionField(
                                    description,
                                    setDescription,
                                    validationErrors.description
                                )}
                                <Divider />
                                {notifyField(
                                    notify,
                                    setNotify
                                )}
                                {notify && (
                                    <>
                                        {frequencyField(
                                            frequency,
                                            setFrequency,
                                            validationErrors.frequency
                                        )}
                                        {timePicker(
                                            notificationTime,
                                            setNotificationTime,
                                            validationErrors.notificationTime
                                        )}
                                    </>
                                )}
                                <Divider />
                                {useLivestockProfileField(
                                    useProfile,
                                    setUseProfile,
                                    setSelectedProfile,
                                    validationErrors.useProfile
                                )}
                                {useProfile === true ? (
                                    <>
                                        {/* Profile Picker */}
                                        {livestockProfilePickerField(
                                            selectedProfileId,
                                            setSelectedProfileId,
                                            setSelectedProfile,
                                            livestockType,
                                            livestockProfiles,
                                            applyLivestockProfile,
                                            validationErrors.profile
                                        )}

                                        {/* Show this ONLY when a profile has been selected */}
                                        {selectedProfile && (
                                            <>
                                                {<Divider />}
                                                {livestockType === "plant" && (
                                                    <>
                                                        {speciesNameField(
                                                            "auto",
                                                            speciesName ?? "",
                                                            setSpeciesName,
                                                            validationErrors.speciesName,
                                                            "Ex: Tomato"
                                                        )}
                                                    </>
                                                )}
                                                {livestockType === "fish" && (
                                                    <>
                                                        {<Divider />}
                                                        {speciesNameField(
                                                            "manual",
                                                            speciesName ?? "",
                                                            setSpeciesName,
                                                            validationErrors.speciesName,
                                                            "Ex: Tilapia"
                                                        )}
                                                    </>
                                                )}
                                                
                                                {<Divider />}
                                                {numberField(
                                                    "auto",
                                                    "Ideal Minimum Temperature",
                                                    validationErrors.minTemp ?? "Enter a temperature within the supported range.",
                                                    minTemp,
                                                    setMinTemp,
                                                    !!validationErrors.minTemp,
                                                    selectedProfile.data.ideal_temp.min
                                                )}

                                                {numberField(
                                                    "auto",
                                                    "Ideal Maximum Temperature",
                                                    validationErrors.maxTemp ?? "Enter a temperature within the supported range.",
                                                    maxTemp,
                                                    setMaxTemp,
                                                    !!validationErrors.maxTemp,
                                                    selectedProfile.data.ideal_temp.max
                                                )}
                                                {<Divider />}
                                                {numberField(
                                                    "auto",
                                                    "Ideal Minimum pH Level",
                                                    validationErrors.minPh ?? "Enter a pH value from 0 to 14.",
                                                    minPh,
                                                    setMinPh,
                                                    !!validationErrors.minPh,
                                                    selectedProfile.data.ph_range.min
                                                )}

                                                {numberField(
                                                    "auto",
                                                    "Ideal Maximum pH Level",
                                                    validationErrors.maxPh ?? "Enter a pH value from 0 to 14.",
                                                    maxPh,
                                                    setMaxPh,
                                                    !!validationErrors.maxPh,
                                                    selectedProfile.data.ph_range.max
                                                )}
                                                {<Divider />}
                                                {livestockType === "plant" && selectedProfile.type === "plant" ? (
                                                    <>
                                                        {numberField(
                                                            "auto",
                                                            "Days in the Nursery",
                                                            validationErrors.nurseryDays ?? "Enter a whole number greater than zero.",
                                                            nurseryDays,
                                                            setNurseryDays,
                                                            !!validationErrors.nurseryDays,
                                                            selectedProfile.data.nursery_days,
                                                            "This days are for how long the plant should be in the nursery"
                                                        )}

                                                        {numberField(
                                                                "auto",
                                                                "Days until Harvest",
                                                                validationErrors.harvestDays ?? "Enter a whole number greater than zero.",
                                                                harvestDays,
                                                                setHarvestDays,
                                                                !!validationErrors.harvestDays,
                                                                selectedProfile.data.harvest_days,
                                                                "This days are for how long the plant should stay in the growbed"
                                                        )}
                                                    </>
                                                ) : livestockType === "fish" && selectedProfile.type === "fish" ? (
                                                    <>
                                                        {numberField(
                                                            "auto",
                                                            "Days it takes to mature",
                                                            validationErrors.growthDays ?? "Enter a whole number greater than zero.",
                                                            growthDays,
                                                            setGrowthDays,
                                                            !!validationErrors.growthDays,
                                                            selectedProfile.data.growth_days,
                                                            "This days are for how long it takes for the fish to mature for harvest"
                                                        )}

                                                        {numberField(
                                                            "auto",
                                                            "Current Age in Days",
                                                            validationErrors.age ?? "Enter a whole number of zero or more.",
                                                            age,
                                                            setAge,
                                                            !!validationErrors.age,
                                                            selectedProfile.data.age,
                                                            "This is the current age of the fish in days"
                                                        )}
                                                    </>
                                                ) : null}
                                            </>
                                        )}
                                    </>
                                ) : useProfile === false ? (
                                    <>
                                        {/* Manual Plant Form */}
                                        {<Divider />}
                                        {livestockType === "plant" && (
                                            <>
                                                {<Divider />}
                                                {speciesNameField(
                                                    "manual",
                                                    speciesName ?? "",
                                                    setSpeciesName,
                                                    validationErrors.speciesName,
                                                    "Ex: Tomato"
                                                )}
                                            </>
                                        )}
                                        {livestockType === "fish" && (
                                            <>
                                                {<Divider />}
                                                {speciesNameField(
                                                    "manual",
                                                    speciesName ?? "",
                                                    setSpeciesName,
                                                    validationErrors.speciesName,
                                                    "Ex: Tilapia"
                                                )}
                                            </>
                                        )}
                                        {<Divider />}
                                        {numberField(
                                            "manual",
                                            `Ideal Minimum Temperature (${currentTemperatureUnit})`,
                                            validationErrors.minTemp ?? `Enter a temperature greater than 0°C and less than 100°C.`,
                                            minTemp,
                                            setMinTemp,
                                            !!validationErrors.minTemp,
                                        )}

                                        {numberField(
                                            "manual",
                                            `Ideal Maximum Temperature (${currentTemperatureUnit})`,
                                            validationErrors.maxTemp ?? `Enter a temperature greater than 0°C and less than 100°C.`,
                                            maxTemp,
                                            setMaxTemp,
                                            !!validationErrors.maxTemp,
                                        )}
                                        {<Divider />}
                                        {numberField(
                                            "manual",
                                            "Ideal Minimum pH Level",
                                            validationErrors.minPh ?? "Enter a pH value from 0 to 14.",
                                            minPh,
                                            setMinPh,
                                            !!validationErrors.minPh,
                                        )}

                                        {numberField(
                                            "manual",
                                            "Ideal Maximum pH Level",
                                            validationErrors.maxPh ?? "Enter a pH value from 0 to 14.",
                                            maxPh,
                                            setMaxPh,
                                            !!validationErrors.maxPh,
                                        )}
                                        {<Divider />}
                                        {livestockType === "plant" && (
                                            <>
                                                {numberField(
                                                    "manual",
                                                    "Days in the Nursery",
                                                    validationErrors.nurseryDays ?? "Enter a whole number greater than zero.",
                                                    nurseryDays,
                                                    setNurseryDays,
                                                    !!validationErrors.nurseryDays,
                                                    0,
                                                    "This days are for how long the plant should be in the nursery"
                                                )}

                                                {numberField(
                                                        "manual",
                                                        "Days until Harvest",
                                                        validationErrors.harvestDays ?? "Enter a whole number greater than zero.",
                                                        harvestDays,
                                                        setHarvestDays,
                                                        !!validationErrors.harvestDays,
                                                        0,
                                                        "This days are for how long the plant should stay in the growbed"
                                                )}
                                            </>
                                        )}

                                        {/* Manual Fish Form */}
                                        {livestockType === "fish" && (
                                            <>
                                                {numberField(
                                                    "manual",
                                                    "Days it takes to mature",
                                                    validationErrors.growthDays ?? "Enter a whole number greater than zero.",
                                                    growthDays,
                                                    setGrowthDays,
                                                    !!validationErrors.growthDays,
                                                    0,
                                                    "This days are for how long it takes for the fish to mature for harvest"
                                                )}

                                                {numberField(
                                                    "manual",
                                                    "Current Age in Days",
                                                    validationErrors.age ?? "Enter a whole number of zero or more.",
                                                    age,
                                                    setAge,
                                                    !!validationErrors.age,
                                                    0,
                                                    "This is the current age of the fish in days"
                                                )}
                                            </>
                                        )}
                                    </>
                                ) : null}

                                <Button
                                    onPress={handleSubmit}
                                    isDisabled={onAction || loading}
                                >
                                    <ButtonText>Create Livestock</ButtonText>
                                </Button>

                            </>
                        )}
                        
                        
                    </VStack>
                </ScrollView>
            </KeyboardAvoidingView>
            {imagePickerModal(
                isImagePickerOpen,
                setIsImagePickerOpen,
                takePhoto,
                pickImage
            )}
            <AlertDialog
                isOpen={isCreatingLivestock}
                onClose={() => setIsCreatingLivestock(false)}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading className="text-foreground font-semibold text-lg">
                            Create New Livestock?
                        </Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-3 mb-4">
                        <Text className="text-sm text-muted-foreground">
                            Confirming this will create {livestockName} and edits on this livestock will not be permitted after creation.
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button variant="outline" isDisabled={onAction} onPress={() => setIsCreatingLivestock(false)}>
                            <ButtonText>Cancel</ButtonText>
                        </Button>
                        <Button isDisabled={onAction} onPress={() => {
                            console.log("Pressed Confirm")
                            if(livestockType === "plant") {
                                handleCreateLivestock();
                            } else {
                                handleCreateLivestock();
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