import useAppToast from "@/components/AppToast";
import ConcernDetailModal from "@/components/ConcernDetailModal";
import LogDetailModal from "@/components/LogDetailModal";
import SkeletonLoading from "@/components/SkeletonLoading";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { Fab, FabIcon, FabLabel } from "@/components/ui/fab";
import { HStack } from "@/components/ui/hstack";
import { AddIcon, SearchIcon } from "@/components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useFam } from "@/hooks/useFamOpacity";
import { useOrganization } from "@/hooks/useOrganization";
import { LivestockLogData } from "@/interfaces/interfaces";
import { fetchLivestockLogData } from "@/utils/apiFetch";
import { toBoolean } from "@/utils/other";
import { capitalize, formatDate } from "@/utils/stringUtils";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { FolderClosed, FolderOpen } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, SectionList, StyleSheet } from "react-native";

interface LivestockLogsPageParams {
    id: number;
    isLivestockHarvested: boolean | undefined;
}

const severityStyles = {
    low: "text-green-500",
    moderate: "text-yellow-500",
    high: "text-orange-500",
    critical: "text-red-500",
};

export default function LivestockLogsPage() {
    const { livestockId, isHarvested } = useLocalSearchParams<{ livestockId: string, isHarvested: string }>()
    const passedParams: LivestockLogsPageParams = {
        id: Number(livestockId),
        isLivestockHarvested: toBoolean(isHarvested)
    }
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedType, setSelectedType] = useState<"all" | "log" | "concern" | "low" | "moderate" | "high" | "critical" | "open" | "closed">("all");
    const [livestockLogData, setLivestockLogData] = useState<LivestockLogData[]>([]);
    const { famOpacity, setFamOpacity } = useFam();
    const [logDetail, setLogDetail] = useState(false);
    const [concernDetail, setConcernDetail] = useState(false);
    const [selectedLog, setSelectedLog] = useState<LivestockLogData>();
    const [resolving, setResolving] = useState(false);
    const { showToast } = useAppToast();
    const { selectedOrganizationId, selectedOrganizationUserRole } = useOrganization();
    const router = useRouter();
    
    const handleFetchLivestockLogs = async () => {
        if (!selectedOrganizationId || !passedParams.id) {
            return;
        }

        // setLoading(true);

        try {
            await fetchLivestockLogData(
                passedParams.id,
                setLivestockLogData
            )
        } catch (error) {
            // const message =
            //     error instanceof Error
            //         ? error.message
            //         : "An unexpected error occurred";

            showToast({
                action: "error",
                title: "Failed to Fetch Livestock Logs",
                description: "Failed to fetch available logs, please try again later.",
            });
        } finally {
            // setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    await handleFetchLivestockLogs();
                } finally {
                    setLoading(false);
                }
            }
            fetchData();
        }, [passedParams.id, selectedOrganizationId])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        handleFetchLivestockLogs();
        setRefreshing(false);
    }

    const filteredLivestockLogs = useMemo(() => {
        const searchQuery = query.trim().toLowerCase();

        return livestockLogData.filter((item) => {

            // Filter by type
            if (selectedType === "log" && item.type !== "log") {
                return false;
            }

            if (selectedType === "concern" && item.type !== "concern") {
                return false;
            }

            // Severity filters only apply to concerns
            if (
                ["low", "moderate", "high", "critical"].includes(selectedType)
            ) {
                if (
                    item.type !== "concern" ||
                    item.data.severity !== selectedType
                ) {
                    return false;
                }
            }

            // Status filters only apply to concerns
            if (["open", "closed"].includes(selectedType)) {
                if (
                    item.type !== "concern" ||
                    item.data.status !== selectedType
                ) {
                    return false;
                }
            }

            // No search query
            if (!searchQuery) {
                return true;
            }

            const title = item.data.title.toLowerCase();
            const description = item.data.description.toLowerCase();

            if (
                title.includes(searchQuery) ||
                description.includes(searchQuery) ||
                item.type.includes(searchQuery)
            ) {
                return true;
            }

            if (item.type === "concern") {
                return (
                    item.data.severity.includes(searchQuery) ||
                    item.data.status.includes(searchQuery) ||
                    item.data.action_taken
                        ?.toLowerCase()
                        .includes(searchQuery) === true
                );
            }

            return false;
        });
    }, [livestockLogData, query, selectedType]);

    const sections = useMemo(() => {
        const grouped = filteredLivestockLogs.reduce((acc, log) => {
            const type = log.type;

            if (!acc[type]) {
                acc[type] = [];
            }

            acc[type].push(log);

            return acc;
        }, {} as Record<string, LivestockLogData[]>);

        const order = ["log", "concern"];

        return Object.entries(grouped)
            .sort(([typeA], [typeB]) => {
                return order.indexOf(typeA) - order.indexOf(typeB);
            })
            .map(([title, data]) => ({
                title: title === "log" ? "Logs" : "Concerns",
                data,
            }));
    }, [filteredLivestockLogs]);

    const isLogsEmpty = livestockLogData.length === 0;
    const isFilteredEmpty = filteredLivestockLogs.length === 0;

    return (
        <>
            <VStack className="flex-1 p-5 mb-12"
                space="md"
            >
                <Box>
                    <Input
                        isDisabled={isLogsEmpty}
                    >
                        <InputSlot>
                            <InputIcon as={SearchIcon}/>
                        </InputSlot>
                        <InputField
                                type="text"
                                placeholder="Search..."
                                placeholderTextColor={'gray'}
                                value={query}
                                onChangeText={(text) => setQuery(text)}
                            />
                    </Input>
                </Box>
                <Box className="border border-outline-300 border-white h-8 rounded-md justify-center px-3">
                    <Picker
                        selectedValue={selectedType}
                        onValueChange={(value) => {
                            setSelectedType(value);
                        }}
                        dropdownIconColor="white"
                        style={{
                            color: "white",
                            marginHorizontal: -10,
                        }}
                        enabled={!isLogsEmpty}
                    >
                        <Picker.Item
                            label="All"
                            value="all"
                        />

                        <Picker.Item
                            label="Logs"
                            value="log"
                        />

                        <Picker.Item
                            label="Concerns"
                            value="concern"
                        />

                        <Picker.Item
                            label="Concerns: Open"
                            value="open"
                        />

                        <Picker.Item
                            label="Concerns: Closed"
                            value="closed"
                        />

                        <Picker.Item
                            label="Concerns: Low Severity"
                            value="low"
                        />

                        <Picker.Item
                            label="Concerns: Moderate Severity"
                            value="moderate"
                        />

                        <Picker.Item
                            label="Concerns: High Severity"
                            value="high"
                        />

                        <Picker.Item
                            label="Concerns: Critical Severity"
                            value="critical"
                        />
                    </Picker>
                </Box>
                {loading ? (
                    <SkeletonLoading />
                ) : isLogsEmpty && !loading ? (
                    <Center className="flex-1">
                        <Text>There are no logs available</Text>
                    </Center>
                ) : isFilteredEmpty ? (
                    <Center className="flex-1">
                        <Text>No logs match your search or filter.</Text>
                    </Center>
                ) : (
                    <SectionList
                        sections={sections}
                        keyExtractor={(item) => item.id.toString()}
                        onScrollBeginDrag={() => {
                            if (famOpacity === 100)
                                setFamOpacity(35);
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
                                key={item.id}
                                style={({ pressed }) => [
                                    styles.item,
                                    pressed && styles.pressed
                                ]}
                                onPress={() => {
                                    if(item.type === "log") {
                                        setSelectedLog(item);
                                        setLogDetail(true);
                                    } else {
                                        setSelectedLog(item);
                                        setConcernDetail(true);
                                    }
                                }}
                            >
                                <HStack>
                                    <Box className="flex-1">
                                        <Box className="flex-row items-start justify-between gap-3">
                                            <Box className="flex-1">
                                                <Box className="flex-row items-center">
                                                    <Text className="font-bold text-lg mr-2">
                                                        {item.data.title}
                                                    </Text>

                                                    {item.type === "concern" && (
                                                        item.data.status === "open" ? (
                                                            <FolderOpen size={20} color={"white"} />
                                                        ) : (
                                                            <FolderClosed size={20} color={"white"} />
                                                        )
                                                    )}
                                                </Box>
                                                

                                                {item.type === "concern" && (
                                                    <Text
                                                        className={`text-sm font-semibold mt-1 ${severityStyles[item.data.severity]}`}
                                                    >
                                                        {capitalize(item.data.severity)} Severity
                                                    </Text>
                                                )}
                                            </Box>

                                            <Text className="text-sm text-foreground/60">
                                                {formatDate(item.created_at, "numeric")}
                                            </Text>
                                        </Box>

                                        {/* Description */}
                                        <Text className="mt-2 text-foreground/80">
                                            {item.data.description}
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
                    />
                )}
            </VStack>
            <Fab
                size="md"
                placement="bottom right"
                isHovered={false}
                isDisabled={false}
                className="mb-15"
                onPress={() =>
                    router.push({
                        pathname: "/livestock/logForm",
                        params: {
                            livestockId: passedParams.id.toString(),
                        },
                    })
                }
            >
                <FabIcon as={AddIcon} />
                <FabLabel>Create Log</FabLabel>
            </Fab>
            <LogDetailModal
                isOpen={logDetail}
                onClose={() => setLogDetail(false)}
                userRole={selectedOrganizationUserRole}
                logData={selectedLog}
                onAction={() => {
                    handleFetchLivestockLogs()
                }}
            />
            <ConcernDetailModal
                isOpen={concernDetail}
                onClose={() => setConcernDetail(false)}
                logData={selectedLog}
                userRole={selectedOrganizationUserRole}
                severityColor={
                    selectedLog?.type === "concern"
                        ? severityStyles[selectedLog.data.severity]
                        : undefined
                }
                livestockId={passedParams.id}
                onAction={() => {
                    handleFetchLivestockLogs()
                }}
            />
        </>
    )
}

const styles = StyleSheet.create({
    item: {
        borderWidth: 2,
        borderColor: 'black',
        backgroundColor: '#ffffff25',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10
    },
    pressed: {
        backgroundColor: 'black',
        borderColor: 'white'
    },
})