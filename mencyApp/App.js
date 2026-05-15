import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { useFonts,
   Poppins_200ExtraLight,
    Poppins_300Light, Poppins_300Light_Italic, Poppins_400Regular, 
    Poppins_600SemiBold_Italic,
    Poppins_500Medium, Poppins_600SemiBold,
    Poppins_700Bold } from '@expo-google-fonts/poppins';

import { Comeco } from './src/screens/Comeco';
import { Login } from './src/screens/Login';



const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_200ExtraLight,
    Poppins_300Light,
    Poppins_300Light_Italic,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_600SemiBold_Italic,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

   return (
    <AppContent />
  );
}

function AppContent() {



  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 1000,
        }}
      > 
        <Stack.Screen name="Splash" component={Comeco} />
        <Stack.Screen name="Comeco" component={Comeco} />
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>

      <StatusBar />
    </NavigationContainer>
  );
}