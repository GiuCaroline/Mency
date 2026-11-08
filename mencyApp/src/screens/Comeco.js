import { useEffect, useState } from 'react';
import { View, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';

export function Comeco({ navigation }) {
  const { usuario, isLoading } = useAuth();
  const [tempoMinimo, setTempoMinimo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTempoMinimo(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Espera a splash e a checagem de sessão (me -> refresh) terminarem.
  useEffect(() => {
    if (!tempoMinimo || isLoading || !navigation) return;
    navigation.replace(usuario ? 'Home' : 'Login');
  }, [tempoMinimo, isLoading, usuario, navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-amarelo">

      <Image
        source={require('../../assets/images/logoBranco.png')}
        className="w-[40%]"
        resizeMode="contain"
      />

    </View>
  );
}
