import { Text, View } from "react-native";
import { BellIcon } from 'phosphor-react-native'

export function Nav(){
  const usuario = {id: 1, nome: 'Roberto Carlos da Silva Júnior Oliveira', };

  function formataNome(nome) {
    const partes = nome.trim().split(" ");

    return partes.slice(0, 2).join(" ");
  }
    return(
        <View className='mt-[10%] px-[2%] justify-between flex-row items-center'>
            <View className='flex-col'>
                <Text className='font-popRegular text-[20px] text-preto dark:text-branco'>Olá,</Text>
                <Text className='font-popMedium text-[22px] mt-[-7%] text-preto dark:text-branco'>{formataNome(usuario.nome)}</Text>
            </View>

            <BellIcon />
        </View>
    )
}