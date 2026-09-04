import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useUserSettings } from "@/hooks/useUserSettings";
import { UserSettings } from "@/interfaces/interfaces";
import { fetchUserSettings, updateUserSettings } from "@/utils/apiFetch";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useNavigation } from "expo-router";
import { usePreventRemove } from "expo-router/build/react-navigation";
import { RotateCcw, Save } from "lucide-react-native";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

export default function SettingsScreen() {
    const {
        fetchedUserSettings,
        setFetchedUserSettings
    } = useUserSettings();

    // The settings currently being edited
    const [modifiedSettings, setModifiedSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [pendingAction, setPendingAction] = useState<any>(null);
    const [confirmRedo, setConfirmRedo] = useState(false);
    const [confirmChanges, setConfirmChanges] = useState(false);
    const navigation = useNavigation();

    const hasChanges =
        JSON.stringify(fetchedUserSettings) !==
        JSON.stringify(modifiedSettings) || false;

    usePreventRemove(
        hasChanges,
        ({ data }) => {
            setPendingAction(data.action);
            setConfirmLeave(true);
        }
    );

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                hasChanges ? (
                    <>
                        <Button
                            className="h-8 w-8 rounded-full p-0 mr-2"
                            onPress={() => setConfirmRedo(true)}
                        >
                            <ButtonIcon as={RotateCcw} className="h-5 w-5" />
                        </Button>
                        <Button
                            className="h-8 w-8 rounded-full p-0"
                            onPress={() => setConfirmChanges(true)}
                        >
                            <ButtonIcon as={Save} className="h-5 w-5" />
                        </Button>
                    </>
                ) : null,       
        });
    })

    // Fetch settings whenever the screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchUserSettings(
                setLoading,
                setError,
                setFetchedUserSettings
            );
        }, [])
    );

    useEffect(() => {
        if (fetchedUserSettings) {
            setModifiedSettings({
                ...fetchedUserSettings
            });
        }
    }, [fetchedUserSettings]);

    return (
        <>
            <VStack
                className="flex-1 p-5"
                space="md"
            >
                <HStack
                    className="justify-between items-center"
                    space="md"
                >
                    <VStack
                        className="flex-1"
                        space="xs"
                    >
                        <Text className="text-lg font-bold">
                            Unit of Temperature
                        </Text>

                        <Text className="text-sm text-muted-foreground">
                            Determines the unit used for displaying temperature values.
                        </Text>
                    </VStack>

                    <Box className="border border-white p-1 h-10 items-center justify-center rounded-md">
                        <Picker
                            selectedValue={modifiedSettings?.temp_unit}
                            onValueChange={(value) => {
                                setModifiedSettings((prev) => {
                                    if (!prev) return prev;

                                    return {
                                        ...prev,
                                        temp_unit: value
                                    };
                                });
                            }}
                            dropdownIconColor="white"
                            style={{
                                color: "white",
                                marginHorizontal: -10,
                                width: 150
                            }}
                        >
                            <Picker.Item
                                label="Celcius"
                                value="celcius"
                            />

                            <Picker.Item
                                label="Fahrenheit"
                                value="fahrenheit"
                            />

                            <Picker.Item
                                label="Kelvin"
                                value="kelvin"
                            />
                        </Picker>
                    </Box>
                    
                </HStack>
                {hasChanges && (
                    <Center>
                        <Text className="text-red-500">
                            You have unsaved changes.
                        </Text>
                    </Center>
                )}
            </VStack>
            <AlertDialog
                isOpen={confirmRedo}
                onClose={() => setConfirmRedo(false)}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading className="text-foreground font-semibold text-lg">
                            Undo Changes?
                        </Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-3 mb-4">
                        <Text className="text-sm text-muted-foreground">
                            Confirming this will undo every changes done.
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button variant="outline" onPress={() => setConfirmRedo(false)}>
                            <ButtonText>Cancel</ButtonText>
                        </Button>
                        <Button onPress={() => {
                            setModifiedSettings(fetchedUserSettings);
                            setConfirmRedo(false);
                        }}>
                            <ButtonText>Undo</ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog
                isOpen={confirmChanges}
                onClose={() => setConfirmChanges(false)}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading className="text-foreground font-semibold text-lg">
                            Save Changes?
                        </Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-3 mb-4">
                        <Text className="text-sm text-muted-foreground">
                            Confirming this will save every changes done.
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button variant="outline" onPress={() => setConfirmChanges(false)}>
                            <ButtonText>Cancel</ButtonText>
                        </Button>
                        <Button
                            onPress={async () => {
                                if (!modifiedSettings) {
                                    return;
                                }

                                try {
                                    const updatedSettings = await updateUserSettings(
                                        modifiedSettings
                                    );

                                    // console.log("Updated settings:", updatedSettings);

                                    setFetchedUserSettings(updatedSettings);
                                    setModifiedSettings(updatedSettings);

                                    setConfirmChanges(false);
                                } catch (error) {
                                    console.error("Failed to save settings:", error);
                                }
                            }}
                        >
                            <ButtonText>Save</ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog
                isOpen={confirmLeave}
                onClose={() => setConfirmLeave(false)}
            >
                <AlertDialogBackdrop />

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading className="text-foreground font-semibold text-lg">
                            Unsaved Changes
                        </Heading>
                    </AlertDialogHeader>

                    <AlertDialogBody className="mt-3 mb-4">
                        <Text className="text-sm text-muted-foreground">
                            You have unsaved changes. Are you sure you want to leave?
                            Your changes will be lost.
                        </Text>
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button
                            variant="outline"
                            onPress={() => {
                                setConfirmLeave(false);
                                setPendingAction(null);
                            }}
                        >
                            <ButtonText>Stay</ButtonText>
                        </Button>

                        <Button
                            onPress={() => {
                                setConfirmLeave(false);

                                if (pendingAction) {
                                    navigation.dispatch(pendingAction);
                                }

                                setPendingAction(null);
                            }}
                        >
                            <ButtonText>Leave</ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}