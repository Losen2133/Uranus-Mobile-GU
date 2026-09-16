import { LivestockLogData } from "@/interfaces/interfaces";
import { resolveConcernLog } from "@/utils/apiFetch";
import { useEffect, useState } from "react";
import useAppToast from "./AppToast";
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
    const [loading, setLoading] = useState(false);
    const { showToast } = useAppToast();
    
    useEffect(() => {
        if (isOpen) {
            setActionTaken(undefined);
        }
    }, [isOpen])

    const handleSubmit = async () => {
        if (!actionTaken) {
            setIsInvalidActionTaken(true);
            return;
        }

        if (!logData?.id) {
            return;
        }

        setLoading(true);

        try {
            await resolveConcernLog(
                livestockId,
                logData.id,
                actionTaken
            );

            onClose();

            await onResolution();

            showToast({
                action: "success",
                title: "Log Resolved Successfully",
                description: "Log has been successfully resolved.",
            });
        } catch (error) {
            // const message =
            //     error instanceof Error
            //         ? error.message
            //         : "Failed to resolve concern";

            onClose();

            showToast({
                action: "error",
                title: "Concern Failed to Resolve",
                description: "Failed to resolve concern, please try again later.",
            });
        } finally {
            setLoading(false);
        }
    };

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
                        isDisabled={loading}
                        onPress={handleSubmit}
                    >
                        <ButtonText>Submit</ButtonText>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}