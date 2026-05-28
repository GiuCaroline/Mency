import { ScrollView, Text, View } from "react-native";
import { Nav } from '../components/nav';
import { NavBottom } from '../components/navBottom';

export function Transacao() {
    return(
        <View className='flex-1 bg-branco dark:bg-preto-dark'>
            <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 95 }} className='flex'>
                <Nav 
                    titulo={'Transações'}
                    placeholder="Buscar tansações..." 
                    onSearch={(textoDigitado) => console.log("Pesquisando por:", textoDigitado)}
                />
            </ScrollView>
            <NavBottom
                active="Transacao"
                onChange={(r) => navigation.navigate(r)} 
            />
        </View>
    )
}