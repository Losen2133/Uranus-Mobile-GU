import { Center } from "./ui/center";
import { Spinner } from "./ui/spinner";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

type LoaderDisplayProps = {
  type: "error" | "loading";
  message: string;
  textColor?: string;
};

export default function LoaderDisplay({
  type,
  message,
  textColor = "text-white",
}: LoaderDisplayProps) {
  return (
    <Center className="flex-1">
      {type === "loading" ? (
        <VStack className="items-center" space="md">
          <Spinner size="large" />
          <Text className={`text-center text-typography-500 ${textColor}`}>
            {message}
          </Text>
        </VStack>
      ) : (
        <Text className="text-center text-error-500 font-medium">
          {message}
        </Text>
      )}
    </Center>
  );
}