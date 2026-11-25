import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { SensorData, SensorDeviceCommandData, SensorDeviceCommandName } from "@/interfaces/interfaces";
import { fetchSensorDeviceCommand, sendSensorDeviceCommand } from "@/utils/apiFetch";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

type Props = {
    visible: boolean;
    organizationId: number;
    sensor: SensorData;
    onClose: () => void;
};

const waterLevelCommands: {
    label: string;
    value: Extract<
        SensorDeviceCommandName,
        "set_publish_interval" | "calibrate_base" | "calibrate_full"
    >;
}[] = [
    { label: "Change reporting interval", value: "set_publish_interval" },
    { label: "Capture empty-tank distance", value: "calibrate_base" },
    { label: "Capture full-tank distance", value: "calibrate_full" },
];

function commandStatusMessage(command: SensorDeviceCommandData): string {
    switch (command.status) {
        case "pending":
            return "Waiting for the device…";
        case "succeeded":
            return "Device confirmed the command.";
        case "timed_out":
            return "The device did not respond. Check its connection before retrying.";
        case "failed":
            return command.response?.message ?? "The device rejected the command.";
    }
}

export default function SensorDeviceCommandsModal({
    visible,
    organizationId,
    sensor,
    onClose,
}: Props) {
    const isWaterLevel = sensor.purpose === "water_level";
    const [command, setCommand] = useState<SensorDeviceCommandName>("request_status");
    const [seconds, setSeconds] = useState("5");
    const [commandResult, setCommandResult] = useState<SensorDeviceCommandData | null>(null);
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!visible || commandResult?.status !== "pending") {
            return;
        }

        let isActive = true;
        let timeout: ReturnType<typeof setTimeout>;

        const poll = async () => {
            try {
                const result = await fetchSensorDeviceCommand(
                    organizationId,
                    sensor.id,
                    commandResult.id,
                );

                if (!isActive) {
                    return;
                }

                setCommandResult(result);
                setError("");

                if (result.status === "pending") {
                    timeout = setTimeout(() => {
                        void poll();
                    }, 2000);
                }
            } catch (pollError) {
                if (!isActive) {
                    return;
                }

                setError(
                    pollError instanceof Error
                        ? pollError.message
                        : "Could not check the command status.",
                );
                timeout = setTimeout(() => {
                    void poll();
                }, 2000);
            }
        };

        timeout = setTimeout(() => {
            void poll();
        }, 2000);

        return () => {
            isActive = false;
            clearTimeout(timeout);
        };
    }, [commandResult?.id, commandResult?.status, organizationId, sensor.id, visible]);

    const executeCommand = async () => {
        setSending(true);
        setError("");
        setCommandResult(null);

        try {
            const parameters: { seconds?: number } = {};

            if (command === "set_publish_interval") {
                const interval = Number(seconds);
                if (!Number.isInteger(interval) || interval < 1 || interval > 86400) {
                    setError("Enter a reporting interval between 1 and 86400 seconds.");
                    return;
                }
                parameters.seconds = interval;
            }

            const result = await sendSensorDeviceCommand(
                organizationId,
                sensor.id,
                command,
                parameters,
            );
            setCommandResult(result);
        } catch (sendError) {
            setError(
                sendError instanceof Error
                    ? sendError.message
                    : "Could not send the device command.",
            );
        } finally {
            setSending(false);
        }
    };

    const handleSend = () => {
        if (command !== "factory_reset") {
            void executeCommand();
            return;
        }

        Alert.alert(
            "Factory reset device?",
            "This erases the device's Wi-Fi and enrollment settings. Physical setup will be required.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: () => {
                        void executeCommand();
                    },
                },
            ],
        );
    };

    const isPending = commandResult?.status === "pending";

    return (
        <AlertDialog isOpen={visible} onClose={onClose}>
            <AlertDialogBackdrop />
            <AlertDialogContent>
                <AlertDialogHeader>
                    <Heading className="text-foreground font-semibold text-lg">
                        Device Commands
                    </Heading>
                </AlertDialogHeader>
                <AlertDialogBody className="mt-3 mb-4">
                    <VStack space="md">
                        <Text className="text-sm text-muted-foreground">
                            {sensor.name}
                        </Text>
                        <Box className="border border-outline-300 border-white rounded-md h-12 justify-center px-3">
                            <Picker
                                selectedValue={command}
                                onValueChange={(value) => setCommand(value as SensorDeviceCommandName)}
                                enabled={!sending && !isPending}
                                dropdownIconColor="white"
                                style={{
                                    color: "white",
                                    marginHorizontal: -10,
                                }}
                            >
                                <Picker.Item label="Request status" value="request_status" />
                                <Picker.Item label="Restart" value="restart" />
                                {isWaterLevel
                                    ? waterLevelCommands.map(({ label, value }) => (
                                        <Picker.Item key={value} label={label} value={value} />
                                    ))
                                    : null}
                                <Picker.Item label="Factory reset" value="factory_reset" />
                            </Picker>
                        </Box>
                        {command === "set_publish_interval" && (
                            <VStack space="xs">
                                <Text className="text-sm text-foreground">
                                    Seconds between readings
                                </Text>
                                <Input isDisabled={sending || isPending}>
                                    <InputField
                                        keyboardType="number-pad"
                                        value={seconds}
                                        onChangeText={setSeconds}
                                    />
                                </Input>
                            </VStack>
                        )}
                        {commandResult && (
                            <Text
                                className={`text-sm ${
                                    commandResult.status === "failed" || commandResult.status === "timed_out"
                                        ? "text-red-500"
                                        : "text-foreground"
                                }`}
                            >
                                {commandStatusMessage(commandResult)}
                            </Text>
                        )}
                        {error ? (
                            <Text className="text-sm text-red-500">{error}</Text>
                        ) : null}
                    </VStack>
                </AlertDialogBody>
                <AlertDialogFooter>
                    <Button variant="outline" onPress={onClose} isDisabled={sending}>
                        <ButtonText>Close</ButtonText>
                    </Button>
                    <Button onPress={handleSend} isDisabled={sending || isPending}>
                        <ButtonText>
                            {sending ? "Sending…" : "Send command"}
                        </ButtonText>
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
