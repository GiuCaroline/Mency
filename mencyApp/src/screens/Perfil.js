import { Text, View, ScrollView } from "react-native";
import { NavBottom } from "../components/navBottom";
import { Nav } from "../components/nav";
import { useNavigation } from "@react-navigation/native";

export function Perfil(){
    const navigation = useNavigation();
    return(
        <View className='flex-1 bg-branco dark:bg-preto-dark'>
            <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 95 }} className='flex'>
                <Nav 
                    titulo={'Perfil'}
                    placeholder="Buscar algo..." 
                    onSearch={(textoDigitado) => (console.log('Pesquisa: ', textoDigitado))}
                />
            </ScrollView>
            <NavBottom
                active="Perfil"
                onChange={(r) => navigation.navigate(r)} 
            />
        </View>
    )
}