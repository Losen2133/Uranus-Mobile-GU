import useAppToast from "@/components/AppToast";
import MaintenanceReminderDetailModal from "@/components/MaintenanceReminderDetailModal";
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
import { SensorMaintenanceReminderData } from "@/interfaces/interfaces";
import { fetchSensorMaintenanceReminderData } from "@/utils/apiFetch";
import { formatDate, formatDateTime } from "@/utils/stringUtils";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, SectionList, StyleSheet } from "react-native";

export default function SensorMaintenanceRemindersScreen() {
    const { selectedOrganizationId, selectedOrganizationUserRole } = useOrganization();
    const { sensorId } = useLocalSearchParams<{ sensorId: string }>();
    const sensorIdNumber = Number(sensorId);
    const [sensorMaintenanceRemindersData, setSensorMaintenanceRemindersData] = useState<SensorMaintenanceReminderData[]>([]);
    const [selectedType, setSelectedType] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { showToast } = useAppToast();
    const { famOpacity, setFamOpacity } = useFam();
    const [selectedReminder, setSelectedReminder] = useState<SensorMaintenanceReminderData>();
    const [reminderDetail, setReminderDetail] = useState(false);
    const router = useRouter();

    const handleFetchSensorMaintenanceReminders = async () => {
        if (!selectedOrganizationId || !sensorIdNumber) {
            return;
        }

        // setLoading(true);

        try {
            await fetchSensorMaintenanceReminderData(
                selectedOrganizationId,
                sensorIdNumber,
                setSensorMaintenanceRemindersData
            );
        } catch (error) {
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
                    await handleFetchSensorMaintenanceReminders();
                } finally {
                    setLoading(false);
                }
            }
            fetchData();
        }, [sensorIdNumber, selectedOrganizationId])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        handleFetchSensorMaintenanceReminders();
        setRefreshing(false);
    }

    const filteredSensorMaintenanceReminders = useMemo(() => {
        const searchQuery = query.trim().toLowerCase();

        return sensorMaintenanceRemindersData.filter((reminder) => {
            // Filter by status
            if (
                selectedType !== "all" &&
                reminder.status !== selectedType
            ) {
                return false;
            }

            // No search query
            if (!searchQuery) {
                return true;
            }

            const title = reminder.title?.toLowerCase() ?? "";
            const description = reminder.description?.toLowerCase() ?? "";
            const status = reminder.status?.toLowerCase() ?? "";
            const addedByName = reminder.added_by_name?.toLowerCase() ?? "";
            const addedByEmail = reminder.added_by_email?.toLowerCase() ?? "";

            return (
                title.includes(searchQuery) ||
                description.includes(searchQuery) ||
                status.includes(searchQuery) ||
                addedByName.includes(searchQuery) ||
                addedByEmail.includes(searchQuery)
            );
        });
    }, [
        sensorMaintenanceRemindersData,
        query,
        selectedType,
    ]);

    const sections = useMemo(() => {
        const grouped = filteredSensorMaintenanceReminders.reduce((acc, reminder) => {
            const status = reminder.status;

            if (!acc[status]) {
                acc[status] = [];
            }

            acc[status].push(reminder);

            return acc;
        }, {} as Record<string, SensorMaintenanceReminderData[]>);

        const order = ["pending", "completed", "cancelled"];

        const titles: Record<string, string> = {
            pending: "Pending",
            completed: "Completed",
            cancelled: "Cancelled",
        };

        return Object.entries(grouped)
            .sort(([statusA], [statusB]) => {
                return order.indexOf(statusA) - order.indexOf(statusB);
            })
            .map(([status, data]) => ({
                title: titles[status] ?? status,
                data,
            }));
    }, [filteredSensorMaintenanceReminders]);

    const isMaintenanceRemindersEmpty = sensorMaintenanceRemindersData.length === 0;
    const isFilteredMaintenanceRemindersEmpty = filteredSensorMaintenanceReminders.length === 0;

    return (
        <>
            <VStack className="flex-1 p-5 mb-12"
                space="md"
            >
                <Box>
                    <Input
                        isDisabled={isMaintenanceRemindersEmpty}
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
                        enabled={!isMaintenanceRemindersEmpty}
                    >
                        <Picker.Item
                            label="All"
                            value="all"
                        />

                        <Picker.Item
                            label="Pending"
                            value="pending"
                        />

                        <Picker.Item
                            label="Completed"
                            value="completed"
                        />

                        <Picker.Item
                            label="Cancelled"
                            value="cancelled"
                        />
                    </Picker>
                </Box>
                {loading ? (
                    <SkeletonLoading />
                ) : isMaintenanceRemindersEmpty && !loading ? (
                    <Center className="flex-1">
                        <Text className="text-center">There are no maintenance reminders available</Text>
                    </Center>
                ) : isFilteredMaintenanceRemindersEmpty ? (
                    <Center className="flex-1">
                        <Text className="text-center">No maintenance reminders match your search or filter.</Text>
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
                                    pressed && styles.pressed,
                                ]}
                                onPress={() => {
                                    setSelectedReminder(item);
                                    setReminderDetail(true);
                                }}
                            >
                                <HStack>
                                    <Box className="flex-1">
                                        <Box className="flex-row items-start justify-between gap-3">
                                            <Text className="font-bold text-lg mr-2">
                                                {item.title}
                                            </Text>

                                            <Text className="text-sm text-foreground/60">
                                                {formatDate(item.created_at, "numeric")}
                                            </Text>
                                        </Box>
                                        <Text className="mt-2 text-foreground/80">
                                            {item.description}
                                        </Text>
                                        <Text className="mt-2 text-foreground/80">
                                            Scheduled At: {formatDateTime(item.scheduled_at, "short")}
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
                        pathname: "/sensors/maintenanceReminderForm",
                        params: {
                            sensorId
                        },
                    })
                }
            >
                <FabIcon as={AddIcon} />
                <FabLabel>Create Log</FabLabel>
            </Fab>
            <MaintenanceReminderDetailModal
                isOpen={reminderDetail}
                onClose={() => setReminderDetail(false)}
                userRole={selectedOrganizationUserRole}
                maintenanceReminderData={selectedReminder}
                onEdit={(maintenanceReminder) => {
                    setReminderDetail(false);
                    
                    router.push({
                        pathname: "/(tabs)/sensors/maintenanceReminderForm",
                        params: {
                            sensorId: sensorId,
                            reminderId: maintenanceReminder?.id
                        }
                    })
                }}
                onAction={() => {
                    handleFetchSensorMaintenanceReminders()
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