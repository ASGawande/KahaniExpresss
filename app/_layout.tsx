import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack initialRouteName="index"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }}/>
      <Stack.Screen name="RegisterScreen" options={{ title: 'Registration',}}/>
      <Stack.Screen name="HomePage" options={{ headerShown: false }}/>
      <Stack.Screen name="details" options={{ title: 'StoryViewer',}} />
    
    </Stack>
  );
}
