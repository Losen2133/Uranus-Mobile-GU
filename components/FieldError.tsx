import { AlertCircleIcon } from "@/components/ui/icon";
import {
    FormControlError,
    FormControlErrorIcon,
    FormControlErrorText,
} from "@/components/ui/form-control";

type FieldErrorProps = {
    message?: string;
};

export default function FieldError({ message }: FieldErrorProps) {
    if (!message) {
        return null;
    }

    return (
        <FormControlError>
            <FormControlErrorIcon
                as={AlertCircleIcon}
                className="text-destructive"
            />
            <FormControlErrorText className="text-destructive">
                {message}
            </FormControlErrorText>
        </FormControlError>
    );
}
