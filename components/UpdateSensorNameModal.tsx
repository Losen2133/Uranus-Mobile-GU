
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

import {
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@/components/ui/modal";

import {
    Input,
    InputField,
} from "@/components/ui/input";

import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { CloseIcon, Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

interface UpdateSensorNameModalProps {
    visible: boolean;
    currentName: string;
    onClose: () => void;
    onSave: (name: string) => Promise<void>;
}

export default function UpdateSensorNameModal({
    visible,
    currentName,
    onClose,
    onSave,
}: UpdateSensorNameModalProps) {
    const [name, setName] = useState(currentName);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (visible) {
            setName(currentName);
            setError("");
        }
    }, [visible, currentName]);

    const handleSave = async () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            setError("Sensor name cannot be empty.");
            return;
        }

        if (trimmedName === currentName.trim()) {
            onClose();
            return;
        }

        try {
            setLoading(true);
            setError("");

            await onSave(trimmedName);
            onClose();
        } catch {
            setError("Failed to update sensor name. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={visible}
            onClose={onClose}
        >
            <ModalBackdrop />
            <ModalContent>
                <ModalHeader>
                    <Heading size="lg">
                        Update Sensor Name
                    </Heading>

                    <ModalCloseButton>
                        <Icon as={CloseIcon} />
                    </ModalCloseButton>
                </ModalHeader>

                <ModalBody>
                    <Text className="text-sm text-muted-foreground mb-4">
                        Enter a new name for this sensor.
                    </Text>

                    <Input>
                        <InputField
                            value={name}
                            onChangeText={(value) => {
                                setName(value);
                                setError("");
                            }}
                            placeholder="Enter sensor name"
                            editable={!loading}
                            maxLength={100}
                        />
                    </Input>

                    {error !== "" && (
                        <Text className="text-red-500 text-sm mt-2">
                            {error}
                        </Text>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button
                        variant="outline"
                        className="mr-3"
                        onPress={onClose}
                        isDisabled={loading}
                    >
                        <ButtonText>Cancel</ButtonText>
                    </Button>

                    <Button
                        onPress={handleSave}
                        isDisabled={loading || (currentName.trim() === name.trim())}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <ButtonText>Save Changes</ButtonText>
                        )}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
