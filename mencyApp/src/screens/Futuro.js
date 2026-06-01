import { ScrollView, Text, View } from "react-native";
import { NavBottom } from "../components/navBottom";
import { Nav } from "../components/nav";

export function Futuro() {
    return(
        <View className='flex-1 bg-branco dark:bg-preto-dark'>
            <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 95 }} className='flex'>
                <Nav 
                    titulo={'Pag. Futuros'}
                    placeholder="Buscar pagamentos..." 
                    onSearch={(textoDigitado) => console.log("Pesquisa: ", textoDigitado)}
                />
            </ScrollView>
            <NavBottom
                active="Futuro"
                onChange={(r) => navigation.navigate(r)} 
            />
        </View>
    )
}