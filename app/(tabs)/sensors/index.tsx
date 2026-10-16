import useAppToast from "@/components/AppToast";
import SelectOrgDisplay from "@/components/SelectOrgDisplay";
import SkeletonLoading from "@/components/SkeletonLoading";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useFam } from "@/hooks/useFamOpacity";
import { useOrganization } from "@/hooks/useOrganization";
import { SensorData } from "@/interfaces/interfaces";
import { fetchSensorData } from "@/utils/apiFetch";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import { SearchIcon } from "lucide-react-native";
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
                        <Center className="flex-1">
                            <Text>There are no sensors available.</Text>
                        </Center>
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
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.item,
                                        pressed && styles.pressed,
                                    ]}
                                    onPress={() => {
                                        router.push({
                                            pathname: "/(tabs)/sensors/[sensorId]",
                                            params: {
                                                sensorId: item.id.toString(),
                                            },
                                        });
                                    }}
                                >
                                    <HStack space="md" className="items-center">
                                        <Box className="flex-1">
                                            <Text className="font-bold text-lg">
                                                {item.name}
                                            </Text>

                                            {/* <Text className="text-sm text-foreground/70">
                                                Purpose:{" "}
                                                {PURPOSE_LABELS[
                                                    (item.purpose ?? "").toLowerCase() as Exclude<
                                                        SensorPurpose,
                                                        "all"
                                                    >
                                                ] ?? item.purpose}
                                            </Text> */}

                                            <Text className="text-sm text-foreground/70">
                                                Device ID: {item.device_id}
                                            </Text>
                                        </Box>
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
