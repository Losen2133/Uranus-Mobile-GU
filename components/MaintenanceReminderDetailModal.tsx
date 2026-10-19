import { useOrganization } from "@/hooks/useOrganization";
import { useUserInfo } from "@/hooks/useUserInfo";
import { SensorMaintenanceReminderData } from "@/interfaces/interfaces";
import { deleteSensorMaintenanceReminder } from "@/utils/apiFetch";
import { formatDate, formatDateTime } from "@/utils/stringUtils";
import { useState } from "react";
import { ScrollView } from "react-native";
import useAppToast from "./AppToast";
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "./ui/alert-dialog";
import { Box } from "./ui/box";
import { Button, ButtonText } from "./ui/button";
import { Heading } from "./ui/heading";
import { CloseIcon, Icon } from "./ui/icon";
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from "./ui/modal";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

type MaintenanceReminderDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    userRole: string | null;
    maintenanceReminderData: SensorMaintenanceReminderData | undefined;
    onEdit: (maintenanceReminder: SensorMaintenanceReminderData) => void;
    onAction: () => void | Promise<void>
}

export default function MaintenanceReminderDetailModal ({
    isOpen,
    onClose,
    userRole,
    maintenanceReminderData,
    onEdit,
    onAction
}: MaintenanceReminderDetailModalProps) {
    const { fetchedUserInfo } = useUserInfo();
    const [isDeletingMaintenanceReminder, setIsDeletingMaintenanceReminder] = useState(false);
    const isUserAuthorized = 
        maintenanceReminderData?.added_by === fetchedUserInfo?.id ||
        userRole === "owner" ||
        userRole === "admin";
    const [loading, setLoading] = useState(false);
    const { showToast } = useAppToast();
    const { selectedOrganizationId } = useOrganization();
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    const handleDeleteMaintenanceReminder = async () => {
        if (
            !maintenanceReminderData?.sensor_id ||
            !maintenanceReminderData?.id ||
            selectedOrganizationId == null
        ) {
            return;
        }

        setLoading(true);

        try {
            await deleteSensorMaintenanceReminder(
                selectedOrganizationId,
                maintenanceReminderData.sensor_id,
                maintenanceReminderData.id
            );

            // Close the confirmation dialog
            setIsConfirmingDelete(false);

            // Close the details modal
            onClose();

            await onAction();

            showToast({
                action: "success",
                title: "Maintenance Reminder Deleted Successfully",
                description: "Maintenance Reminder has been successfully deleted.",
            });
        } catch (error) {
            showToast({
                action: "error",
                title: "Maintenance Reminder Failed to Get Deleted",
                description:
                    "Failed to delete maintenance reminder, please try again later.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;

        setIsConfirmingDelete(false);
        onClose();
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
            >
                <ModalBackdrop />
                <ModalContent>
                    <ModalHeader>
                        <Heading size="lg">
                            Reminder Details
                        </Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <Heading size="lg" className="mt-2 text-center mb-3">{maintenanceReminderData?.title}</Heading>
                        <ScrollView className="max-h-100">
                            <VStack space="md">
                                <Box>
                                    <Heading size="sm" className="mb-2">Description</Heading>
                                    <Box className="border-2 border-dashed border-gray-500 rounded p-2">   
                                        <Text>{maintenanceReminderData?.description}</Text>
                                    </Box>
                                </Box>
                                <Box className="mb-4">
                                    <Heading size="sm" className="mb-2">Scheduled At</Heading>
                                    <Box className="border-2 border-dashed border-gray-500 rounded p-2">   
                                        <Text>{formatDateTime(maintenanceReminderData?.scheduled_at)}</Text>
                                    </Box>
                                </Box>
                                <Box>
                                    <Heading size="sm" className="mb-2">Scheduled By</Heading>
                                    <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                        <Text>{maintenanceReminderData?.added_by_name}</Text>
                                    </Box>
                                </Box>
                                <Box>
                                    <Heading size="sm" className="mb-2">Created On</Heading>
                                    <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                        <Text>{formatDate(maintenanceReminderData?.created_at, "short")}</Text>
                                    </Box>
                                </Box>
                            </VStack>
                        </ScrollView>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="outline"
                            onPress={() => {
                                if (maintenanceReminderData) {
                                    onEdit(maintenanceReminderData);
                                }
                            }}
                        >
                            <ButtonText>Edit</ButtonText>
                        </Button>

                        <Button
                            onPress={() => setIsConfirmingDelete(true)}
                            isDisabled={!maintenanceReminderData || loading}
                        >
                            <ButtonText className="text-red-500">
                                Delete
                            </ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <AlertDialog
                isOpen={isConfirmingDelete}
                onClose={() => {
                    if (!loading) {
                        setIsConfirmingDelete(false);
                    }
                }}
            >
                <AlertDialogBackdrop />

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading className="text-foreground font-semibold text-lg">
                            Delete {maintenanceReminderData?.title}?
                        </Heading>
                    </AlertDialogHeader>

                    <AlertDialogBody className="mt-3 mb-4">
                        <Text className="text-sm text-muted-foreground">
                            This will delete the maintenance reminder{" "}
                            {maintenanceReminderData?.title}.
                        </Text>

                        <Text className="text-sm text-red-500 mt-2">
                            This action cannot be undone.
                        </Text>
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button
                            variant="outline"
                            onPress={() => setIsConfirmingDelete(false)}
                            isDisabled={loading}
                        >
                            <ButtonText>Cancel</ButtonText>
                        </Button>

                        <Button
                            onPress={handleDeleteMaintenanceReminder}
                            isDisabled={loading}
                        >
                            <ButtonText>
                                {loading ? "Deleting..." : "Confirm Delete"}
                            </ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}