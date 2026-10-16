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
    const [isInvalidPassword, setIsInvalidPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPassword("");
            setIsInvalidPassword(false);
        }
    }, [isOpen]);

    const passwordError =
        password.length === 0
            ? "Please fill out this field"
            : "";

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
                            setPassword,
                            "Password",
                            isInvalidPassword,
                            passwordError,
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onPress={() => onAction()} isDisabled={password.length === 0}>
                            <ButtonText className="text-red-500">Delete</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            
        </>
    )
}