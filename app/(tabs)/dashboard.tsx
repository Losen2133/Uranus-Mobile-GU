
import SelectOrgDisplay from '@/components/SelectOrgDisplay';
import { Text } from '@/components/ui/text';
import { useOrganization } from '@/hooks/useOrganization';

export default function DashboardScreen() {
  const { selectedOrganizationId } = useOrganization();

  return (
    <>
      {!selectedOrganizationId ? (
        <SelectOrgDisplay />
      ) : (
        <Text>This is the dashboard</Text>
      )}
    </>
  );
}

