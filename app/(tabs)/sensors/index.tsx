import SelectOrgDisplay from "@/components/SelectOrgDisplay";
import { Box } from "@/components/ui/box";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { useOrganization } from "@/hooks/useOrganization";
import { SensorData } from "@/interfaces/interfaces";
import { fetchSensorData } from "@/utils/apiFetch";
import { useFocusEffect, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { SearchIcon } from "lucide-react-native";
import { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";

export default function SensorsScreen() {
    const [query, setQuery] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sensorData, setSensorData] = useState<SensorData[] | undefined>(undefined);
    const [refreshing, setRefreshing] = useState(false);
    const { selectedOrganizationId } = useOrganization();
    const router = useRouter();
    
    useFocusEffect(
        useCallback(() => {
            ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.PORTRAIT_UP
            );

            return () => {
                ScreenOrientation.unlockAsync();
            };
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            if (selectedOrganizationId) {
                fetchSensorData(
                    setLoading,
                    setError,
                    setSensorData,
                    selectedOrganizationId
                )
            }
        }, [selectedOrganizationId])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchSensorData(
            setLoading,
            setError,
            setSensorData,
            selectedOrganizationId
        )
        setRefreshing(false);
    }

    

    return (
        <>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                {!selectedOrganizationId ? (
                    <SelectOrgDisplay />
                ) : (
                    // <Button
                    //     onPress={() => router.push({
                    //         pathname: '/(tabs)/sensors/[sensorId]',
                    //         params: { sensorId: 2 }
                    //     })}
                    // >
                    //     <ButtonText>Click to go to current sensor page</ButtonText>
                    // </Button>
                    
                    <VStack className="flex-1 p-5 mb-12"
                        space='md'
                    >
                        <Box>
                            <Input>
                                <InputSlot>
                                    <InputIcon as={SearchIcon} />
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
                    </VStack>
                )}
            </KeyboardAvoidingView>
        </>
    )
}