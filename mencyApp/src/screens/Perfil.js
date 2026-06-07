import { Text, View, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { NavBottom } from "../components/navBottom";
import { Nav } from "../components/nav";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { useAuth } from '../context/AuthContext';
import { SunDimIcon, TrashSimpleIcon, SignOutIcon, MoonStarsIcon } from "phosphor-react-native";
import { formatCPF } from '../utils/financial.js';

export function Perfil(){
    const navigation = useNavigation();
    const { usuario, logout, deleteAccount } = useAuth();
    const { colorScheme, toggleColorScheme } = useColorScheme();

    const handleLogout = async () => {
        await logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Excluir Conta',
            'Tem certeza? Essa ação é irreversível e todos os seus dados serão apagados.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAccount();
                            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir a conta. Tente novamente.');
                        }
                    },
                },
            ]
        );
    };

    return(
        <View className='flex-1 bg-branco dark:bg-preto-dark'>
            <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 95 }} className='flex'>
                <Nav
                    titulo={'Perfil'}
                    placeholder="Buscar algo..."
                    onSearch={(textoDigitado) => console.log('Pesquisa: ', textoDigitado)}
                />

                <View className='bg-input dark:bg-input-dark rounded-[20px] p-4' style={styles.sombra}>
                    <Text className='font-popLight text-[13px] text-amarelo'>Nome:</Text>
                    <Text className='font-popRegular text-preto dark:text-branco text-[16px] ml-[2%]'>{usuario?.name}</Text>
                    <Text className='font-popLight text-[13px] text-amarelo'>CPF:</Text>
                    <Text className='font-popRegular text-[16px] ml-[2%] text-preto dark:text-branco'>
                       {formatCPF(usuario?.cpf)}
                    </Text>
                    <Text className='font-popLight text-[13px] text-amarelo'>Email:</Text>
                    <Text className='font-popRegular text-[16px] ml-[2%] text-preto dark:text-branco'>{usuario?.email}</Text>
                </View>

                <TouchableOpacity
                    className='items-center bg-input dark:bg-input-dark rounded-[20px] p-4 mt-[5%] flex-row justify-between'
                    style={styles.sombra}
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
                    style={styles.sombra}
                    onPress={handleLogout}
                >
                    <Text className='font-popRegular text-preto dark:text-branco text-[16px]'>Sair da Conta</Text>
                    <SignOutIcon size={30} color="#C19200"/>
                </TouchableOpacity>

                <TouchableOpacity
                    className='items-center bg-transparent border-amarelo border rounded-[20px] p-4 mt-[5%] flex-row justify-between'
                    onPress={handleDeleteAccount}
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
    );
}

const styles = StyleSheet.create({
  sombra: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
});