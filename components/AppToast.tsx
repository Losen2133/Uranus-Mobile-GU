import { HStack } from '@/components/ui/hstack';
import { AlertCircleIcon, Icon } from '@/components/ui/icon';
import {
    Toast,
    ToastDescription,
    ToastTitle,
    useToast,
} from "@/components/ui/toast";
import { VStack } from './ui/vstack';

export default function useAppToast() {
  const toast = useToast();

  const showToast = ({
    action = "muted",
    title,
    description,
    placement = "top",
  }: {
    action?: "success" | "error" | "warning" | "info" | "muted";
    title: string;
    description?: string;
    placement?: "top" | "bottom";
  }) => {
    toast.show({
      placement,
      render: ({ id }) => (
        <Toast nativeID={id} action={action}>
            <VStack space="xs">
                <HStack space="sm" className="items-center">
                    {(action === 'warning' || action === 'error') && (
                        <Icon as={AlertCircleIcon} size="sm" />
                    )}
                    <ToastTitle>{title}</ToastTitle>
                </HStack>

                {description && (
                <ToastDescription>{description}</ToastDescription>
                )}
            </VStack>
        </Toast>
      ),
    });
  };

  return { showToast };
}