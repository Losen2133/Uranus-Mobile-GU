import { LivestockLogData } from "@/interfaces/interfaces";
import { capitalize, formatDate } from "@/utils/stringUtils";
import { useState } from "react";
import { ScrollView } from "react-native";
import ConcernResolutionModal from "./ConcernResolutionModal";
import { Box } from "./ui/box";
import { Button, ButtonText } from "./ui/button";
import { Center } from "./ui/center";
import { Divider } from "./ui/divider";
import { Heading } from "./ui/heading";
import { CloseIcon, Icon } from "./ui/icon";
import { Image } from "./ui/image";
import { ImageViewer, ImageViewerCloseButton, ImageViewerContent, ImageViewerTrigger } from "./ui/image-viewer";
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from "./ui/modal";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

type ConcernDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    logData: LivestockLogData | undefined
    severityColor: string | undefined;
    livestockId: number
    onResolution: () => void | Promise<void>;
}

export default function ConcernDetailModal ({
    isOpen,
    onClose,
    logData,
    severityColor,
    livestockId,
    onResolution
}: ConcernDetailModalProps) {
    const [isResolving, setIsResolving] = useState(false);

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
                            Concern Details
                        </Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        {logData?.type === "concern" ? (
                            <>
                                <Heading size="lg" className="mt-2 text-center mb-3">{logData.data.title}</Heading>
                                <ScrollView className="h-100">
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
                                        <Box>
                                            <Heading size="sm">Description</Heading>
                                            <Box className="border-2 border-dashed border-gray-500 rounded p-2">   
                                                <Text>{logData.data.description}</Text>
                                            </Box>
                                        </Box>

                                        <Box>
                                            <Heading size="sm">Severity</Heading>
                                            <Box className="border-2 border-dashed border-gray-500 rounded p-2">   
                                                <Text className={`text-sm font-semibold mt-1 ${severityColor}`}>{capitalize(logData.data.severity)}</Text>
                                            </Box>
                                        </Box>

                                        <Box className="mb-4">
                                            <Heading size="sm">Status</Heading>
                                            <Box className="border-2 border-dashed border-gray-500 rounded p-2">   
                                                <Text>{capitalize(logData.data.status)}</Text>
                                            </Box>
                                        </Box>

                                        <Box>
                                            <Heading size="sm">Recorded By</Heading>
                                            <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                                <Text>{logData.recorded_by.name}</Text>
                                            </Box>
                                        </Box>
                                        
                                        <Box>
                                            <Heading size="sm">Recorded On</Heading>
                                            <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                                <Text>{formatDate(logData.created_at, "short")}</Text>
                                            </Box>
                                        </Box>

                                        {logData.resolved_by && logData.data.status === "closed" && (
                                            <>
                                                <Divider />

                                                <Heading size="lg" className="text-center">Resolution</Heading>

                                                <Box className="mb-4">
                                                    <Heading size="sm">Action Taken</Heading>
                                                    <Box className="border-2 border-dashed border-gray-500 rounded p-2">   
                                                        <Text>{logData.data.action_taken}</Text>
                                                    </Box>
                                                </Box>

                                                <Box>
                                                    <Heading size="sm">Resolved By</Heading>
                                                    <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                                        <Text>{logData.resolved_by.name}</Text>
                                                    </Box>
                                                </Box>

                                                <Box>
                                                    <Heading size="sm">Resolved On</Heading>
                                                    <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                                        <Text>{formatDate(logData.updated_at, "short")}</Text>
                                                    </Box>
                                                </Box>
                                            </>
                                        )}
                                    </VStack>
                                </ScrollView>
                            </>
                        ) : (
                            <Center className="bg-gray-200 rounded border-3 border-white w-32 h-32">
                                <Text className="text-gray-500 text-center">
                                    No image available
                                </Text>
                            </Center>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        {logData?.type === "concern" && logData.data.status === "open" && (
                            <Button onPress={() => setIsResolving(true)}>
                                <ButtonText>Resolve</ButtonText>
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <ConcernResolutionModal
                isOpen={isResolving}
                onClose={() => setIsResolving(false)}
                logData={logData}
                livestockId={livestockId}
                onResolution={() => {
                    onClose();
                    onResolution();
                }}
            />
        </>
    )
}