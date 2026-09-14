
import { Box } from '@/components/ui/box';
import { Tabs, TabsContent, TabsContentWrapper, TabsIndicator, TabsList, TabsTrigger, TabsTriggerText } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { useOrganization } from '@/hooks/useOrganization';
import { useState } from 'react';

export default function DashboardScreen() {
  const { selectedOrganizationId } = useOrganization();
  const [currentTab, setCurrentTab] = useState<string>('organizations');


  return (
    <Tabs
      value={currentTab}
      onValueChange={(value: string) => setCurrentTab(value)}
    >
      <TabsList className="mt-1">
        <TabsTrigger value="organizations">
          <TabsTriggerText>Organizations</TabsTriggerText>
        </TabsTrigger>

        <TabsTrigger value="members">
          <TabsTriggerText>Members</TabsTriggerText>
        </TabsTrigger>

        <TabsTrigger value="livestocks">
          <TabsTriggerText>Livestocks</TabsTriggerText>
        </TabsTrigger>

        <TabsTrigger value="sensors">
          <TabsTriggerText>Sensors</TabsTriggerText>
        </TabsTrigger>

        <TabsIndicator />
      </TabsList>

      <TabsContentWrapper className="border border-white">
        <TabsContent value="organizations">
          <Box className="p-5">
            <Text>This is the Organizations Dashboard</Text>
          </Box>
        </TabsContent>

        <TabsContent value="members">
          <Box className="p-5">
            <Text>This is the Members Dashboard</Text>
          </Box>
        </TabsContent>

        <TabsContent value="livestocks">
          <Box className="p-5">
            <Text>This is the Livestocks Dashboard</Text>
          </Box>
        </TabsContent>

        <TabsContent value="sensors">
          <Box className="p-5">
            <Text>This is the Sensors Dashboard</Text>
          </Box>
        </TabsContent>
      </TabsContentWrapper>
    </Tabs>
  );
}

