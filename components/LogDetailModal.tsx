import { useUserInfo } from "@/hooks/useUserInfo";
import { LivestockLogData, UserOrgRoleResponse } from "@/interfaces/interfaces";
import { deleteLivestockLog } from "@/utils/apiFetch";
import { formatDate } from "@/utils/stringUtils";
import { useState } from "react";
import { ScrollView } from "react-native";
import useAppToast from "./AppToast";
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "./ui/alert-dialog";
import { Box } from "./ui/box";
import { Button, ButtonText } from "./ui/button";
import { Center } from "./ui/center";
import { Heading } from "./ui/heading";
import { CloseIcon, Icon } from "./ui/icon";
import { Image } from "./ui/image";
import { ImageViewer, ImageViewerCloseButton, ImageViewerContent, ImageViewerTrigger } from "./ui/image-viewer";
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from "./ui/modal";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

type LogDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    userRole: UserOrgRoleResponse | undefined;
    logData: LivestockLogData | undefined;
    onAction: () => void | Promise<void>;
}

export default function LogDetailModal ({
    isOpen,
    onClose,
    userRole,
    logData,
    onAction
}: LogDetailModalProps) {
    const { fetchedUserInfo } = useUserInfo();
    const [isDeletingLog, setIsDeletingLog] = useState(false);
    const isUserAuthorized =
        logData?.recorded_by.id === fetchedUserInfo?.id ||
        userRole?.data?.role === "owner" ||
        userRole?.data?.role === "admin";
    const [loading, setLoading] = useState(false);
    const { showToast } = useAppToast();  
    
    const handleDeleteLog = async () => {
        if (!logData?.livestock_id || !logData?.id) {
            return;
        }

        setLoading(true);

        try {
            await deleteLivestockLog(
                logData.livestock_id,
                logData.id
            );

            setIsDeletingLog(false);
            onClose();

            await onAction();

            showToast({
                action: "success",
                title: "Log Deleted Successfully",
                description: "Log has been successfully deleted.",
            });
        } catch (error) {
            // const message =
            //     error instanceof Error
            //         ? error.message
            //         : "Failed to delete log";

            setIsDeletingLog(false);
            onClose();

            showToast({
                action: "error",
                title: "Log Failed to Get Deleted",
                description: "Failed to delete log, please try again later",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalBackdrop />
                <ModalContent>
                    <ModalHeader>
                        <Heading size="lg">
                            Log Details
                        </Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        {logData?.type === "log" && (
                            <>
                                <Heading size="lg" className="mt-2 text-center mb-3">{logData.data.title}</Heading>
                                
                                <ScrollView className="max-h-100">
                                    <Center className=" mb-3">
                                        {logData.image_url ? (
                                            <ImageViewer
                                                images={[
                                                    {
                                                        url: logData.image_url,
                                                        alt: logData.data.title ?? "Log image",
                                                    },
                                                ]}
                                            >
                                                <ImageViewerTrigger>
                                                    <Center>
                                                        <Image
                                                            source={{ uri: logData.image_url }}
                                                            alt={logData.data.title ?? "Log image"}
                                                            className="border-3 border-white rounded"
                                                            resizeMode="cover"
                                                            size="xl"
                                                        />
                                                    </Center>
                                                </ImageViewerTrigger>

                                                <ImageViewerContent>
                                                    <ImageViewerCloseButton />
                                                </ImageViewerContent>
                                            </ImageViewer>
                                        ) : (
                                            <Center className="bg-gray-200 rounded border-3 border-white w-32 h-32">
                                                <Text className="text-gray-500 text-center">
                                                    No image available
                                                </Text>
                                            </Center>
                                        )}
                                    </Center>
                                    <VStack space="md">
                                        <Box className="mb-4">
                                            <Heading size="sm" className="mb-2">Description</Heading>
                                            <Box className="border-2 border-dashed border-gray-500 rounded p-2">   
                                                <Text>{logData.data.description}</Text>
                                            </Box>
                                        </Box>

                                        <Box>
                                            <Heading size="sm" className="mb-2">Recorded By</Heading>
                                            <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                                <Text>{logData.recorded_by.name}</Text>
                                            </Box>
                                        </Box>
                                        
                                        <Box>
                                            <Heading size="sm" className="mb-2">Recorded On</Heading>
                                            <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                                <Text>{formatDate(logData.created_at, "short")}</Text>
                                            </Box>
                                        </Box>
                                    </VStack>
                                </ScrollView>
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onPress={() => setIsDeletingLog(true)} isDisabled={!isUserAuthorized || loading}>
                            <ButtonText className="text-red-500">Delete</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <AlertDialog
                isOpen={isDeletingLog}
                onClose={() => setIsDeletingLog(false)}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading className="text-foreground font-semibold text-lg">
                            Deleting {logData?.data.title}
                        </Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-3 mb-4">
                        <Text className="text-sm text-muted-foreground">
                            Confirming this will delete the log {logData?.data.title}.
                        </Text>
                        <Text className="text-sm text-muted-foreground text-red-500">
                            This action cannot be undone.
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button variant="outline" onPress={() => setIsDeletingLog(false)}>
                            <ButtonText>Cancel</ButtonText>
                        </Button>
                        <Button
                            isDisabled={loading}
                            onPress={handleDeleteLog}
                        >
                            <ButtonText>Confirm</ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

