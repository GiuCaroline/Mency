import { Text, View, ScrollView, StyleSheet } from "react-native";
import { Nav } from "../components/nav";
import { LinearGradient } from 'expo-linear-gradient';

export function Home(){
  const conta = {id: 1, saldo: '1000.5'};

    return(
        <View className='flex-1 bg-branco dark:bg-preto-dark'>
            <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 95 }} className='flex'>
                <Nav 
                    placeholder="Buscar pelo nome..." 
                    onSearch={(textoDigitado) => console.log("Pesquisando por:", textoDigitado)}
                />
                <View className='items-center px-2'>

                    <View style={styles.sombra} className="h-[70%] w-full">
                        <LinearGradient
                            colors={['#FAFAFA', '#e3d097']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0.5, y: 0 }}
                            className="h-full w-full justify-center py-2 px-4 relative overflow-hidden"
                            style={{ borderRadius: 20 }}
                        >
                            <View className="z-20">
                                <Text className="text-preto font-popRegular text-[14px]">
                                    Saldo atual
                                </Text>
                                <Text className="mt-[-3%] text-preto font-popRegular text-[22px]">
                                    R$ {conta.saldo}
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}



const styles = StyleSheet.create({
  shadow: {
    // iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,

    // Android
    elevation: 20,
  },
})