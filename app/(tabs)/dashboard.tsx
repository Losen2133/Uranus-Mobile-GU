import SelectOrgDisplay from '@/components/SelectOrgDisplay';
import SkeletonLoading from '@/components/SkeletonLoading';
import { Accordion, AccordionContent, AccordionHeader, AccordionIcon, AccordionItem, AccordionTitleText, AccordionTrigger } from '@/components/ui/accordion';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { ChevronDownIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useFam } from '@/hooks/useFamOpacity';
import { useOrganization } from '@/hooks/useOrganization';
import { OrganizationDashboardData } from '@/interfaces/interfaces';
import { fetchOrgDashboard } from '@/utils/apiFetch';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions } from 'react-native';
import {
  GestureHandlerRootView,
  RefreshControl,
  ScrollView
} from 'react-native-gesture-handler';
import { Carousel } from 'react-native-reanimated-carousel';

// function OrganizationsTab({
//   orgBriefData,
// }: {
//   orgBriefData: OrganizationDashboardData[] | undefined;
// }) {
//   if (orgBriefData === undefined) {
//     return (
//       <Box className="flex-1 items-center justify-center">
//         <LoaderDisplay
//           type="loading"
//           message="Loading organizations..."
//         />
//       </Box>
//     );
//   }

//   return (
//     <ScrollView
//       horizontal
//       showsHorizontalScrollIndicator={false}
//       nestedScrollEnabled
//     >
//       <Table className="w-[900px]">
//         <TableHeader>
//           <TableRow>
//             <TableHead className="w-[200px] text-center">
//               Organization Name
//             </TableHead>

//             <TableHead className="w-[180px] text-center">
//               Owner
//             </TableHead>

//             <TableHead className="w-[150px] text-center">
//               Members Count
//             </TableHead>

//             <TableHead className="w-[150px] text-center">
//               Number of Livestocks
//             </TableHead>

//             <TableHead className="w-[150px] text-center">
//               Available Sensors
//             </TableHead>
//           </TableRow>
//         </TableHeader>

//         <TableBody>
//           {orgBriefData.map((organization) => (
//             <TableRow key={organization.id}>
//               <TableData className="w-[200px] text-center">
//                 {organization.organization_name}
//               </TableData>

//               <TableData className="w-[180px]">
//                 <VStack space="xs" className="items-center">
//                   <Text className="text-center">
//                     {organization.owner.name}
//                   </Text>

//                   <Text className="text-center text-xs text-gray-400">
//                     {organization.owner.email}
//                   </Text>
//                 </VStack>
//               </TableData>

//               <TableData className="w-[150px] text-center">
//                 {organization.members_count}
//               </TableData>

//               <TableData className="w-[150px] text-center">
//                 {organization.livestocks_count}
//               </TableData>

//               <TableData className="w-[150px] text-center">
//                 {organization.sensors_count}
//               </TableData>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </ScrollView>
//   );
// }

function OrganizationsTab({
  orgBriefData,
  refreshing,
  onRefresh,
}: {
  orgBriefData: OrganizationDashboardData[] | undefined;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  if (orgBriefData === undefined) {
    return (
      <SkeletonLoading
        skeletonVariant="index2"
        itemHeight={50}
      />
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <Accordion
        type="single"
        isCollapsible={true}
        isDisabled={false}
      >
        {orgBriefData.map((org) => (
          <AccordionItem
            key={org.id}
            value={`org-${org.id}`}
            className="border border-white mb-2 rounded p-2"
          >
            <AccordionHeader>
              <AccordionTrigger>
                {({ isExpanded }: { isExpanded: boolean }) => (
                  <>
                    <AccordionTitleText className='font-bold'>
                      {org.organization_name}
                    </AccordionTitleText>

                    <AccordionIcon as={ChevronDownIcon} />
                  </>
                )}
              </AccordionTrigger>
            </AccordionHeader>

            <AccordionContent className="border border-gray-500 rounded p-2">
              <VStack space="sm">
                <Box className="flex-row">
                  <Text className="font-bold">Owner: </Text>
                  <Text>{org.owner.name}</Text>
                </Box>

                <Box className="flex-row">
                  <Text className="font-bold">Members: </Text>
                  <Text>{org.members_count}</Text>
                </Box>

                <Box className="flex-row">
                  <Text className="font-bold">Livestocks: </Text>
                  <Text className="text-green-500">
                    {org.livestocks.plant}
                  </Text>
                  <Text> / </Text>
                  <Text className="text-blue-500">
                    {org.livestocks.fish}
                  </Text>
                  <Text> : </Text>
                  <Text className="text-yellow-500">
                    {org.livestocks.total}
                  </Text>
                </Box>

                <Box className="flex-row">
                  <Text className="font-bold">Sensors: </Text>
                  <Text>{org.sensors_count}</Text>
                </Box>
              </VStack>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollView>
  );
}

export default function DashboardScreen() {
  const { selectedOrganizationId } = useOrganization();
  const { width, height } = Dimensions.get('window');

  const [currentIndex, setCurrentIndex] = useState(0);

  const { famOpacity, setFamOpacity } = useFam();

  const [orgBriefData, setOrgBriefData] = useState<
    OrganizationDashboardData[] | undefined
  >(undefined);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await fetchOrgDashboard(setOrgBriefData);
    } finally {
      setRefreshing(false);
    }
  };

  const data = [
    { id: 1, title: 'Organizations' },
    { id: 2, title: 'Members' },
    { id: 3, title: 'Livestocks' },
    { id: 4, title: 'Sensors' },
  ];

  useFocusEffect(
    useCallback(() => {
      fetchOrgDashboard(setOrgBriefData);
    }, [selectedOrganizationId])
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Box className="mt-3 flex-row items-center justify-center gap-2">
        {data.map((_, index) => (
          <Box
            key={index}
            className={
              index === currentIndex
                ? 'h-2 w-6 rounded-full bg-white'
                : 'h-2 w-2 rounded-full bg-gray-400'
            }
          />
        ))}
      </Box>

      <Carousel
        style={{
          width,
          height: height * 0.8,
          // borderWidth: 1,
          // borderColor: 'white'
        }}
        data={data}
        onConfigurePanGesture={(gesture) => {
          gesture.activeOffsetX([-20, 20]);
        }}
        onScrollStart={() => {
          if (famOpacity === 100) {
            setFamOpacity(35);
          }
        }}
        onProgressChange={(absoluteProgress) => {
          setCurrentIndex(Math.round(absoluteProgress));
        }}
        renderItem={({ item }) => (
          <VStack space="md" className="flex-1 m-5">
            <Heading className="text-center">
              {item.title}
            </Heading>

            {!selectedOrganizationId && item.id !== 1 ? (
              <SelectOrgDisplay />
            ) : (
              <Box className="flex-1 rounded-xl">
                {item.id === 1 && (
                  <OrganizationsTab
                    orgBriefData={orgBriefData}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                  />
                )}
                {item.id === 2 && (
                  null
                )}
              </Box>
            )}
          </VStack>
        )}
      />
    </GestureHandlerRootView>
  );
}
