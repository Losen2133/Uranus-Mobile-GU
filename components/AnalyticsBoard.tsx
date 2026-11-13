import LoaderDisplay from '@/components/LoaderDisplay';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { fetchAnalyticsWebViewLink } from '@/utils/apiFetch';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { WebView } from 'react-native-webview';

type Props = {
  organizationId: number;
};

export default function AnalyticsBoard({ organizationId }: Props) {
  const [chartLink, setChartLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setChartLink(null);
    setLoading(true);
    setError(null);

    fetchAnalyticsWebViewLink(organizationId)
      .then((url) => {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== 'https:') {
          throw new Error('The analytics link must use a secure connection.');
        }
        if (active) {
          setChartLink(url);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'Could not open analytics.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [organizationId, reloadKey]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-red-300">{error}</Text>
        <Pressable
          accessibilityRole="button"
          className="mt-4 rounded border border-gray-500 px-4 py-2"
          onPress={() => setReloadKey((key) => key + 1)}
        >
          <Text className="text-white">Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {chartLink ? (
        <WebView
          key={chartLink}
          source={{ uri: chartLink }}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          setSupportMultipleWindows={false}
          originWhitelist={['https://*']}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={(event) => {
            setError(event.nativeEvent.description || 'Could not load analytics.');
            setLoading(false);
          }}
        />
      ) : null}
      {loading ? (
        <Box className="absolute inset-0 items-center justify-center bg-background">
          <LoaderDisplay
            type="loading"
            message="Loading analytics chart…"
            textColor="text-white"
          />
        </Box>
      ) : null}
    </View>
  );
}
