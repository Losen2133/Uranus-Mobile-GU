import useAppToast from "@/components/AppToast";
import { concernSeverityPickerField, imageField, imagePickerModal, logDescriptionField, logTitleField, logTypeField } from "@/components/FormFields";
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { createLivestockLog } from "@/utils/apiFetch";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

export default function LivestockLogFormPage() {
    const { livestockId } = useLocalSearchParams<{ livestockId: string }>();
    const selectedLivestockId = Number(livestockId);
    const [logType, setLogType] = useState<"log" | "concern">();
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
    const [logTitle, setLogTitle] = useState<string>('');
    const [isInvalidLogTitle, setIsInvalidLogTitle] = useState(false);
    const [logDescription, setLogDescription] = useState<string>('');
    const [isInvalidLogDescription, setIsInvalidLogDescription] = useState(false);
    const [concernSeverity, setConcernSeverity] = useState<"low" | "moderate" | "high" | "critical">()
    const [isCreatingLog, setIsCreatingLog] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showToast } = useAppToast();
    const router = useRouter();

    const handleCreateLivestockLog = async () => {
        if (!logType) {
            return;
        }

        setLoading(true);

        try {
            if (logType === "log") {
                await createLivestockLog({
                    logType: "log",
                    selectedLivestockId,
                    image,
                    logTitle,
                    logDescription,
                });

                showToast({
                    action: "success",
                    title: "Log Created",
                    description: `${logTitle}, created successfully`,
                });
            } else {
                await createLivestockLog({
                    logType: "concern",
                    concernSeverity,
                    selectedLivestockId,
                    image,
                    logTitle,
                    logDescription,
                });

                showToast({
                    action: "success",
                    title: "Concern Created",
                    description: `${logTitle}, created successfully`,
                });
            }

            setIsCreatingLog(false);

            router.back();
        } catch (error) {
            showToast({
                action: "error",
                title: "Log Creation Failed",
                description: `Failed to create ${logType === 'log' ? "log" : "concern"}, please try again later.`
            });

            setIsCreatingLog(false);

            router.back();
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const takePhoto = async () => {
        const permission =
            await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const everythingIsOk = () => {
        let valid = true;

        setIsInvalidLogTitle(false);
        setIsInvalidLogDescription(false);

        if(!logTitle.trim()) {
            setIsInvalidLogTitle(true);
            valid = false;
        }

        if(!logDescription?.trim()) {
            setIsInvalidLogDescription(false);
            valid = false;
        }

        return valid;
    }

    const handleSubmit = () => {
        if (!everythingIsOk()) {
            return;
        }

        setIsCreatingLog(true);
    }

    const isFormComplete =
        logType !== undefined &&
        logTitle.trim().length > 0 &&
        logDescription.trim().length > 0 &&
        (
            logType === "log" ||
            (logType === "concern" && concernSeverity !== undefined)
        );
    
    return (
        <>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView className="mb-12">
                    <VStack className="flex-1 p-5"
                        space="md"
                    >
                        {logTypeField(logType, setLogType)}
                        <Divider />
                        {logType && (
                            <>
                                {imageField(image?.uri ?? null, setIsImagePickerOpen, "Log Image")}
                                <Divider />
                                {logTitleField(logTitle, setLogTitle, isInvalidLogTitle)}
                                {logDescriptionField(logDescription, setLogDescription, isInvalidLogDescription)}
                                {logType === "concern" && (
                                    <>
                                        <Divider />
                                        {concernSeverityPickerField(concernSeverity, setConcernSeverity)}
                                    </>
                                )}
                                <Button
                                    onPress={handleSubmit}
                                    isDisabled={!isFormComplete}
                                >
                                    <ButtonText>Create {logType === "log" ? "Log" : "Concern"}</ButtonText>
                                </Button>
                            </>
                        )}
                    </VStack>
                </ScrollView>
            </KeyboardAvoidingView>
            {imagePickerModal(
                isImagePickerOpen,
                setIsImagePickerOpen,
                takePhoto,
                pickImage
            )}
            <AlertDialog
                isOpen={isCreatingLog}
                onClose={() => setIsCreatingLog(false)}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading className="text-foreground font-semibold text-lg">
                            Create New Log?
                        </Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-3 mb-4">
                        <Text className="text-sm text-muted-foreground">
                            Confirming this will create {logTitle} and edits on this livestock will not be permitted after creation.
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button variant="outline" onPress={() => setIsCreatingLog(false)}>
                            <ButtonText>Cancel</ButtonText>
                        </Button>
                        <Button
                            onPress={handleCreateLivestockLog}
                            isDisabled={loading}
                        >
                            <ButtonText>Confirm</ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}