import { OrganizationMember } from "@/interfaces/interfaces";
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

type MemberDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    selectedMember: OrganizationMember | undefined;
}

export default function MemberDetailModal({
    isOpen,
    onClose,
    selectedMember
}: MemberDetailModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
        >
            <ModalBackdrop />
            <ModalContent>
                <ModalHeader>
                        <Heading size="lg">{selectedMember?.name}</Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <ScrollView className="max-h-100">
                            <VStack space="md">

                                {/* Profile Image */}
                                <Center className="mb-2 mt-3">
                                    {selectedMember?.image_url ? (
                                        <ImageViewer
                                            images={[
                                                {
                                                    url: selectedMember.image_url,
                                                    alt: selectedMember.name ?? "Profile image",
                                                },
                                            ]}
                                        >
                                            <ImageViewerTrigger>
                                                <Center>
                                                    <Image
                                                        source={{ uri: selectedMember.image_url }}
                                                        alt={selectedMember.name ?? "Profile image"}
                                                        className="border-3 border-white rounded-full"
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
                                        <Center className="bg-gray-200 rounded-full border-3 border-white w-32 h-32">
                                            <Text className="text-gray-500 text-center">
                                                No image available
                                            </Text>
                                        </Center>
                                    )}
                                </Center>

                                {/* Name */}
                                <Box>
                                    <Heading size="sm" className="mb-2">
                                        Name
                                    </Heading>

                                    <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                        <Text>{selectedMember?.name}</Text>
                                    </Box>
                                </Box>

                                {/* Email */}
                                <Box>
                                    <Heading size="sm" className="mb-2">
                                        Email
                                    </Heading>

                                    <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                        <Text>{selectedMember?.email}</Text>
                                    </Box>
                                </Box>

                                {/* Role */}
                                <Box>
                                    <Heading size="sm" className="mb-2">
                                        Role
                                    </Heading>

                                    <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                        <Text className="capitalize">
                                            {selectedMember?.role}
                                        </Text>
                                    </Box>
                                </Box>

                                {/* Membership Status */}
                                <Box>
                                    <Heading size="sm" className="mb-2">
                                        Membership Status
                                    </Heading>

                                    <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                        <Text
                                            className={
                                                selectedMember?.active
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }
                                        >
                                            {selectedMember?.active ? "Active" : "Inactive"}
                                        </Text>
                                    </Box>
                                </Box>

                                <Box>
                                    <Heading size="sm" className="mb-2">
                                        Joined At
                                    </Heading>

                                    <Box className="border-2 border-dashed border-gray-500 rounded p-2">
                                        <Text className="capitalize">
                                            {formatDate(selectedMember?.joined_at, "short")}
                                        </Text>
                                    </Box>
                                </Box>

                            </VStack>
                        </ScrollView>
                    </ModalBody>
            </ModalContent>
        </Modal>
    )
}