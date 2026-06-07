import { Text, View, StyleSheet } from "react-native";
import { useAuth } from '../context/AuthContext';
import { Search } from './search';
import { Notificacao } from './notification';

export function Nav({ titulo, onSearch, placeholder }){
  const { usuario } = useAuth();

  function formataNome(nome) {
    if (!nome) return '';
    const partes = nome.trim().split(" ");
    return partes.slice(0, 2).join(" ");
  }

  return (
    <View className='mt-[10%] px-[2%] justify-between flex-row items-center relative z-10 mb-[3%]'>
      <View className='flex-col'>
        {titulo ? (
          <Text className='font-popMedium text-[22px] text-preto dark:text-branco'>
            {titulo}
          </Text>
        ) : (
          <>
            <Text className='font-popRegular text-[20px] text-preto dark:text-branco'>Olá,</Text>
            <Text className='font-popMedium text-[22px] mt-[-7%] text-preto dark:text-branco'>
              {formataNome(usuario?.name)}!
            </Text>
          </>
        )}
      </View>

      <View className='flex-row gap-4 relative z-20'>
        <Search onSearch={onSearch} placeholder={placeholder} />
        <Notificacao />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sombra: {
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 7,
  }
});