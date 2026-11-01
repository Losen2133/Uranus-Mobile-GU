
import { useOrganization } from "@/hooks/useOrganization";
import { useUserInfo } from "@/hooks/useUserInfo";
import { SensorMaintenanceReminderData } from "@/interfaces/interfaces";
import {
    deleteSensorMaintenanceReminder,
    updateSensorMaintenanceReminderStatus
} from "@/utils/apiFetch";
import { formatDate, formatDateTime } from "@/utils/stringUtils";
import { useState } from "react";
import { ScrollView } from "react-native";
import useAppToast from "./AppToast";

import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader
} from "./ui/alert-dialog";

import { Box } from "./ui/box";
import { Button, ButtonText } from "./ui/button";
import { Heading } from "./ui/heading";
import { CloseIcon, Icon } from "./ui/icon";

import {
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader
} from "./ui/modal";

import { Picker } from "@react-native-picker/picker";

import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

type ReminderStatus = "pending" | "completed" | "cancelled";

type MaintenanceReminderDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    userRole: string | null;
    maintenanceReminderData: SensorMaintenanceReminderData | undefined;
    onEdit: (maintenanceReminder: SensorMaintenanceReminderData) => void;
    onAction: () => void | Promise<void>;
};

export default function MaintenanceReminderDetailModal({
    isOpen,
    onClose,
    userRole,
    maintenanceReminderData,
    onEdit,
    onAction
}: MaintenanceReminderDetailModalProps) {

    const { fetchedUserInfo } = useUserInfo();
    const { selectedOrganizationId } = useOrganization();
    const { showToast } = useAppToast();

    const [loading, setLoading] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // Status modal states
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] =
        useState<ReminderStatus>("pending");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const isUserAuthorized =
        maintenanceReminderData?.added_by === fetchedUserInfo?.id ||
        userRole === "owner" ||
        userRole === "admin";

    // Update maintenance reminder status
    const handleUpdateStatus = async () => {
        if (
            !maintenanceReminderData?.sensor_id ||
            !maintenanceReminderData?.id ||
            selectedOrganizationId == null
        ) {
            return;
        }

        if (selectedStatus === maintenanceReminderData.status) {
            showToast({
                action: "info",
                title: "No Changes",
                description: "The reminder already has this status."
            });
            return;
        }

        setIsUpdatingStatus(true);

        try {
            await updateSensorMaintenanceReminderStatus(
                selectedOrganizationId,
                maintenanceReminderData.sensor_id,
                maintenanceReminderData.id,
                selectedStatus
            );

            setIsStatusModalOpen(false);

            onClose();

            await onAction();

            showToast({
                action: "success",
                title: "Status Updated",
                description: `Maintenance reminder marked as ${selectedStatus}.`
            });

        } catch (error) {
            showToast({
                action: "error",
                title: "Status Update Failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to update maintenance reminder status."
            });
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // Delete maintenance reminder
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

            setIsConfirmingDelete(false);
            onClose();

            await onAction();

            showToast({
                action: "success",
                title: "Maintenance Reminder Deleted Successfully",
                description: "Maintenance Reminder has been successfully deleted."
            });

        } catch (error) {
            showToast({
                action: "error",
                title: "Maintenance Reminder Failed to Get Deleted",
                description: "Failed to delete maintenance reminder, please try again later."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading || isUpdatingStatus) return;

        setIsConfirmingDelete(false);
        setIsStatusModalOpen(false);
        onClose();
    };

    return (
        <>
            {/* Reminder Details Modal */}
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
                        <Heading size="lg" className="mt-2 text-center mb-3">
                            {maintenanceReminderData?.title}
                        </Heading>

                        <ScrollView className="max-h-100">
                            <VStack space="md">

                                <Box>
                                    <Heading size="sm" className="mb-2">
                                        Description
                                    </Heading>

                                    <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                        <Text>
                                            {maintenanceReminderData?.description}
                                        </Text>
                                    </Box>
                                </Box>

                                <Box className="mb-4">
                                    <Heading size="sm" className="mb-2">
                                        Scheduled At
                                    </Heading>

                                    <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                        <Text>
                                            {formatDateTime(maintenanceReminderData?.scheduled_at)}
                                        </Text>
                                    </Box>
                                </Box>

                                <Box>
                                    <Heading size="sm" className="mb-2">
                                        Scheduled By
                                    </Heading>

                                    <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                        <Text>
                                            {maintenanceReminderData?.added_by_name}
                                        </Text>
                                    </Box>
                                </Box>

                                <Box>
                                    <Heading size="sm" className="mb-2">
                                        Created On
                                    </Heading>

                                    <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                        <Text>
                                            {formatDate(maintenanceReminderData?.created_at, "short")}
                                        </Text>
                                    </Box>
                                </Box>

                                {/* Current Status */}
                                <Box>
                                    <Heading size="sm" className="mb-2">
                                        Current Status
                                    </Heading>

                                    <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                        <Text className="capitalize">
                                            {maintenanceReminderData?.status ?? "pending"}
                                        </Text>
                                    </Box>
                                </Box>

                            </VStack>
                        </ScrollView>
                    </ModalBody>

                    <ModalFooter>
                        {isUserAuthorized && (
                            <>
                                <Button
                                    variant="outline"
                                    onPress={() => {
                                        setSelectedStatus(
                                            maintenanceReminderData?.status as ReminderStatus ?? "pending"
                                        );
                                        setIsStatusModalOpen(true);
                                    }}
                                    isDisabled={!maintenanceReminderData || loading}
                                >
                                    <ButtonText>
                                        Set Status
                                    </ButtonText>
                                </Button>

                                <Button
                                    variant="outline"
                                    onPress={() => {
                                        if (maintenanceReminderData) {
                                            onEdit(maintenanceReminderData);
                                        }
                                    }}
                                    isDisabled={!maintenanceReminderData || loading}
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
                            </>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Set Status Modal */}
            <Modal
                isOpen={isStatusModalOpen}
                onClose={() => {
                    if (!isUpdatingStatus) {
                        setIsStatusModalOpen(false);
                    }
                }}
            >
                <ModalBackdrop />

                <ModalContent>
                    <ModalHeader>
                        <Heading size="lg">
                            Set Reminder Status
                        </Heading>

                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>

                    <ModalBody>
                        <VStack space="md">
                            <Text className="text-sm text-muted-foreground">
                                Select the new status for this maintenance reminder.
                            </Text>

                            <Box className="border border-outline-300 border-white h-13 rounded-md justify-center px-3">
                                <Picker
                                    selectedValue={selectedStatus}
                                    onValueChange={(value) =>
                                        setSelectedStatus(value as ReminderStatus)
                                    }
                                    dropdownIconColor="white"
                                    style={{
                                        color: "white",
                                        marginHorizontal: -10,
                                    }}
                                >
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
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            variant="outline"
                            onPress={() => setIsStatusModalOpen(false)}
                            isDisabled={isUpdatingStatus}
                        >
                            <ButtonText>
                                Cancel
                            </ButtonText>
                        </Button>

                        <Button
                            onPress={handleUpdateStatus}
                            isDisabled={
                                isUpdatingStatus ||
                                selectedStatus === maintenanceReminderData?.status
                            }
                        >
                            <ButtonText>
                                {isUpdatingStatus ? "Updating..." : "Update Status"}
                            </ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Dialog */}
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
    );
}
