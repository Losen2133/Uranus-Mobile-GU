import useAppToast from "@/components/AppToast";
import {
    imageField,
    imagePickerModal,
} from "@/components/FormFields";
import { FishTypeDetails } from "@/components/LivestockDetails/FishTypeDetails";
import { PlantTypeDetails } from "@/components/LivestockDetails/PlantTypeDetails";
import SkeletonLoading from "@/components/SkeletonLoading";
import {
    Actionsheet,
    ActionsheetContent,
    ActionsheetItem,
    ActionsheetItemText
} from '@/components/ui/actionsheet';
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Fab, FabIcon, FabLabel } from "@/components/ui/fab";
import { Heading } from "@/components/ui/heading";
import { Image } from "@/components/ui/image";
import { ImageViewer, ImageViewerCloseButton, ImageViewerContent, ImageViewerTrigger } from "@/components/ui/image-viewer";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useOrganization } from "@/hooks/useOrganization";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useUserSettings } from "@/hooks/useUserSettings";
import { LivestockData } from "@/interfaces/interfaces";
import { deleteLivestock, fetchIndividualLivestock, harvestLivestock, proceedToNextPhase, updateLivestockImage } from "@/utils/apiFetch";
import * as ImagePicker from "expo-image-picker";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Menu } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ScrollView } from "react-native";

interface LivestockDetailPageParams {
    id: number;
    livestockName: string;
}

export default function LivestockDetailPage() {
    const { livestockId, livestockName } = useLocalSearchParams<{ livestockId: string, livestockName: string }>();
    const passedParams: LivestockDetailPageParams = {
        id: Number(livestockId),
        livestockName: String(livestockName)
    }
    const [loading, setLoading] = useState(true);
    const [livestockData, setLivestockData] = useState<LivestockData>();
    const { selectedOrganizationId, selectedOrganizationUserRole } = useOrganization();
    const { fetchedUserSettings } = useUserSettings();
    const [onAction, setOnAction] = useState(false);
    const [showActionsheet, setShowActionsheet] = useState(false);
    const [isChangingPhase, setIsChangingPhase] = useState(false);
    const [isHarvesting, setIsHarvesting] = useState(false);
    const { showToast } = useAppToast();
    const router = useRouter();
    const { fetchedUserInfo } = useUserInfo();
    const [isDeletingLivestock, setIsDeletingLivestock] = useState(false);
    const [image, setImage] =
        useState<ImagePicker.ImagePickerAsset | null>(null);

    const [changeImage, setChangeImage] = useState(false);
    const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
    const [isUpdatingImage, setIsUpdatingImage] = useState(false);

    const handleFetchLivestock = async () => {
        if (!selectedOrganizationId || !livestockId) {
            return;
        }

        // setLoading(true);

        try {
            await fetchIndividualLivestock(
                setLivestockData,
                Number(livestockId),
                selectedOrganizationId
            )
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred";

            showToast({
                action: "error",
                title: "Failed to Fetch Livestock",
                description: message,
            });
        } finally {
            // setLoading(false);
        }
    };

    const handleProceedToNextPhase = async () => {
        if (!selectedOrganizationId || !livestockId) {
            return;
        }

        try {
            setOnAction(true)

            await proceedToNextPhase(
                Number(livestockId),
                selectedOrganizationId
            );

            showToast({
                action: "success",
                title: "Successfully proceeded to the next phase.",
                description:
                    "The livestock has been updated to the next phase.",
            });
            
            setIsChangingPhase(false);
            setOnAction(false);

            await handleFetchLivestock();



        } catch (error) {
            // const message =
            //     error instanceof Error
            //         ? error.message
            //         : "An unexpected error occurred";

            showToast({
                action: "error",
                title: "Failed to Proceed",
                description: "Failed to proceed to next phase, please try again later.",
            });

            setIsChangingPhase(false);
            setOnAction(false);
        }
    };

    const handleHarvestLivestock = async () => {
        if (!selectedOrganizationId || !livestockId) {
            return;
        }

        try {
            setOnAction(true);

            await harvestLivestock(
                Number(livestockId),
                selectedOrganizationId
            )

            showToast({
                action: "success",
                title: "Successfully harvested livestock.",
                description:
                    "The livestock has been harvested.",
            });

            setIsHarvesting(false);
            setOnAction(false);

            await handleFetchLivestock();

        } catch (error) {
            // const message =
            //     error instanceof Error
            //         ? error.message
            //         : "An unexpected error occurred";

            showToast({
                action: "error",
                title: "Failed to Harvest",
                description: "Failed to harvest livestock, please try again later.",
            });

            setIsHarvesting(false);
            setOnAction(false);
        }
    };

    const handleDeleteLivestock = async () => {
        if (!selectedOrganizationId || !livestockId) {
            return;
        }

        try {
            setOnAction(true);

            await deleteLivestock(
                Number(livestockId),
                selectedOrganizationId
            )

            showToast({
                action: "success",
                title: "Successfully deleted livestock.",
                description:
                    "The livestock has been deleted.",
            });

            setShowActionsheet(false);
            setIsDeletingLivestock(false);
            setOnAction(false);

            router.back();

        } catch (error) {
            // const message =
            //     error instanceof Error
            //         ? error.message
            //         : "An unexpected error occurred";

            showToast({
                action: "error",
                title: "Failed to Delete",
                description: "Failed to delete livestock, please try again later.",
            });

            setShowActionsheet(false);
            setIsDeletingLivestock(false);
            setOnAction(false);
        }
    };

    
    const pickImage = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            showToast({
                action: "error",
                title: "Permission Required",
                description: "Please allow access to your photo library.",
            });
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
            setIsImagePickerOpen(false);
        }
    };

    const takePhoto = async () => {
        const permission =
            await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
            showToast({
                action: "error",
                title: "Permission Required",
                description: "Please allow access to your camera.",
            });
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
            setIsImagePickerOpen(false);
        }
    };

    const handleUpdateLivestockImage = async () => {
        if (
            !selectedOrganizationId ||
            !livestockData?.id ||
            !image
        ) {
            return;
        }

        try {
            setIsUpdatingImage(true);

            await updateLivestockImage(
                selectedOrganizationId,
                livestockData.id,
                image
            );

            await handleFetchLivestock();

            setImage(null);
            setChangeImage(false);

            showToast({
                action: "success",
                title: "Livestock Image Updated",
                description: "The livestock image has been updated successfully.",
            });
        } catch (error) {
            showToast({
                action: "error",
                title: "Failed to Update Image",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to update the livestock image. Please try again.",
            });
        } finally {
            setIsUpdatingImage(false);
        }
    };


    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    await handleFetchLivestock();
                } finally {
                    setLoading(false);
                }
            }
            if (selectedOrganizationId && livestockId && livestockName) {
                fetchData();
            }
        }, [selectedOrganizationId, livestockId, livestockName])
    );

    const isNurseryDurationInsufficient =
        livestockData?.type === "plant" &&
        livestockData.data?.phase === "nursery" &&
        livestockData.data.nursery_days > 0;

    const growbedDaysElapsed =
        livestockData?.type === "plant" &&
        livestockData.data.phase === "growbed" &&
        livestockData.data.phase_changed_on
            ? Math.floor(
                (Date.now() -
                    new Date(
                        livestockData.data.phase_changed_on
                    ).getTime()) /
                    (1000 * 60 * 60 * 24)
            )
            : 0;

    const isGrowbedDurationInsufficient =
        livestockData?.type === "plant" &&
        livestockData.data.phase === "growbed" &&
        growbedDaysElapsed < livestockData.data.harvest_days;

    const isHarvestDurationInsufficient =
        livestockData?.type === "fish" &&
        livestockData.data?.growth_days > 0;

    const isHarvested =
            livestockData?.harvested

    const isHarvestDisabled =
        livestockData?.type === "plant" &&
        livestockData.data.phase !== "growbed";

    const isChangePhaseDisabled =
        livestockData?.type === "plant" &&
        livestockData.data.phase === "growbed";
            
    const isUserAuthorized =
        livestockData?.added_by === fetchedUserInfo?.id ||
        selectedOrganizationUserRole === "owner" ||
        selectedOrganizationUserRole === "admin";

    return (
        <>
        <Stack.Screen 
            options={{
                title: passedParams.livestockName
            }}
        />
            {loading ? (
                <SkeletonLoading skeletonVariant="show" />
            ) : !livestockData ? (
                <Center className="flex-1">
                    <Text>Failed to fetch livestock information</Text>
                </Center>
            ) : (
                <>
                    <VStack className="flex-1 p-5"
                        space="md"
                    >
                        
                        <Center className="mb-3">
                            {!changeImage ? (
                                <>
                                    {livestockData.image_url ? (
                                        <ImageViewer
                                            images={[
                                                {
                                                    url: livestockData.image_url,
                                                    alt: livestockData.livestock_name ?? "Livestock Image",
                                                },
                                            ]}
                                        >
                                            <ImageViewerTrigger>
                                                <Center>
                                                    <Image
                                                        source={{ uri: livestockData.image_url }}
                                                        alt={livestockData.livestock_name ?? "Livestock Image"}
                                                        className="border-3 border-white rounded"
                                                        resizeMode="cover"
                                                        size="xl"
                                                    />
                                                </Center>
                                            </ImageViewerTrigger>

                                            <ImageViewerContent>
                                                <ImageViewerCloseButton />
                                            </ImageViewerContent>
                                        </ImageViewer>
                                    ) : (
                                        <Center className="bg-gray-200 rounded border-3 border-white w-32 h-32">
                                            <Text className="text-gray-500 text-center">
                                                No image available
                                            </Text>
                                        </Center>
                                    )}

                                    {isUserAuthorized && (
                                        <Button
                                            className="mt-3"
                                            onPress={() => setChangeImage(true)}
                                        >
                                            <ButtonText>Change Livestock Image</ButtonText>
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <VStack className="w-full" space="md">
                                    {imageField(
                                        image?.uri ?? null,
                                        setIsImagePickerOpen,
                                        "Livestock Image"
                                    )}

                                    <Button
                                        onPress={handleUpdateLivestockImage}
                                        isDisabled={!image || isUpdatingImage || onAction}
                                    >
                                        <ButtonText>
                                            {isUpdatingImage ? "Uploading Image..." : "Save Image"}
                                        </ButtonText>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        isDisabled={isUpdatingImage}
                                        onPress={() => {
                                            setChangeImage(false);
                                            setImage(null);
                                        }}
                                    >
                                        <ButtonText>Cancel</ButtonText>
                                    </Button>
                                </VStack>
                            )}
                        </Center>
                        
                        <ScrollView
                            showsVerticalScrollIndicator
                            className="mb-7"
                        >
                            {livestockData?.type === "plant" && (
                                <PlantTypeDetails
                                    livestock={livestockData}
                                    userSettings={fetchedUserSettings}
                                />
                            )}
                            {livestockData?.type === "fish" && (
                                <FishTypeDetails
                                    livestock={livestockData}
                                    userSettings={fetchedUserSettings}
                                />
                            )}
                        </ScrollView>    
                    </VStack>
                    <Fab
                        size="md"
                        placement="bottom right"
                        isHovered={false}
                        isDisabled={onAction}
                        className="mb-15"
                        onPress={() => setShowActionsheet(true)}
                    >
                        <FabIcon as={Menu} />
                        <FabLabel>Menu</FabLabel>
                    </Fab>
                </>
            )}
            <Actionsheet isOpen={showActionsheet} onClose={() => setShowActionsheet(false)}>
                <ActionsheetContent>
                    <Heading className="text-lg font-bold mb-2">Actions</Heading>
                    {livestockData?.type === "plant" && (
                        <ActionsheetItem onPress={() => {
                            setShowActionsheet(false)
                            setIsChangingPhase(true)
                        }} className={`m-2 ${
                            isChangePhaseDisabled ? "bg-gray-200" : "bg-white"
                        }`} disabled={isChangePhaseDisabled}>
                            <ActionsheetItemText className={isChangePhaseDisabled ? "text-gray-400" : "text-black"}>Proceed to next Phase</ActionsheetItemText>
                        </ActionsheetItem>
                    )}
                    
                    <ActionsheetItem
                        onPress={() => {
                            setShowActionsheet(false);
                            setIsHarvesting(true);
                        }}
                        disabled={isHarvestDisabled || isHarvested}
                        className={`m-2 ${
                            isHarvestDisabled || isHarvested ? "bg-gray-200" : "bg-white"
                        }`}
                    >
                        <ActionsheetItemText
                            className={isHarvestDisabled || isHarvested ? "text-gray-400" : "text-black"}
                        >
                            Harvest Livestock
                        </ActionsheetItemText>
                    </ActionsheetItem>
                    <ActionsheetItem
                        onPress={() => {
                            setShowActionsheet(false);
                            router.push({
                                pathname: '/livestock/logs',
                                params: {
                                    livestockId: livestockData?.id,
                                    isHarvested: livestockData?.harvested?.toString(),
                                }
                            })
                        }}
                        className="m-2 bg-white"
                    >
                        <ActionsheetItemText className="text-black">View Logs</ActionsheetItemText>
                    </ActionsheetItem>
                    <ActionsheetItem
                        isDisabled={!isUserAuthorized}
                        className="m-2 bg-white"
                        onPress={() => setIsDeletingLivestock(true)}
                    >
                        <ActionsheetItemText className="text-red-500">Delete</ActionsheetItemText>
                    </ActionsheetItem>
                </ActionsheetContent>
            </Actionsheet>
            <AlertDialog
                isOpen={isChangingPhase || isHarvesting}
                onClose={() => {
                    if (isChangingPhase) {
                        setIsChangingPhase(false);
                    }
                    if (isHarvesting) {
                        setIsHarvesting(false);
                    }
                }}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading className="text-foreground font-semibold text-lg">
                            {isChangingPhase ? "Proceed to Next Phase" : isHarvesting ? "Harvest Livestock" : ""}
                        </Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-3 mb-4">
                        <Text className="mb-2">
                            {isChangingPhase ? "Are you sure you want to proceed to the next phase of this livestock?" : isHarvesting ? "Are you sure you want to harvest this livestock?" : ""}
                        </Text>
                        {isChangingPhase && livestockData?.type === "plant" && isNurseryDurationInsufficient && (
                            <Text className="text-sm text-muted-foreground text-red-500">
                                <Text className="font-bold text-red-500">WARNING:</Text> The nursery duration for this plant is insufficient. Proceeding to the next phase may affect its growth and yield.
                            </Text>
                        )}
                        {isHarvesting &&
                            livestockData?.type === "plant" &&
                            isGrowbedDurationInsufficient && (
                                <Text className="text-sm text-red-500">
                                    <Text className="font-bold text-red-500">
                                        WARNING:
                                    </Text>{" "}
                                    The growbed duration for this plant is insufficient.
                                    Proceeding to harvest may affect its quality and yield.
                                </Text>
                        )}
                        {isHarvesting && livestockData?.type === "fish" && isHarvestDurationInsufficient && (
                            <Text className="mt-2 text-sm text-foreground/70 text-red-500">
                                <Text className="font-bold text-red-500">WARNING:</Text> The harvest duration for this fish is insufficient. Proceeding to harvest may affect its quality.
                            </Text>
                        )}
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button variant="outline" isDisabled={onAction} onPress={() => {
                            if (isChangingPhase) {
                                setIsChangingPhase(false);
                            }
                            if (isHarvesting) {
                                setIsHarvesting(false);
                            }
                        }}>
                            <ButtonText>Cancel</ButtonText>
                        </Button>
                        <Button
                            isDisabled={onAction}
                            onPress={() => {
                                if (isChangingPhase) {
                                    handleProceedToNextPhase();
                                }

                                if (isHarvesting) {
                                    handleHarvestLivestock();
                                }
                            }}
                        >
                            <ButtonText>{isChangingPhase ? "Proceed" : isHarvesting ? "Harvest" : ""}</ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog
                isOpen={isDeletingLivestock}
                onClose={() => setIsDeletingLivestock(false)}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading className="text-foreground font-semibold text-lg">
                            Deleting {livestockData?.livestock_name}
                        </Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-3 mb-4">
                        <Text className="text-sm text-muted-foreground">
                            Confirming this will delete the livestock {livestockData?.livestock_name}.
                        </Text>
                        <Text className="text-sm text-muted-foreground text-red-500">
                            This action cannot be undone.
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button variant="outline" isDisabled={onAction} onPress={() => setIsDeletingLivestock(false)}>
                            <ButtonText>Cancel</ButtonText>
                        </Button>
                        <Button isDisabled={onAction} onPress={() => {
                            handleDeleteLivestock();
                        }}>
                            <ButtonText>Confirm</ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {imagePickerModal(
                isImagePickerOpen,
                setIsImagePickerOpen,
                takePhoto,
                pickImage
            )}
        </>
    )
}