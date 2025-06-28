import LoadingScreen from '@/components/shared/LoadingScreen';

export default function RootLoading() {
  return (
    <LoadingScreen 
      type="global"
      message="Loading your amazing portfolio..."
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
    />
  );
}
