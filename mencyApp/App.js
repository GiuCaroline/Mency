import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { useFonts,
   Poppins_200ExtraLight,
    Poppins_300Light, Poppins_400Regular, 
    Poppins_600SemiBold_Italic,
    Poppins_500Medium, Poppins_600SemiBold,
    Poppins_700Bold } from '@expo-google-fonts/poppins';

import { Comeco } from './src/screens/Comeco';
import { Login } from './src/screens/Login';
import { Cadastro } from './src/screens/Cadastro';
import { Home } from './src/screens/Home';
import { Transacao } from './src/screens/Transacao';
import { Futuro } from './src/screens/Futuro';



const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_200ExtraLight,
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
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
        <Stack.Screen name="Cadastro" component={Cadastro} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Transacao" component={Transacao} />
        <Stack.Screen name="Futuro" component={Futuro} />
      </Stack.Navigator>

      <StatusBar />
    </NavigationContainer>
  );
}