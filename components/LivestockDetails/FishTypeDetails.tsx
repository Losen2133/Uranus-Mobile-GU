import { LivestockData, UserSettings } from "@/interfaces/interfaces";
import { convertTemperature, formatDate, getDaysLeft, getTemperatureSuffix, TempUnit } from "@/utils/stringUtils";
import { Droplets, Thermometer } from "lucide-react-native";
import { Box } from "../ui/box";
import { Divider } from "../ui/divider";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";

type FishTypeDetailsProps = {
    livestock: LivestockData | null;
    userSettings: UserSettings | null;
};

export function FishTypeDetails({ livestock, userSettings }: FishTypeDetailsProps) {
    const tempUnit: TempUnit = userSettings?.temp_unit as TempUnit || "celcius";

    return (
        livestock?.type === "fish" && (
            <VStack
                space="md"
                className="mb-3"
            >
                <VStack space="xs">
                    <Text className="font-bold text-lg text-center">
                        Fish Name
                    </Text>
                    <Text className="text-center">
                        {livestock.species_name}
                    </Text>
                </VStack>

                <Divider />

                <VStack space="xs">
                    <Text className="font-bold text-lg text-center">
                        Description
                    </Text>
                    <Text className="text-center">
                        {livestock.description}
                    </Text>
                </VStack>

                <Divider />

                {livestock.harvested && (
                    <VStack space="xs">
                        <Text className="font-bold text-lg text-center">
                            Harvested on
                        </Text>

                        <Text className="text-center">
                            {formatDate(livestock.date_of_harvest)}
                        </Text>
                    </VStack>
                )}

                {!livestock.harvested && (
                    <VStack space="xs">
                        <Text className="font-bold text-lg text-center">
                            Days until Mature
                        </Text>

                        <Text className="text-center">
                            {getDaysLeft(
                                livestock.created_at,
                                livestock.data.growth_days
                            ) !== 0
                                ? `${getDaysLeft(
                                    livestock.created_at,
                                    livestock.data.growth_days
                                )} Days Left`
                                : "Ready for Harvest!"}
                        </Text>
                    </VStack>
                )}  

                <Divider />

                <HStack
                    space="lg"
                    className="flex-row justify-center"
                >
                    <VStack space="xs">
                        <Box className="items-center justify-center">
                            <Thermometer size={40} color="white" />
                        </Box>

                        <Text className="font-bold text-lg text-center">
                            Ideal Temperature
                        </Text>

                        <Text>
                            <Text className="font-bold text-center">
                                Min:
                            </Text>{" "}
                            {convertTemperature(
                                livestock.data.ideal_temp.min ?? 0,
                                livestock.data.ideal_temp.temp_unit ?? "celcius",
                                tempUnit
                            ).toFixed(1)}
                            {getTemperatureSuffix(tempUnit)}
                        </Text>

                        <Text>
                            <Text className="font-bold text-center">
                                Max:
                            </Text>{" "}
                            {convertTemperature(
                                livestock.data.ideal_temp.max ?? 0,
                                livestock.data.ideal_temp.temp_unit ?? "celcius",
                                tempUnit
                            ).toFixed(1)}
                            {getTemperatureSuffix(tempUnit)}
                        </Text>
                    </VStack>

                    <VStack space="xs">
                        <Box className="items-center justify-center">
                            <Droplets size={40} color="white" />
                        </Box>

                        <Text className="font-bold text-lg text-center">
                            Ideal pH Range
                        </Text>

                        <Text>
                            <Text className="font-bold text-center">
                                Min:
                            </Text>{" "}
                            {livestock.data.ph_range.min}
                        </Text>

                        <Text>
                            <Text className="font-bold text-center">
                                Max:
                            </Text>{" "}
                            {livestock.data.ph_range.max}
                        </Text>
                    </VStack>
                </HStack>

                <Divider />

                <VStack space="xs">
                    <Text className="font-bold text-lg text-center">
                        Added on
                    </Text>

                    <Text className="text-center">
                        {formatDate(livestock.created_at)}
                    </Text>
                </VStack>

                <Divider />

                <VStack space="xs">
                    <Text className="font-bold text-lg text-center">
                        Added by
                    </Text>

                    <Text className="text-center">
                        {livestock.added_by.name}
                    </Text>
                </VStack>

                <Divider />
                
                {livestock.updated_at !== livestock.created_at && (
                    <VStack space="xs">
                        <Text className="font-bold text-lg text-center">
                            Last Updated on
                        </Text>

                        <Text className="text-center">
                            {formatDate(livestock.updated_at)}
                        </Text>
                    </VStack>
                )}
                
            </VStack>
        )
    )
}