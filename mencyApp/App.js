import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Poppins_200ExtraLight, Poppins_300Light, Poppins_400Regular,
    Poppins_600SemiBold_Italic, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

import * as Linking from 'expo-linking';
import { LogBox } from 'react-native';

import { AuthProvider } from './src/context/AuthContext';
import { navigationRef } from './src/navigation/navigationRef';

LogBox.ignoreLogs(['Non-serializable values']);

import { Comeco } from './src/screens/Comeco';
import { Login } from './src/screens/Login';
import { Cadastro } from './src/screens/Cadastro';
import { Home } from './src/screens/Home';
import { Transacao } from './src/screens/Transacao';
import { Futuro } from './src/screens/Futuro';
import { Perfil } from './src/screens/Perfil';
import { EsqueciSenha } from './src/screens/EsqueciSenha';
import { RedefinirSenha } from './src/screens/RedefinirSenha';
import { Assistente } from './src/screens/Assistente';

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

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// Link do e-mail de "esqueci minha senha": mency://redefinir-senha?token=...
const linking = {
  prefixes: [Linking.createURL('/'), 'mency://'],
  config: {
    screens: {
      RedefinirSenha: 'redefinir-senha',
    },
  },
};

function AppContent() {
  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
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
        <Stack.Screen name="EsqueciSenha" component={EsqueciSenha} />
        <Stack.Screen name="RedefinirSenha" component={RedefinirSenha} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Transacao" component={Transacao} />
        <Stack.Screen name="Futuro" component={Futuro} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen name="Assistente" component={Assistente} />
      </Stack.Navigator>
      <StatusBar />
    </NavigationContainer>
  );
}