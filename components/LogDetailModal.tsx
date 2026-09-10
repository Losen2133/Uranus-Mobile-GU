import { LivestockLogData } from "@/interfaces/interfaces";
import { formatDate } from "@/utils/stringUtils";
import { ScrollView } from "react-native";
import { Box } from "./ui/box";
import { Center } from "./ui/center";
import { Heading } from "./ui/heading";
import { CloseIcon, Icon } from "./ui/icon";
import { Image } from "./ui/image";
import { ImageViewer, ImageViewerCloseButton, ImageViewerContent, ImageViewerTrigger } from "./ui/image-viewer";
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalHeader } from "./ui/modal";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

type LogDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    logData: LivestockLogData | undefined
}

export default function LogDetailModal ({
    isOpen,
    onClose,
    logData
}: LogDetailModalProps) {
    return (
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
            </ModalContent>
        </Modal>
    )
}

