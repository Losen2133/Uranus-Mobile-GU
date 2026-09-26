import useAppToast from '@/components/AppToast';
import SelectOrgDisplay from '@/components/SelectOrgDisplay';
import SkeletonLoading from '@/components/SkeletonLoading';
import { Accordion, AccordionContent, AccordionHeader, AccordionIcon, AccordionItem, AccordionTitleText, AccordionTrigger } from '@/components/ui/accordion';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { ChevronDownIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useFam } from '@/hooks/useFamOpacity';
import { useOrganization } from '@/hooks/useOrganization';
import { OrganizationDashboardData, SelectedOrgDashboardData, SelectedOrgLivestocksLogsSummaryData, SelectedOrgLivestocksSummaryData, SelectedOrgMembersSummaryData } from '@/interfaces/interfaces';
import { fetchOrgDashboard, fetchSelectedOrgSummary } from '@/utils/apiFetch';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions } from 'react-native';
import {
  GestureHandlerRootView,
  RefreshControl,
  ScrollView
} from 'react-native-gesture-handler';
import { Carousel } from 'react-native-reanimated-carousel';

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
      stickyHeaderIndices={[0]}
    >
      <Box className="bg-gray-800 rounded p-2 mb-2">
        <Heading className="text-center text-white">
          Organizations
        </Heading>
      </Box>
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

function MembersTab({
  membersBriefData,
  refreshing,
  onRefresh,
}: {
  membersBriefData: SelectedOrgMembersSummaryData | undefined;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  if (membersBriefData === undefined) {
    return (
      <SkeletonLoading
        skeletonVariant="index2"
        itemHeight={50}
      />
    );
  }

  return (
    <>
    <Box className="bg-gray-800 rounded p-2 mb-2">
      <Heading className="text-center text-white">
        Members
      </Heading>
    </Box>
      <VStack space='sm'>
        <Box className='flex-row border border-dashed border-gray-500 rounded p-2 justify-center'>
          <Text className='font-bold'>Total Members: </Text>
          <Text>{membersBriefData.total}</Text>
        </Box>
        <Box className='flex-row border border-dashed border-gray-500 rounded p-2 justify-center'>
          <Text className='font-bold'>Active Members: </Text>
          <Text>{membersBriefData.active}</Text>
        </Box>
        <Box className='flex-row border border-dashed border-gray-500 rounded p-2 justify-center'>
          <Text className='font-bold'>Inactive Members: </Text>
          <Text>{membersBriefData.inactive}</Text>
        </Box>
        <Box className='flex-row border border-dashed border-gray-500 rounded p-2 justify-center'>
          <Text className='font-bold'>Admin Members: </Text>
          <Text>{membersBriefData.roles.admin}</Text>
        </Box>
        <Box className='flex-row border border-dashed border-gray-500 rounded p-2 justify-center'>
          <Text className='font-bold'>Observer Members: </Text>
          <Text>{membersBriefData.roles.observer}</Text>
        </Box>
        <Box className='flex-row border border-dashed border-gray-500 rounded p-2 justify-center'>
          <Text className='font-bold'>Maintenance Members: </Text>
          <Text>{membersBriefData.roles.maintenance}</Text>
        </Box>
      </VStack>
    </>
  )
}

function LivestockTab({
    livestockBriefData,
    livestockLogsBriefData,
    refreshing,
    onRefresh,
}: {
    livestockBriefData: SelectedOrgLivestocksSummaryData | undefined;
    livestockLogsBriefData: SelectedOrgLivestocksLogsSummaryData | undefined;
    refreshing: boolean;
    onRefresh: () => void;
}) {
    if (
      livestockBriefData === undefined ||
      livestockLogsBriefData === undefined
    ) {
      return (
        <SkeletonLoading
            skeletonVariant="index2"
            itemHeight={50}
        />
      );
    }

    return (
      <ScrollView stickyHeaderIndices={[0]}>
        <Box className="bg-gray-800 rounded p-2 mb-2">
          <Heading className="text-center text-white">
            Livestocks
          </Heading>
        </Box>
        <VStack space="sm">
            <Box className="flex-row border border-dashed border-gray-500 rounded p-2 justify-center">
                <Text className="font-bold text-yellow-500">Total Livestocks: </Text>
                <Text>{livestockBriefData.total}</Text>
            </Box>
            <Box className="flex-row border border-dashed border-gray-500 rounded p-2 justify-center">
                <Text className="font-bold text-green-500">Total Plant Livestocks: </Text>
                <Text>{livestockBriefData.plant}</Text>
            </Box>
            <Box className="flex-row border border-dashed border-gray-500 rounded p-2 justify-center">
                <Text className="font-bold text-blue-500">Total Fish Livestocks: </Text>
                <Text>{livestockBriefData.fish}</Text>
            </Box>
            <Box className="flex-row border border-dashed border-gray-500 rounded p-2 justify-center">
                <Text className="font-bold">Total Harvested Livestocks: </Text>
                <Text>{livestockBriefData.harvested}</Text>
            </Box>
            <Divider className='mt-2' />
            <Heading className='text-center mt-2 mb-2'>Livestock Logs</Heading>
            <Box className="flex-row border border-dashed border-gray-500 rounded p-2 justify-center">
                <Text className="font-bold">Total Livestocks Logs: </Text>
                <Text>{livestockLogsBriefData.total}</Text>
            </Box>
            <Box className="flex-row border border-dashed border-gray-500 rounded p-2 justify-center">
                <Text className="font-bold">Total Logs: </Text>
                <Text>{livestockLogsBriefData.logs}</Text>
            </Box>
            <Box className="flex-row border border-dashed border-gray-500 rounded p-2 justify-center">
                <Text className="font-bold">Total Concerns: </Text>
                <Text>{livestockLogsBriefData.concerns.total}</Text>
            </Box>
            <Box className="flex-row border border-dashed border-gray-500 rounded p-2 justify-center">
                <Text className="font-bold">Total Open Concerns: </Text>
                <Text>{livestockLogsBriefData.concerns.open}</Text>
            </Box>
            <Box className="flex-row border border-dashed border-gray-500 rounded p-2 justify-center">
                <Text className="font-bold">Total Closed Concerns: </Text>
                <Text>{livestockLogsBriefData.concerns.closed}</Text>
            </Box>
            <Box className="flex-row border border-dashed border-gray-500 rounded p-2 justify-center">
                <Text className="font-bold text-green-500">Total Low Severity Concerns: </Text>
                <Text>{livestockLogsBriefData.concerns.severity.low}</Text>
            </Box>
            <Box className="flex-row border border-dashed border-gray-500 rounded p-2 justify-center">
                <Text className="font-bold text-yellow-500">Total Moderate Severity Concerns: </Text>
                <Text>{livestockLogsBriefData.concerns.severity.moderate}</Text>
            </Box>
            <Box className="flex-row border border-dashed border-gray-500 rounded p-2 justify-center">
                <Text className="font-bold text-orange-500">Total High Severity Concerns: </Text>
                <Text>{livestockLogsBriefData.concerns.severity.high}</Text>
            </Box>
            <Box className="flex-row border border-dashed border-gray-500 rounded p-2 justify-center">
                <Text className="font-bold text-red-500">Total Critical Severity Concerns: </Text>
                <Text>{livestockLogsBriefData.concerns.severity.critical}</Text>
            </Box>
        </VStack>
      </ScrollView>
    );
}

export default function DashboardScreen() {
  const { selectedOrganizationId } = useOrganization();
  const { width, height } = Dimensions.get('window');

  const [currentIndex, setCurrentIndex] = useState(0);

  const { famOpacity, setFamOpacity } = useFam();

  const [orgBriefData, setOrgBriefData] = useState<OrganizationDashboardData[] | undefined>(undefined);
  const [selectedOrgSummaryData, setSelectedOrgSummaryData] = useState<SelectedOrgDashboardData | undefined>(undefined);

  const [refreshing, setRefreshing] = useState(false);

  const { showToast } = useAppToast();

  const handleFetchOrgDashboard = async () => {
    try {
        await fetchOrgDashboard(setOrgBriefData);
    } catch (error) {
        showToast({
            action: 'error',
            title: 'Failed to Fetch Organization Dashboard',
            description: 'Failed to fetch organization dashboard, please try again later.',
        });
    }
  };

  const handleFetchSummaryData = async () => {
    try {
        await fetchSelectedOrgSummary(selectedOrganizationId, setSelectedOrgSummaryData);
    } catch (error) {
        showToast({
            action: 'error',
            title: 'Failed to Fetch Members',
            description:
                'Failed to fetch organization members, please try again later.',
        });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await handleFetchOrgDashboard();
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
      handleFetchOrgDashboard();
      if(selectedOrganizationId) {
        handleFetchSummaryData();
      }
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
                  <MembersTab
                    membersBriefData={selectedOrgSummaryData?.members}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                  />
                )}
                {item.id === 3 && (
                  <LivestockTab
                    livestockBriefData={selectedOrgSummaryData?.livestocks}
                    livestockLogsBriefData={selectedOrgSummaryData?.logs}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                  />
                )}
              </Box>
            )}
          </VStack>
        )}
      />
    </GestureHandlerRootView>
  );
}
