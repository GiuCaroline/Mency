import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { NavBottom } from "../components/navBottom";
import { Nav } from "../components/nav";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { SunDimIcon, TrashSimpleIcon, SignOutIcon, MoonStarsIcon } from "phosphor-react-native";

export function Perfil(){
    const navigation = useNavigation();
    const usuario = {id: 1, nome: 'Carlos Alberto da Silva Júnior Oliveira', email: 'carlosAlberto@gmail.com', cpf: '111.111.111-11'};
    const { colorScheme, toggleColorScheme } = useColorScheme();

    function formataNome(nome) {
        const partes = nome.trim().split(" ");
        return partes.slice(0, 2).join(" ");
    }
    return(
        <View className='flex-1 bg-branco dark:bg-preto-dark'>
            <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 95 }} className='flex'>
                <Nav 
                    titulo={'Perfil'}
                    placeholder="Buscar algo..." 
                    onSearch={(textoDigitado) => (console.log('Pesquisa: ', textoDigitado))}
                />

                <View className='bg-input dark:bg-input-dark rounded-[20px] p-4' style={[styles.sombra]}>
                    <Text className='font-popLight text-[13px] text-amarelo'>Nome:</Text>
                    <Text className='font-popRegular text-preto dark:text-branco text-[16px] ml-[2%]'>{usuario.nome}</Text>
                    <Text className='font-popLight text-[13px] text-amarelo'>CPF:</Text>
                    <Text className='font-popRegular text-[16px] ml-[2%] text-preto dark:text-branco'>{usuario.cpf}</Text>
                    <Text className='font-popLight text-[13px] text-amarelo'>Email:</Text>
                    <Text className='font-popRegular text-[16px] ml-[2%] text-preto dark:text-branco'>{usuario.email}</Text>
                </View>

                <TouchableOpacity
                    className='items-center bg-input dark:bg-input-dark rounded-[20px] p-4 mt-[5%] flex-row justify-between'
                    style={[styles.sombra]}
                    onPress={toggleColorScheme}
                >
                    <Text className='font-popRegular text-[16px] text-preto dark:text-branco'>Tema do App</Text>
                    {colorScheme === "dark" ? (
                        <MoonStarsIcon size={30} color="#C19200" />
                        ) : (
                        <SunDimIcon size={30} color="#C19200" />
                    )}
                </TouchableOpacity>
                
                <TouchableOpacity
                 className='items-center bg-input dark:bg-input-dark rounded-[20px] p-4 mt-[5%] flex-row justify-between'
                 style={[styles.sombra]}
                 onPress={() => navigation.navigate('Login')}
                >
                    <Text className='font-popRegular text-preto dark:text-branco text-[16px]'>Sair da Conta</Text>
                    <SignOutIcon size={30} color="#C19200"/>
                </TouchableOpacity>

                
                <TouchableOpacity
                 className='items-center bg-transparent border-amarelo border rounded-[20px] p-4 mt-[5%] flex-row justify-between'
                >
                    <Text className='font-popRegular text-amarelo text-[16px]'>Excluir Conta</Text>
                    <TrashSimpleIcon size={25} color="#C19200"/>
                </TouchableOpacity>

            </ScrollView>
            <NavBottom
                active="Perfil"
                onChange={(r) => navigation.navigate(r)} 
            />
        </View>
    )
}

const styles = StyleSheet.create({
  sombra: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
})