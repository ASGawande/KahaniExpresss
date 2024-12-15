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
      <Stack.Screen name="RegisterScreen" options={{ headerShown: false }}/>
      <Stack.Screen name="HomePage" options={{ headerShown: false }}/>
      <Stack.Screen name="details" options={{ headerShown: false }} />
    
    </Stack>
  );
}
