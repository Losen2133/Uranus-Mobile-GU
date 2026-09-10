import { LivestockLogData } from "@/interfaces/interfaces";
import { resolveConcernLog } from "@/utils/apiFetch";
import { useEffect, useState } from "react";
import { actionTakenField } from "./FormFields";
import { Button, ButtonText } from "./ui/button";
import { Heading } from "./ui/heading";
import { CloseIcon, Icon } from "./ui/icon";
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from "./ui/modal";

type ConcernResolutionModalProps = {
    isOpen: boolean;
    onClose: () => void;
    logData: LivestockLogData | undefined;
    livestockId: number
    onResolution: () => void | Promise<void>;
}

export default function ConcernResolutionModal({
    isOpen,
    onClose,
    logData,
    livestockId,
    onResolution
}: ConcernResolutionModalProps) {
    const [actionTaken, setActionTaken] = useState<string | undefined>();
    const [isInvalidActionTaken, setIsInvalidActionTaken] = useState(false);
    
    useEffect(() => {
        if (isOpen) {
            setActionTaken(undefined);
        }
    }, [isOpen])

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
        >
            <ModalBackdrop />
            <ModalContent>
                <ModalHeader>
                    <Heading size="lg">
                        Concern Resolution
                    </Heading>
                    <ModalCloseButton>
                        <Icon as={CloseIcon} />
                    </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                    {actionTakenField(
                        actionTaken,
                        setActionTaken,
                        isInvalidActionTaken
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="outline"
                        className="mr-3"
                        onPress={() => {
                            onClose();
                        }}
                    >
                        <ButtonText>Cancel</ButtonText>
                    </Button>
                    <Button
                        onPress={ () =>
                            resolveConcernLog(
                                livestockId,
                                logData?.id,
                                actionTaken,
                                () => {}
                            )
                        }
                    >
                        <ButtonText>Submit</ButtonText>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}