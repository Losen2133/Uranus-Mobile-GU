import useAppToast from "@/components/AppToast";
import { FishTypeDetails } from "@/components/LivestockDetails/FishTypeDetails";
import { PlantTypeDetails } from "@/components/LivestockDetails/PlantTypeDetails";
import LoaderDisplay from "@/components/LoaderDisplay";
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
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useOrganization } from "@/hooks/useOrganization";
import { useUserSettings } from "@/hooks/useUserSettings";
import { LivestockData } from "@/interfaces/interfaces";
import { fetchIndividualLivestock, harvestLivestock, proceedToNextPhase } from "@/utils/apiFetch";
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [livestockData, setLivestockData] = useState<LivestockData>();
    const { selectedOrganizationId } = useOrganization();
    const { fetchedUserSettings } = useUserSettings();
    const [showActionsheet, setShowActionsheet] = useState(false);
    const [isChangingPhase, setIsChangingPhase] = useState(false);
    const [isHarvesting, setIsHarvesting] = useState(false);
    const { showToast } = useAppToast();
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            if (selectedOrganizationId && livestockId && livestockName) {
                fetchIndividualLivestock(
                    setLoading,
                    setError,
                    setLivestockData,
                    passedParams.id,
                    selectedOrganizationId
                );
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

    const isHarvestDisabled =
        livestockData?.type === "plant" &&
        livestockData.data.phase !== "growbed";

    const isChangePhaseDisabled =
        livestockData?.type === "plant" &&
        livestockData.data.phase === "growbed";

    return (
        <>
        <Stack.Screen 
            options={{
                title: passedParams.livestockName
            }}
        />
            {loading ? (
                <LoaderDisplay
                    type="loading"
                    message="Fetching Livestock Details..."
                />
            ) : error ? (
                <LoaderDisplay
                    type="error"
                    message={error}
                />
            ) : (
                <>
                    <VStack className="flex-1 p-5"
                        space="md"
                    >
                        <Center>
                            <Image
                                size="xl"
                                className="border-3 border-white rounded-full"
                                source={{
                                    uri: `${livestockData?.image_url}`
                                }}
                                alt="Plant Image Here"
                            />
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
                        isDisabled={false}
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
                            isHarvestDisabled ? "bg-gray-200" : "bg-white"
                        }`} disabled={isChangePhaseDisabled}>
                            <ActionsheetItemText className={isChangePhaseDisabled ? "text-gray-400" : "text-black"}>Proceed to next Phase</ActionsheetItemText>
                        </ActionsheetItem>
                    )}
                    
                    <ActionsheetItem
                        onPress={() => {
                            setShowActionsheet(false);
                            setIsHarvesting(true);
                        }}
                        disabled={isHarvestDisabled}
                        className={`m-2 ${
                            isHarvestDisabled ? "bg-gray-200" : "bg-white"
                        }`}
                    >
                        <ActionsheetItemText
                            className={isHarvestDisabled ? "text-gray-400" : "text-black"}
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
                        <Button variant="outline" onPress={() => {
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
                            onPress={() => {
                                if (isChangingPhase) {
                                    setIsChangingPhase(false);
                                    proceedToNextPhase(
                                        passedParams.id,
                                        selectedOrganizationId,
                                        async () => {
                                            showToast({
                                                action: "success",
                                                title: "Successfully proceeded to the next phase.",
                                                description: "The livestock has been updated to the next phase."
                                            });

                                            fetchIndividualLivestock(
                                                setLoading,
                                                setError,
                                                setLivestockData,
                                                passedParams.id,
                                                selectedOrganizationId
                                            );
                                        }
                                    );
                                    console.log("Proceeding to next phase...");
                                }

                                if (isHarvesting) {
                                    setIsHarvesting(false);
                                    harvestLivestock(
                                        passedParams.id,
                                        selectedOrganizationId,
                                        async () => {
                                            showToast({
                                                action: "success",
                                                title: "Successfully harvested livestock.",
                                                description: "The livestock has been marked as harvested."
                                            });

                                            fetchIndividualLivestock(
                                                setLoading,
                                                setError,
                                                setLivestockData,
                                                passedParams.id,
                                                selectedOrganizationId
                                            );
                                        }
                                    )

                                    console.log("Harvesting livestock...");
                                }
                            }}
                        >
                            <ButtonText>{isChangingPhase ? "Proceed" : isHarvesting ? "Harvest" : ""}</ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}