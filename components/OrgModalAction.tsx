import { OrganizationData } from "@/interfaces/interfaces";
import FieldError from "./FieldError";
import { validateRequiredText } from "@/utils/validation";
import { useEffect, useState } from "react";
import { Button, ButtonText } from "./ui/button";
import { FormControl, FormControlLabel, FormControlLabelText } from "./ui/form-control";
import { Heading } from "./ui/heading";
import { CloseIcon, Icon } from "./ui/icon";
import { Input, InputField } from "./ui/input";
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from "./ui/modal";
import { VStack } from "./ui/vstack";

type OrgModalActionProps = {
    isOpen: boolean;
    editMode: boolean;
    toEditOrg: OrganizationData | undefined;
    onOrgEdit: () => void;
    onClose: () => void;
    onOrgAction: (
        orgName: string,
        orgDesc: string
    ) => void | Promise<void>;
}

export default function OrgModalAction ({
    isOpen,
    editMode,
    onOrgEdit,
    toEditOrg,
    onClose,
    onOrgAction
}: OrgModalActionProps) {
    const [orgName, setOrgName] = useState('');
    const [orgDesc, setOrgDesc] = useState('');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const orgNameError = hasSubmitted
        ? validateRequiredText(orgName, "Organization name")
        : undefined;
    const orgDescriptionError = hasSubmitted
        ? validateRequiredText(orgDesc, "Description")
        : undefined;

    useEffect(() => {
        
        if (isOpen && !editMode) {
            setOrgName('');
            setOrgDesc('');
            setHasSubmitted(false);
            setSubmitError(undefined);
        }
        if (isOpen && editMode && toEditOrg) {
            setOrgName(toEditOrg.name ?? '');
            setOrgDesc(toEditOrg.description ?? '');
            setHasSubmitted(false);
            setSubmitError(undefined);
        }
    }, [isOpen, editMode, toEditOrg]);

    const handleSubmit = async () => {
        setHasSubmitted(true);

        if (validateRequiredText(orgName, "Organization name") || validateRequiredText(orgDesc, "Description")) {
            return;
        }

        setSubmitError(undefined);
        setIsSubmitting(true);

        try {
            await onOrgAction(orgName.trim(), orgDesc.trim());
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Could not save this organization. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                onOrgEdit();
                onClose();
            }}
        >
            <ModalBackdrop />
            <ModalContent>
                <ModalHeader>
                    <Heading size="lg">
                        {editMode ? "Edit" : "Create"} Organization
                    </Heading>
                    <ModalCloseButton>
                        <Icon as={CloseIcon} />
                    </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                    <VStack space="md">
                        {submitError && (
                            <FormControl isInvalid>
                                <FieldError message={submitError} />
                            </FormControl>
                        )}
                        <FormControl
                            isInvalid={!!orgNameError}
                        >
                            <FormControlLabel>
                                <FormControlLabelText>Organization Name</FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                                <InputField
                                    type="text"
                                    placeholder="Organization Name"
                                    placeholderTextColor={'gray'}
                                    value={orgName}
                                    onChangeText={(text) => {
                                        setOrgName(text);
                                        setSubmitError(undefined);
                                    }}
                                />
                            </Input>
                            <FieldError message={orgNameError} />
                        </FormControl>
                        <FormControl
                            isInvalid={!!orgDescriptionError}
                        >
                            <FormControlLabel>
                                <FormControlLabelText>Description</FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                                <InputField
                                    type="text"
                                    placeholder="Description"
                                    placeholderTextColor={'gray'}
                                    value={orgDesc}
                                    onChangeText={(text) => {
                                        setOrgDesc(text);
                                        setSubmitError(undefined);
                                    }}
                                    multiline
                                    numberOfLines={4}
                                    className="h-25 pt-3"
                                    style={{ textAlignVertical: 'top' }}
                                />
                            </Input>
                            <FieldError message={orgDescriptionError} />
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="outline"
                        className="mr-3"
                        onPress={() => {
                            onOrgEdit();
                            onClose();
                        }}
                    >
                        <ButtonText>Cancel</ButtonText>
                    </Button>
                    <Button
                        onPress={handleSubmit}
                        isDisabled={isSubmitting ||
                            editMode &&
                            orgName.trim() === toEditOrg?.name?.trim() &&
                            orgDesc.trim() === toEditOrg?.description?.trim()
                        }
                    >
                        <ButtonText>
                            {editMode ? "Save" : "Create"}
                        </ButtonText>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}