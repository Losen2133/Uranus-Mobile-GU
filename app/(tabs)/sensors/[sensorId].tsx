import LoaderDisplay from "@/components/LoaderDisplay";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useOrganization } from "@/hooks/useOrganization";
import { fetchSensorChartLink } from "@/utils/apiFetch";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useCallback, useEffect, useState } from "react";
import {
    View,
    useWindowDimensions
} from "react-native";
import { WebView } from "react-native-webview";

function portraitView() {
    return (
        <View className="flex-1 items-center justify-center">
            <Text>Turn Screen Landscape</Text>
        </View>
    );
}


export default function SensorReadingPage() {
    const { sensorId } = useLocalSearchParams<{sensorId: string}>();
    const selectedSensorId = Number(sensorId) ?? undefined;

    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    const { selectedOrganizationId } = useOrganization();

    const [loading, setLoading] = useState(false);
    const [isWebViewLoading, setIsWebViewLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chartLink, setChartLink] = useState<string>();

    useFocusEffect(
        useCallback(() => {
            ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.LANDSCAPE
            );

            if (selectedOrganizationId && selectedSensorId) {
                setIsWebViewLoading(true);

                fetchSensorChartLink(
                    setLoading,
                    setError,
                    setChartLink,
                    selectedSensorId,
                    selectedOrganizationId
                );
            }

            return () => {
                ScreenOrientation.unlockAsync();
            };
        }, [selectedOrganizationId])
    );

    useEffect(() => {
        if (chartLink) {
            console.log("Chart link:", chartLink);
        }
    }, [chartLink]);

    if (!isLandscape) {
        return portraitView();
    }

    if (error) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text>{error}</Text>
            </View>
        );
    }

    return (
        <>
            <View className="flex-1">
                {chartLink && (
                    <WebView
                        source={{ uri: chartLink }}
                        style={{ flex: 1 }}
                        onLoadStart={() => {
                            setIsWebViewLoading(true);
                        }}
                        onLoadEnd={() => {
                            setIsWebViewLoading(false);
                        }}
                    />
                )}

                {isWebViewLoading && (
                    <Box className="absolute inset-0 items-center justify-center">
                        <LoaderDisplay
                            type="loading"
                            message="Fetching Sensor Chart Readings..."
                            textColor="text-black-500"
                        />
                    </Box>
                )}
            </View>
        </>
    );
}