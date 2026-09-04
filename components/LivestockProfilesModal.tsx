import { Folder } from "lucide-react-native";
import { Fab, FabIcon, FabLabel } from "./ui/fab";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { AddIcon, CloseIcon, Icon } from "./ui/icon";
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalHeader } from "./ui/modal";
import { Text } from "./ui/text";

type LivestockProfileModalProps = {
    isOpen: boolean;
    onClose: () => void;
}

export default function LivestockProfilesModal({
    isOpen,
    onClose
}: LivestockProfileModalProps) {

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
        >
            <ModalBackdrop />

            <ModalContent className="w-full h-full rounded-none p-0 pb-8 border border-white ">
                <ModalHeader className="p-3 mt-7 bg-white/5">
                    <HStack space="sm">
                        <Folder color={'white'} size={30} />
                        <Heading>Livestock Profiles</Heading>
                    </HStack>
                    
                    <ModalCloseButton>
                        <Icon as={CloseIcon} />
                    </ModalCloseButton>
                </ModalHeader>

                <ModalBody className="border border-white flex-1">
                    {/* Your content */}
                    {/* <Box className="border border-green-500 h-full w-full"> */}
                        <Text>Test</Text>
                        
                        
                    {/* </Box> */}
                    <Fab
                        size="md"
                        placement="bottom right"
                        isHovered={false}
                        isDisabled={false}
                        
                    >
                        <FabIcon as={AddIcon} />
                        <FabLabel>Create Profile</FabLabel>
                    </Fab>
                </ModalBody>
                
            </ModalContent>
        </Modal>
    )
}