import useAppToast from "@/components/AppToast";
import { passwordField } from "@/components/FormFields";
import FieldError from "@/components/FieldError";
import { Button, ButtonText } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { VStack } from "@/components/ui/vstack";
import { changePassword } from "@/utils/apiFetch";
import { useState } from "react";

export default function ProfileScreen2() {
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [changingPassword, setChangingPassword] = useState<boolean>(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [serverError, setServerError] = useState<string>();

    const { showToast } = useAppToast();

    const isTheSame =
        newPassword === confirmPassword;

    const currentPasswordError = !hasSubmitted
        ? ""
        :
        currentPassword.length === 0
            ? "Current password is required."
            : "";

    const newPasswordError = !hasSubmitted
        ? ""
        :
        newPassword.length === 0
            ? "New password is required."
            : newPassword.length < 8
                ? "Password must be at least 8 characters."
                : "";

    const confirmPasswordError = !hasSubmitted
        ? ""
        :
        confirmPassword.length === 0
            ? "Confirm your new password."
            : !isTheSame
                ? "Passwords do not match."
                : "";

    const handleSubmit = async () => {
        const currentPasswordInvalid =
            currentPassword.length === 0;

        const newPasswordInvalid =
            newPassword.length < 8;

        const confirmPasswordInvalid =
            confirmPassword.length === 0 ||
            !isTheSame;

        setHasSubmitted(true);

        // Stop here if there are validation errors
        if (
            currentPasswordInvalid ||
            newPasswordInvalid ||
            confirmPasswordInvalid
        ) {
            return;
        }

        try {
            setChangingPassword(true);

            await changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setHasSubmitted(false);
            setServerError(undefined);

            showToast({
                action: 'success',
                title: 'Successfully Changed Password',
                description: "Your password has been successfully changed",
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred';

            showToast({
                action: 'error',
                title: 'Failed to Change Password',
                description: message,
            });
            setServerError(message);

            setChangingPassword(false);
        }
    };

    return (
        <VStack space="md" className="p-5">
            {serverError && (
                <FormControl isInvalid>
                    <FieldError message={serverError} />
                </FormControl>
            )}

            {passwordField(
                currentPassword,
                (value) => {
                    setCurrentPassword(value);
                    setServerError(undefined);
                },
                "Current Password",
                currentPasswordError,
            )}

            {passwordField(
                newPassword,
                (value) => {
                    setNewPassword(value);
                    setServerError(undefined);
                },
                "New Password",
                newPasswordError,
            )}

            {passwordField(
                confirmPassword,
                (value) => {
                    setConfirmPassword(value);
                    setServerError(undefined);
                },
                "Confirm Password",
                confirmPasswordError,
            )}

            <Button isDisabled={changingPassword} onPress={handleSubmit}>
                <ButtonText>Change Password</ButtonText>
            </Button>

        </VStack>
    );
}