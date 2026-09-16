import useAppToast from "@/components/AppToast";
import { imageField, imagePickerModal, livestockDescriptionField, livestockNameField, livestockProfilePickerField, livestockTypeField, numberField, speciesNameField, useLivestockProfileField } from "@/components/FormFields";
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
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

export default function LivestockFormPage() {
    const [livestockProfiles, setLivestockProfiles] = useState<LivestockProfileData[]>([]);
    const { selectedOrganizationId } = useOrganization();
    const { fetchedUserSettings } = useUserSettings();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
    const [livestockType, setLivestockType] = useState<"plant" | "fish">();
    const [isInvalidLivestockName, setIsInvalidLivestockName] = useState(false);
    const [livestockName, setLivestockName] = useState('');
    const [isInvalidDescription, setIsInvalidDescription] = useState(false);
    const [description, setDescription] = useState('');
    const [useProfile, setUseProfile] = useState<boolean>();
    const [selectedProfile, setSelectedProfile] = useState<LivestockProfileData | null>(null);
    const [selectedProfileId, setSelectedProfileId] = useState<number>();
    const [isInvalidSpeciesName, setIsInvalidSpeciesName] = useState(false);
    const [speciesName, setSpeciesName] = useState<string | undefined>('');
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
    const [isCreatingLivestock, setIsCreatingLivestock] = useState(false);
    const router = useRouter();
    const { showToast } = useAppToast();
    
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
                });
            }

            setIsCreatingLivestock(false);

            showToast({
                action: "success",
                title: "Livestock Created",
                description: `${livestockName}, created successfully`,
            });

            router.back();
        } catch (error) {
            // const message =
            //     error instanceof Error
            //         ? error.message
            //         : `Failed to create ${livestockName}`;

            setIsCreatingLivestock(false);

            showToast({
                action: "error",
                title: "Livestock Creation Failed",
                description: "Failed to create livestock, please try again later.",
            });
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
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const takePhoto = async () => {
        const permission =
            await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
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

    const everythingIsOk = () => {
        let valid = true;

        // Reset errors first
        setIsInvalidLivestockName(false);
        setIsInvalidDescription(false);
        setIsInvalidSpeciesName(false);
        setIsInvalidMinTemp(false);
        setIsInvalidMaxTemp(false);
        setIsInvalidMinPh(false);
        setIsInvalidMaxPh(false);
        setIsInvalidHarvestDays(false);
        setIsInvalidNurseryDays(false);

        if (!livestockName.trim()) {
            setIsInvalidLivestockName(true);
            valid = false;
        }

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

        setIsCreatingLivestock(true);
    };

    const isFormComplete =
        livestockType !== undefined &&
        livestockName.trim().length > 0 &&
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

    return (
        <>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView className="mb-12">
                    <VStack className="flex-1 p-5"
                        space="md"
                    >
                        {livestockTypeField(livestockType, setLivestockType, "manual")}
                        <Divider />
                        {livestockType && (
                            <>
                                {imageField(image?.uri ?? null, setIsImagePickerOpen, "Livestock Image")}
                                <Divider />
                                {livestockNameField(
                                    livestockName,
                                    setLivestockName,
                                    isInvalidLivestockName
                                )}
                                
                                {livestockDescriptionField(
                                    description,
                                    setDescription,
                                    isInvalidDescription
                                )}
                                <Divider />
                                {useLivestockProfileField(
                                    useProfile,
                                    setUseProfile,
                                    setSelectedProfile
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
                                            applyLivestockProfile
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
                                                            isInvalidSpeciesName,
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
                                                            isInvalidSpeciesName,
                                                            "Ex: Tilapia"
                                                        )}
                                                    </>
                                                )}
                                                
                                                {<Divider />}
                                                {numberField(
                                                    "auto",
                                                    "Ideal Minimum Temperature",
                                                    "Please enter a valid temperature",
                                                    minTemp,
                                                    setMinTemp,
                                                    isInvalidMinTemp,
                                                    selectedProfile.data.ideal_temp.min
                                                )}

                                                {numberField(
                                                    "auto",
                                                    "Ideal Minimum Temperature",
                                                    "Please enter a valid temperature",
                                                    maxTemp,
                                                    setMaxTemp,
                                                    isInvalidMaxTemp,
                                                    selectedProfile.data.ideal_temp.max
                                                )}
                                                {<Divider />}
                                                {numberField(
                                                    "auto",
                                                    "Ideal Maximum pH Level",
                                                    "Please enter a valid pH level",
                                                    minPh,
                                                    setMinPh,
                                                    isInvalidMinPh,
                                                    selectedProfile.data.ph_range.min
                                                )}

                                                {numberField(
                                                    "auto",
                                                    "Ideal Maximum pH Level",
                                                    "Please enter a valid pH level",
                                                    maxPh,
                                                    setMaxPh,
                                                    isInvalidMaxPh,
                                                    selectedProfile.data.ph_range.max
                                                )}
                                                {<Divider />}
                                                {livestockType === "plant" && selectedProfile.type === "plant" ? (
                                                    <>
                                                        {numberField(
                                                            "auto",
                                                            "Days in the Nursery",
                                                            "Please input a valid amount of days",
                                                            nurseryDays,
                                                            setNurseryDays,
                                                            isInvalidNurseryDays,
                                                            selectedProfile.data.nursery_days,
                                                            "This days are for how long the plant should be in the nursery"
                                                        )}

                                                        {numberField(
                                                                "auto",
                                                                "Days until Harvest",
                                                                "Please input a valid amount of days",
                                                                harvestDays,
                                                                setHarvestDays,
                                                                isInvalidHarvestDays,
                                                                selectedProfile.data.harvest_days,
                                                                "This days are for how long the plant should stay in the growbed"
                                                        )}
                                                    </>
                                                ) : livestockType === "fish" && selectedProfile.type === "fish" ? (
                                                    <>
                                                        {numberField(
                                                            "auto",
                                                            "Days it takes to mature",
                                                            "Please input a valid amount of days",
                                                            growthDays,
                                                            setGrowthDays,
                                                            isInvalidGrowthDays,
                                                            selectedProfile.data.growth_days,
                                                            "This days are for how long it takes for the fish to mature for harvest"
                                                        )}

                                                        {numberField(
                                                            "auto",
                                                            "Current Age in Days",
                                                            "Please input a valid amount of days",
                                                            age,
                                                            setAge,
                                                            isInvalidAge,
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
                                                    isInvalidSpeciesName,
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
                                                    isInvalidSpeciesName,
                                                    "Ex: Tilapia"
                                                )}
                                            </>
                                        )}
                                        {<Divider />}
                                        {numberField(
                                            "manual",
                                            "Ideal Minimum Temperature",
                                            "Please enter a valid temperature",
                                            minTemp,
                                            setMinTemp,
                                            isInvalidMinTemp,
                                        )}

                                        {numberField(
                                            "manual",
                                            "Ideal Maximum Temperature",
                                            "Please enter a valid temperature",
                                            maxTemp,
                                            setMaxTemp,
                                            isInvalidMaxTemp,
                                        )}
                                        {<Divider />}
                                        {numberField(
                                            "manual",
                                            "Ideal Minimum pH Level",
                                            "Please enter a valid pH level",
                                            minPh,
                                            setMinPh,
                                            isInvalidMinPh,
                                        )}

                                        {numberField(
                                            "manual",
                                            "Ideal Maximum pH Level",
                                            "Please enter a valid pH level",
                                            maxPh,
                                            setMaxPh,
                                            isInvalidMaxPh,
                                        )}
                                        {<Divider />}
                                        {livestockType === "plant" && (
                                            <>
                                                {numberField(
                                                    "manual",
                                                    "Days in the Nursery",
                                                    "Please input a valid amount of days",
                                                    nurseryDays,
                                                    setNurseryDays,
                                                    isInvalidNurseryDays,
                                                    0,
                                                    "This days are for how long the plant should be in the nursery"
                                                )}

                                                {numberField(
                                                        "manual",
                                                        "Days until Harvest",
                                                        "Please input a valid amount of days",
                                                        harvestDays,
                                                        setHarvestDays,
                                                        isInvalidHarvestDays,
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
                                                    "Please input a valid amount of days",
                                                    growthDays,
                                                    setGrowthDays,
                                                    isInvalidGrowthDays,
                                                    0,
                                                    "This days are for how long it takes for the fish to mature for harvest"
                                                )}

                                                {numberField(
                                                    "manual",
                                                    "Current Age in Days",
                                                    "Please input a valid amount of days",
                                                    age,
                                                    setAge,
                                                    isInvalidAge,
                                                    0,
                                                    "This is the current age of the fish in days"
                                                )}
                                            </>
                                        )}
                                    </>
                                ) : null}

                                <Button
                                    onPress={handleSubmit}
                                    isDisabled={!isFormComplete}
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
                        <Button variant="outline" onPress={() => setIsCreatingLivestock(false)}>
                            <ButtonText>Cancel</ButtonText>
                        </Button>
                        <Button onPress={() => {
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