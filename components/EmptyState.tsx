import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { RefreshCw } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator } from "react-native";

interface EmptyStateProps {
    message: string;
    onRefresh?: () => void | Promise<void>;
}

export default function EmptyState({
    message,
    onRefresh,
}: EmptyStateProps) {
    const [loading, setLoading] = useState(false);

    const handleRefresh = async () => {
        if (!onRefresh || loading) return;

        try {
            setLoading(true);
            await onRefresh();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Center className="flex-1 gap-3">
            <Text className="text-center">{message}</Text>

            {onRefresh && (
                <Button
                    variant="outline"
                    onPress={handleRefresh}
                    isDisabled={loading}
                    className="flex-row items-center gap-2"
                >
                    {loading ? (
                        <>
                            <ActivityIndicator size="small" />
                            <ButtonText>Refreshing...</ButtonText>
                        </>
                    ) : (
                        <>
                            <Icon as={RefreshCw} className="h-4 w-4" />
                            <ButtonText>Refresh</ButtonText>
                        </>
                    )}
                </Button>
            )}
        </Center>
    );
}