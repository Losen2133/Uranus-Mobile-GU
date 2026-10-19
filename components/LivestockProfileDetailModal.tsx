
import useAppToast from "@/components/AppToast";
import { LivestockProfileData } from "@/interfaces/interfaces";
import { deleteLivestockProfile } from "@/utils/apiFetch";
import { formatDate } from "@/utils/stringUtils";
import { useState } from "react";
import { ScrollView } from "react-native";

import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { CloseIcon, Icon } from "@/components/ui/icon";
import {
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

type LivestockProfileDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    profileData: LivestockProfileData | undefined;
    organizationId: number | null;
    onEdit: (profile: LivestockProfileData) => void;
    onAction: () => void | Promise<void>;
};

export default function LivestockProfileDetailModal({
    isOpen,
    onClose,
    profileData,
    organizationId,
    onEdit,
    onAction,
}: LivestockProfileDetailModalProps) {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showToast } = useAppToast();

    const handleDeleteProfile = async () => {
        if (!profileData?.id || !organizationId) {
            showToast({
                action: "error",
                title: "Unable to Delete Profile",
                description: "The livestock profile or organization could not be identified.",
            });
            return;
        }

        setLoading(true);

        try {
            await deleteLivestockProfile(
                profileData.id,
                organizationId
            );

            setIsConfirmingDelete(false);
            onClose();

            await onAction();

            showToast({
                action: "success",
                title: "Profile Deleted Successfully",
                description: `${profileData.species_name} has been deleted.`,
            });
        } catch (error) {
            console.error("Failed to delete livestock profile:", error);

            setIsConfirmingDelete(false);

            showToast({
                action: "error",
                title: "Failed to Delete Profile",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete the livestock profile. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;

        setIsConfirmingDelete(false);
        onClose();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose}>
                <ModalBackdrop />

                <ModalContent>
                    <ModalHeader>
                        <Heading size="lg">
                            Livestock Profile
                        </Heading>

                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>

                    <ModalBody>
                        {!profileData ? (
                            <Center className="p-6">
                                <Text>No livestock profile selected.</Text>
                            </Center>
                        ) : (
                            <ScrollView className="max-h-96">
                                <VStack space="md">
                                    <Center className="py-3">
                                        <Heading
                                            size="xl"
                                            className="text-center"
                                        >
                                            {profileData.species_name}
                                        </Heading>

                                        <Text className="text-foreground/70 mt-1">
                                            {profileData.type.toUpperCase()}
                                        </Text>
                                    </Center>

                                    <Box>
                                        <Heading size="sm" className="mb-2">
                                            Description
                                        </Heading>

                                        <Box className="border-2 border-dashed border-gray-500 rounded p-3">
                                            <Text>
                                                {profileData.description?.trim()
                                                    || "No description available."}
                                            </Text>
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Heading size="sm" className="mb-2">
                                            Type
                                        </Heading>

                                        <Box className="border-2 border-dashed border-gray-500 rounded p-3">
                                            <Text>{profileData.type}</Text>
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Heading size="sm" className="mb-2">
                                            Created On
                                        </Heading>

                                        <Box className="border-2 border-dashed border-gray-500 rounded p-3">
                                            <Text>
                                                {formatDate(
                                                    profileData.created_at,
                                                    "short"
                                                )}
                                            </Text>
                                        </Box>
                                    </Box>
                                </VStack>
                            </ScrollView>
                        )}
                    </ModalBody>

                    <ModalFooter className="gap-2">
                        {/* <Button
                            variant="outline"
                            onPress={handleClose}
                            isDisabled={loading}
                        >
                            <ButtonText>Close</ButtonText>
                        </Button> */}

                        <Button
                            variant="outline"
                            onPress={() => {
                                if (profileData) {
                                    onEdit(profileData);
                                }
                            }}
                            isDisabled={!profileData || loading}
                        >
                            <ButtonText>Edit</ButtonText>
                        </Button>

                        <Button
                            onPress={() => setIsConfirmingDelete(true)}
                            isDisabled={!profileData || loading}
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
                            Delete {profileData?.species_name}?
                        </Heading>
                    </AlertDialogHeader>

                    <AlertDialogBody className="mt-3 mb-4">
                        <Text className="text-sm text-muted-foreground">
                            This will delete the livestock profile{" "}
                            {profileData?.species_name}.
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
                            onPress={handleDeleteProfile}
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
