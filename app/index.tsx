import LoaderDisplay from '@/components/LoaderDisplay';
import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function Index() {
  const { userToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <LoaderDisplay
        type='loading'
        message='Loading Session...'
      />
    );
  }

  return userToken ? <Redirect href="/(tabs)/dashboard" /> : <Redirect href="/(auth)/login" />;
}