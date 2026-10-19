import useAppToast from "@/components/AppToast";
import {
    dateTimePicker,
    maintenanceReminderDescriptionField,
    maintenanceReminderStatusField,
    maintenanceReminderTitleField,
} from "@/components/FormFields";
import SkeletonLoading from "@/components/SkeletonLoading";
import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useOrganization } from "@/hooks/useOrganization";
import { SensorMaintenanceReminderData } from "@/interfaces/interfaces";
import {
    createSensorMaintenanceReminder,
    fetchIndividualSensorMaintenanceReminder,
    updateSensorMaintenanceReminder,
} from "@/utils/apiFetch";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

export default function MaintenanceReminderFormPage() {
    const { sensorId, reminderId } = useLocalSearchParams<{
        sensorId: string;
        reminderId?: string;
    }>();

    const parsedSensorId = Number(sensorId);
    const selectedSensorId =
        sensorId && Number.isInteger(parsedSensorId) && parsedSensorId > 0
            ? parsedSensorId
            : undefined;

    const parsedReminderId = Number(reminderId);
    const toEditReminderId =
        reminderId &&
        Number.isInteger(parsedReminderId) &&
        parsedReminderId > 0
            ? parsedReminderId
            : undefined;

    const isEditMode = !!toEditReminderId;

    const { selectedOrganizationId } = useOrganization();
    const router = useRouter();
    const { showToast } = useAppToast();

    const [toEditReminder, setToEditReminder] =
        useState<SensorMaintenanceReminderData>();

    const [loading, setLoading] = useState(isEditMode);

    const [title, setTitle] = useState("");
    const [isInvalidTitle, setIsInvalidTitle] = useState(false);

    const [description, setDescription] = useState("");
    const [isInvalidDescription, setIsInvalidDescription] = useState(false);

    const [scheduledAt, setScheduledAt] = useState<Date | undefined>();
    const [isInvalidScheduledAt, setIsInvalidScheduledAt] = useState(false);

    const [isReminderAction, setIsReminderAction] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [status, setStatus] = useState<'pending' | 'completed' | 'cancelled' | undefined>();
    const [isInvalidStatus, setIsInvalidStatus] = useState(false);

    // Fetch the reminder when editing.
    const handleFetchReminder = useCallback(async () => {
        if (
            !selectedOrganizationId ||
            !selectedSensorId ||
            !toEditReminderId
        ) {
            return;
        }

        try {
            await fetchIndividualSensorMaintenanceReminder(
                selectedOrganizationId,
                selectedSensorId,
                toEditReminderId,
                setToEditReminder
            )
        } catch (error) {
            showToast({
                action: "error",
                title: "Failed to Fetch Maintenance Reminder",
                description:
                    "Failed to fetch the reminder, please try again later.",
            });
        }
    }, [
        selectedOrganizationId,
        selectedSensorId,
        toEditReminderId,
        showToast,
    ]);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchData = async () => {
                if (!isEditMode) {
                    setLoading(false);
                    return;
                }

                setLoading(true);

                try {
                    await handleFetchReminder();
                } finally {
                    if (isActive) {
                        setLoading(false);
                    }
                }
            };

            if (selectedOrganizationId && selectedSensorId) {
                fetchData();
            } else {
                setLoading(false);
            }

            return () => {
                isActive = false;
            };
        }, [
            handleFetchReminder,
            isEditMode,
            selectedOrganizationId,
            selectedSensorId,
        ])
    );

    // Populate the form when the reminder has been fetched.
    useEffect(() => {
        if (!toEditReminder) {
            return;
        }

        setTitle(toEditReminder.title ?? "");
        setDescription(toEditReminder.description ?? "");
        setStatus(toEditReminder.status);

        const parsedDate = new Date(toEditReminder.scheduled_at);

        setScheduledAt(
            Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate
        );
    }, [toEditReminder]);

    const isOriginalScheduledAt = () => {
        if (!isEditMode || !toEditReminder || !scheduledAt) {
            return false;
        }

        const originalDate = new Date(toEditReminder.scheduled_at);

        return (
            !Number.isNaN(originalDate.getTime()) &&
            scheduledAt.getTime() === originalDate.getTime()
        );
    };

    const everythingIsOk = () => {
        let valid = true;

        setIsInvalidTitle(false);
        setIsInvalidDescription(false);
        setIsInvalidScheduledAt(false);
        setIsInvalidStatus(false);

        if (!title.trim()) {
            setIsInvalidTitle(true);
            valid = false;
        }

        if (
            !scheduledAt ||
            Number.isNaN(scheduledAt.getTime()) ||
            (scheduledAt <= new Date() && !isOriginalScheduledAt())
        ) {
            setIsInvalidScheduledAt(true);
            valid = false;
        }

        if (isEditMode && !status) {
            setIsInvalidStatus(true);
            valid = false;
        }

        return valid;
    };


    const hasFormChanges = () => {
        if (!toEditReminder || !scheduledAt) {
            return false;
        }

        const originalScheduledAt = new Date(
            toEditReminder.scheduled_at
        );

        return (
            title !== (toEditReminder.title ?? "") ||
            description !== (toEditReminder.description ?? "") ||
            scheduledAt.getTime() !== originalScheduledAt.getTime() ||
            status !== toEditReminder.status
        );
    };

    const hasChanges = hasFormChanges();

    
    const isFormComplete =
        title.trim().length > 0 &&
        scheduledAt instanceof Date &&
        !Number.isNaN(scheduledAt.getTime()) &&
        (scheduledAt.getTime() > Date.now() || isOriginalScheduledAt());


    const handleSubmit = () => {
        if (!everythingIsOk()) {
            return;
        }

        if (isEditMode && !hasChanges) {
            showToast({
                action: "info",
                title: "No Changes",
                description: "There are no changes to save.",
            });
            return;
        }

        setIsReminderAction(true);
    };

    const handleCreateReminder = async () => {
        if (
            !selectedOrganizationId ||
            !selectedSensorId ||
            !scheduledAt
        ) {
            return;
        }

        setIsSubmitting(true);

        try {
            await createSensorMaintenanceReminder(
                selectedOrganizationId,
                selectedSensorId,
                title.trim(),
                description.trim(),
                scheduledAt
            );

            setIsReminderAction(false);

            showToast({
                action: "success",
                title: "Maintenance Reminder Created",
                description: `${title.trim()} was created successfully.`,
            });

            router.back();
        } catch (error) {
            showToast({
                action: "error",
                title: "Maintenance Reminder Creation Failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to create the maintenance reminder, please try again later.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateReminder = async () => {
        if (
            !selectedOrganizationId ||
            !selectedSensorId ||
            !toEditReminderId ||
            !scheduledAt
        ) {
            return;
        }

        setIsSubmitting(true);

        try {
            await updateSensorMaintenanceReminder(
                selectedOrganizationId,
                selectedSensorId,
                toEditReminderId,
                title.trim(),
                description.trim(),
                scheduledAt,
                status ?? "pending"
            );

            setIsReminderAction(false);

            showToast({
                action: "success",
                title: "Maintenance Reminder Updated",
                description: `${title.trim()} was updated successfully.`,
            });

            router.back();
        } catch (error) {
            showToast({
                action: "error",
                title: "Maintenance Reminder Update Failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to update the maintenance reminder, please try again later.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {isEditMode && loading ? (
                    <SkeletonLoading skeletonVariant="store" />
                ) : isEditMode && !toEditReminder ? (
                    <VStack className="flex-1 p-5" space="md">
                        <Text>
                            The maintenance reminder could not be loaded.
                        </Text>

                        <Button onPress={() => router.back()}>
                            <ButtonText>Go Back</ButtonText>
                        </Button>
                    </VStack>
                ) : (
                    <ScrollView
                        className="mb-12"
                        keyboardShouldPersistTaps="handled"
                    >
                        <VStack className="flex-1 p-5" space="md">
                            {maintenanceReminderTitleField(
                                title,
                                setTitle,
                                isInvalidTitle
                            )}

                            <Divider />

                            {maintenanceReminderDescriptionField(
                                description,
                                setDescription,
                                isInvalidDescription
                            )}

                            {isEditMode && (
                                <>
                                    <Divider />

                                    {maintenanceReminderStatusField(
                                        status,
                                        setStatus
                                    )}
                                </>
                            )}

                            <Divider />

                            {dateTimePicker(
                                scheduledAt,
                                setScheduledAt
                            )}

                            <Text className="text-sm text-muted-foreground">
                                Please select a date and time in the future.
                            </Text>

                            {isInvalidScheduledAt && (
                                <Text className="text-error-500">
                                    Please select a valid date and time in the future.
                                </Text>
                            )}

                            <Button
                                onPress={handleSubmit}
                                isDisabled={
                                    !isFormComplete ||
                                    isSubmitting ||
                                    (isEditMode && !hasChanges)
                                }
                            >
                                <ButtonText>
                                    {isEditMode ? "Save Edit" : "Create Reminder"}
                                </ButtonText>
                            </Button>
                        </VStack>
                    </ScrollView>
                )}
            </KeyboardAvoidingView>

            <AlertDialog
                isOpen={isReminderAction}
                onClose={() => {
                    if (!isSubmitting) {
                        setIsReminderAction(false);
                    }
                }}
            >
                <AlertDialogBackdrop />

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading className="text-foreground font-semibold text-lg">
                            {isEditMode
                                ? "Confirm Reminder Edit"
                                : "Confirm Reminder Creation"}
                        </Heading>
                    </AlertDialogHeader>

                    <AlertDialogBody className="mt-3 mb-4">
                        <Text className="text-sm text-muted-foreground">
                            {isEditMode
                                ? "Are you sure you want to save the changes to this maintenance reminder?"
                                : "Are you sure you want to create this maintenance reminder?"}
                        </Text>
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button
                            variant="outline"
                            onPress={() => setIsReminderAction(false)}
                            isDisabled={isSubmitting}
                        >
                            <ButtonText>Cancel</ButtonText>
                        </Button>

                        <Button
                            onPress={() => {
                                console.log("Pressed Confirm")
                                if (isEditMode) {
                                    handleUpdateReminder();
                                } else {
                                    handleCreateReminder();
                                }
                            }}
                            isDisabled={isSubmitting}
                        >
                            <ButtonText>
                                {isSubmitting ? "Saving..." : "Confirm"}
                            </ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}