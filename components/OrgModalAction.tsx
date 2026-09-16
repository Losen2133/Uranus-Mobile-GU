import { OrganizationData } from "@/interfaces/interfaces";
import { useEffect, useState } from "react";
import { Button, ButtonText } from "./ui/button";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabel, FormControlLabelText } from "./ui/form-control";
import { Heading } from "./ui/heading";
import { AlertCircleIcon, CloseIcon, Icon } from "./ui/icon";
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
    const [isInvalidOrgName, setIsInvalidOrgName] = useState(false);
    const [orgDesc, setOrgDesc] = useState('');
    const [isInvalidOrgDesc, setIsInvalidOrgDesc] = useState(false);

    useEffect(() => {
        
        if (isOpen && !editMode) {
            setOrgName('');
            setOrgDesc('');
        }
        if (isOpen && editMode && toEditOrg) {
            setOrgName(toEditOrg?.name)
            setOrgDesc(toEditOrg?.description)
        }
    }, [isOpen]);

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
                        <FormControl
                            isInvalid={isInvalidOrgName}
                        >
                            <FormControlLabel>
                                <FormControlLabelText>Orgranization Name</FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                                <InputField
                                    type="text"
                                    placeholder="Organization Name"
                                    placeholderTextColor={'gray'}
                                    value={orgName}
                                    onChangeText={(text) => setOrgName(text)}
                                />
                            </Input>
                            <FormControlError>
                                <FormControlErrorIcon
                                    as={AlertCircleIcon}
                                    className='text-destructive'
                                />
                                <FormControlErrorText className='text-destructive'>
                                    Please fill out this field
                                </FormControlErrorText>
                            </FormControlError>
                        </FormControl>
                        <FormControl
                            isInvalid={isInvalidOrgDesc}
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
                                    onChangeText={(text) => setOrgDesc(text)}
                                    multiline
                                    numberOfLines={4}
                                    className="h-25 pt-3"
                                    style={{ textAlignVertical: 'top' }}
                                />
                            </Input>
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
                        onPress={() => {
                            onOrgAction(orgName, orgDesc);
                        }}
                        isDisabled={
                            editMode
                                ? !orgName ||
                                !orgDesc ||
                                (
                                    orgName === toEditOrg?.name &&
                                    orgDesc === toEditOrg?.description
                                )
                                : !orgName || !orgDesc
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