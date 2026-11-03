import useAppToast from "@/components/AppToast";
import EmptyState from "@/components/EmptyState";
import SelectOrgDisplay from "@/components/SelectOrgDisplay";
import SkeletonLoading from "@/components/SkeletonLoading";
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import {
    Menu,
    MenuItem,
    MenuItemLabel,
} from "@/components/ui/menu";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import UpdateSensorNameModal from "@/components/UpdateSensorNameModal";
import { useFam } from "@/hooks/useFamOpacity";
import { useOrganization } from "@/hooks/useOrganization";
import { SensorData } from "@/interfaces/interfaces";
import { deleteSensor, fetchSensorData, updateSensor } from "@/utils/apiFetch";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import { EllipsisVertical, Pencil, SearchIcon, Unlink } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    RefreshControl,
    SectionList,
    StyleSheet,
} from "react-native";

type SensorPurpose = "all" | "temperature" | "ph" | "water_level";

type SensorSection = {
    title: string;
    purpose: Exclude<SensorPurpose, "all">;
    data: SensorData[];
};

const PURPOSE_LABELS: Record<Exclude<SensorPurpose, "all">, string> = {
    temperature: "Temperature",
    ph: "pH",
    water_level: "Water Level",
};

const PURPOSE_ORDER: Exclude<SensorPurpose, "all">[] = [
    "temperature",
    "ph",
    "water_level",
];

export default function SensorsScreen() {
    const { selectedOrganizationId } = useOrganization();
    const [loading, setLoading] = useState(true);
    const [sensorData, setSensorData] = useState<SensorData[]>([]);
    const [query, setQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [selectedType, setSelectedType] = useState<SensorPurpose>("all");

    const router = useRouter();
    const { famOpacity, setFamOpacity } = useFam();
    const { showToast } = useAppToast();
    const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
    const [editSensor, setEditSensor] = useState(false);
    const [isDeleteSensor, setIsDeleteSensor] = useState(false);
    const [sensorActionLoading, setSensorActionLoading] = useState(false);

    const handleFetchSensor = useCallback(async () => {
        if (!selectedOrganizationId) {
            setSensorData([]);
            return;
        }

        try {
            await fetchSensorData(
                selectedOrganizationId,
                setSensorData
            );
        } catch {
            showToast({
                action: "error",
                title: "Failed to Fetch Sensors",
                description:
                    "Failed to fetch available sensors, please try again later.",
            });
        }
    }, [selectedOrganizationId, showToast]);

    const handleUpdateSensorName = async (newName: string) => {
        if (!selectedSensor || !selectedOrganizationId) return;

        try {
            setSensorActionLoading(true);
            await updateSensor(
                selectedOrganizationId,
                selectedSensor.id,
                newName
            );

            setSelectedSensor(null);
            setSensorActionLoading(false);

            showToast({
                action: "success",
                title: "Sensor Updated",
                description: "Sensor name updated successfully.",
            });
        } catch {
            showToast({
                action: "error",
                title: "Update Failed",
                description: "Failed to update sensor name. Please try again.",
            });
        }
    };

    const handleDeleteSensor = async () => {
        if (!selectedSensor || !selectedOrganizationId) return;

        try {
            setSensorActionLoading(true);

            await deleteSensor(
                selectedOrganizationId,
                selectedSensor.id
            )

            setSelectedSensor(null);
            setIsDeleteSensor(false)
            setSensorActionLoading(false);

            showToast({
                action: "success",
                title: "Sensor Unregistered",
                description: "Sensor unregistered successfully.",
            });
        } catch {
            showToast({
                action: "error",
                title: "Delete Failed",
                description: "Failed to delete sensor. Please try again.",
            });
        }
    }

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchData = async () => {
                try {
                    await handleFetchSensor();
                } finally {
                    if (isActive) {
                        setLoading(false);
                    }
                }
            };

            void fetchData();

            return () => {
                isActive = false;
            };
        }, [handleFetchSensor])
    );

    const handleRefresh = useCallback(async () => {
        if (!selectedOrganizationId) return;

        setRefreshing(true);

        try {
            await handleFetchSensor();
        } finally {
            setRefreshing(false);
        }
    }, [selectedOrganizationId, handleFetchSensor]);

    const filteredSensor = useMemo(() => {
        const searchQuery = query.trim().toLowerCase();

        return sensorData.filter((sensor) => {
            if (!searchQuery) return true;

            return (
                (sensor.name ?? "").toLowerCase().includes(searchQuery) ||
                (sensor.purpose ?? "").toLowerCase().includes(searchQuery) ||
                (sensor.device_id ?? "").toLowerCase().includes(searchQuery) ||
                (sensor.type ?? "").toLowerCase().includes(searchQuery)
            );
        });
    }, [sensorData, query]);

    const sections = useMemo<SensorSection[]>(() => {
        const grouped: Record<
            Exclude<SensorPurpose, "all">,
            SensorData[]
        > = {
            temperature: [],
            ph: [],
            water_level: [],
        };

        filteredSensor.forEach((sensor) => {
            const purpose = (sensor.purpose ?? "").toLowerCase();

            if (purpose in grouped) {
                grouped[purpose as Exclude<SensorPurpose, "all">].push(sensor);
            }
        });

        return PURPOSE_ORDER
            .filter((purpose) => grouped[purpose].length > 0)
            .map((purpose) => ({
                title: PURPOSE_LABELS[purpose],
                purpose,
                data: grouped[purpose],
            }));
    }, [filteredSensor]);

    const filteredSections = useMemo<SensorSection[]>(() => {
        if (selectedType === "all") {
            return sections;
        }

        return sections.filter(
            (section) => section.purpose === selectedType
        );
    }, [sections, selectedType]);

    const isSensorsEmpty = sensorData.length === 0;

    const isFilteredEmpty = filteredSections.length === 0;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {!selectedOrganizationId ? (
                <SelectOrgDisplay />
            ) : (
                <VStack className="flex-1 p-5 mb-12" space="md">
                    <Box>
                        <Input isDisabled={isSensorsEmpty}>
                            <InputSlot>
                                <InputIcon as={SearchIcon} />
                            </InputSlot>

                            <InputField
                                type="text"
                                placeholder="Search sensors..."
                                placeholderTextColor="gray"
                                value={query}
                                onChangeText={setQuery}
                            />
                        </Input>
                    </Box>

                    <Box className="border border-outline-300 border-white h-8 rounded-md justify-center px-3">
                        <Picker
                            selectedValue={selectedType}
                            onValueChange={(value) =>
                                setSelectedType(value as SensorPurpose)
                            }
                            dropdownIconColor="white"
                            style={{
                                color: "white",
                                marginHorizontal: -10,
                            }}
                            enabled={!isSensorsEmpty}
                        >
                            <Picker.Item
                                label="All"
                                value="all"
                            />

                            <Picker.Item
                                label="Temperature"
                                value="temperature"
                            />

                            <Picker.Item
                                label="pH"
                                value="ph"
                            />

                            <Picker.Item
                                label="Water Level"
                                value="water_level"
                            />
                        </Picker>
                    </Box>

                    {loading ? (
                        <SkeletonLoading />
                    ) : isSensorsEmpty ? (
                        <EmptyState 
                            message="There are no sensors available."
                            onRefresh={handleRefresh}
                        />
                    ) : isFilteredEmpty ? (
                        <Center className="flex-1">
                            <Text>
                                No sensors match your search or filter.
                            </Text>
                        </Center>
                    ) : (
                        <SectionList
                            sections={filteredSections}
                            keyExtractor={(item) => item.id.toString()}
                            onScrollBeginDrag={() => {
                                if (famOpacity === 100) {
                                    setFamOpacity(35);
                                }
                            }}
                            renderSectionHeader={({ section }) => (
                                <Box className="px-4 py-2 bg-background">
                                    <Text className="text-xs font-semibold uppercase text-foreground">
                                        {section.title}
                                    </Text>

                                    <Divider className="mt-2" />
                                </Box>
                            )}
                            renderItem={({ item }) => (
                                // <Pressable
                                //     style={({ pressed }) => [
                                //         styles.item,
                                //         { paddingLeft: 12 },
                                //         pressed && styles.pressed,
                                //     ]}
                                //     onPress={() => {
                                //         router.push({
                                //             pathname: "/(tabs)/sensors/[sensorId]",
                                //             params: { sensorId: item.id.toString() },
                                //         });
                                //     }}
                                // >
                                //     <HStack space="md" className="items-center justify-between">
                                //         <Box className="flex-1">
                                //             <Text className="font-bold text-lg">
                                //                 {item.name}
                                //             </Text>
                                //             <Text className="text-sm text-foreground/70">
                                //                 Device ID: {item.device_id}
                                //             </Text>
                                //         </Box>

                                //         {item.maintenance_reminders_count > 0 && (
                                //             <Center className="w-6 h-6 rounded-full bg-red-500">
                                //                 <Text className="text-white text-xs font-bold">
                                //                     {item.maintenance_reminders_count}
                                //                 </Text>
                                //             </Center>
                                //         )}
                                //     </HStack>
                                // </Pressable>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.item,
                                        { paddingLeft: 12 },
                                        pressed && styles.pressed,
                                    ]}
                                    onPress={() => {
                                        router.push({
                                            pathname: "/(tabs)/sensors/[sensorId]",
                                            params: { sensorId: item.id.toString() },
                                        });
                                    }}
                                >
                                    <HStack space="md" className="items-center justify-between">
                                        <Box className="flex-1">
                                            <Text className="font-bold text-lg">
                                                {item.name}
                                            </Text>
                                            <Text className="text-sm text-foreground/70">
                                                Device ID: {item.device_id}
                                            </Text>
                                        </Box>

                                        {item.maintenance_reminders_count > 0 && (
                                            <Center className="w-6 h-6 rounded-full bg-red-500">
                                                <Text className="text-white text-xs font-bold">
                                                    {item.maintenance_reminders_count}
                                                </Text>
                                            </Center>
                                        )}

                                        <Menu
                                            className="w-fit"
                                            placement="bottom right"
                                            closeOnSelect
                                            trigger={({ ...triggerProps }) => (
                                                <Pressable className="items-center justify-center"
                                                    { ...triggerProps }
                                                >
                                                    <Icon as={EllipsisVertical} className="h-7 w-7" />
                                                </Pressable>
                                            )}
                                        >
                                            <MenuItem
                                                key="edit"
                                                textValue="Edit Sensor Name"
                                                onPress={() => {
                                                    setSelectedSensor(item);
                                                    setEditSensor(true);
                                                }}
                                            >
                                                <Icon as={Pencil} size="sm" className="mr-2" />
                                                <MenuItemLabel>
                                                    Edit Sensor Name
                                                </MenuItemLabel>
                                            </MenuItem>
                                            <MenuItem
                                            key="Delete"
                                            textValue="Delete"
                                            onPress={() => {
                                                setSelectedSensor(item);
                                                setIsDeleteSensor(true);
                                            }}
                                        >
                                            <Icon
                                                as={Unlink}
                                                color="red"
                                                size="sm"
                                                className="mr-2"
                                            />
                                            <MenuItemLabel className="text-red-500">
                                                Unregister
                                            </MenuItemLabel>
                                        </MenuItem>
                                        </Menu>
                                    </HStack>
                                </Pressable>
                            )}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                />
                            }
                            contentContainerStyle={
                                styles.listContent
                            }
                            stickySectionHeadersEnabled={false}
                        />
                    )}
                    <UpdateSensorNameModal
                        visible={editSensor}
                        currentName={selectedSensor?.name ?? ""}
                        onClose={() => {
                            setEditSensor(false)
                            setSelectedSensor(null)
                        }}
                        onSave={async (newName) => {
                            handleUpdateSensorName(newName);
                        }}
                    />
                    <AlertDialog
                        isOpen={isDeleteSensor}
                        onClose={() => setIsDeleteSensor(false)}
                    >
                        <AlertDialogBackdrop />
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <Heading className="text-foreground font-semibold text-lg">
                                    Are you sure you want to unregister {selectedSensor?.name}?
                                </Heading>
                            </AlertDialogHeader>
                            <AlertDialogBody className="mt-3 mb-4">
                                <Text className="text-sm text-muted-foreground">
                                    Confirming this will unregister the sensor {selectedSensor?.name}.
                                </Text>
                                <Text className="text-sm text-muted-foreground text-red-500">
                                    This action cannot be undone.
                                </Text>
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button variant="outline" onPress={() => setIsDeleteSensor(false)}>
                                    <ButtonText>Cancel</ButtonText>
                                </Button>
                                <Button
                                    onPress={() => {
                                        handleDeleteSensor();
                                    }}
                                    isDisabled={sensorActionLoading}
                                >
                                    <ButtonText>Confirm</ButtonText>
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </VStack>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    item: {
        borderWidth: 2,
        borderColor: "black",
        backgroundColor: "#ffffff25",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    pressed: {
        backgroundColor: "black",
        borderColor: "white",
    },
    listContent: {
        paddingBottom: 16,
    },
});
