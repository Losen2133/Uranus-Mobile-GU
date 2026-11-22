import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { passwordField } from "./FormFields";
import { Button, ButtonText } from "./ui/button";
import { Heading } from "./ui/heading";
import { CloseIcon, Icon } from "./ui/icon";
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from "./ui/modal";

type DeleteAccountModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onAction: () => void | Promise<void>;
    password: string;
    setPassword: Dispatch<SetStateAction<string>>;
}

export default function DeleteAccountModal ({
    isOpen,
    onClose,
    onAction,
    password,
    setPassword
}: DeleteAccountModalProps) {
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [serverError, setServerError] = useState<string>();

    useEffect(() => {
        if (isOpen) {
            setPassword("");
            setHasSubmitted(false);
            setServerError(undefined);
        }
    }, [isOpen]);

    const passwordError = serverError ?? (
        hasSubmitted && !password.trim()
            ? "Password is required."
            : ""
    );

    const handleAction = async () => {
        setHasSubmitted(true);

        if (!password.trim()) {
            return;
        }

        setServerError(undefined);

        try {
            await onAction();
        } catch (error) {
            setServerError(
                error instanceof Error
                    ? error.message
                    : "Could not delete the account. Please try again."
            );
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
                            Account Deletion
                        </Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        {passwordField(
                            password,
                            (value) => {
                                setPassword(value);
                                setServerError(undefined);
                            },
                            "Password",
                            passwordError,
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onPress={handleAction}>
                            <ButtonText className="text-red-500">Delete</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            
        </>
    )
}