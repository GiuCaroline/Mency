import { Text, View, ScrollView } from "react-native";
import { Nav } from "../components/nav"

export function Home(){
    return(
        <View className='flex-1 bg-branco dark:bg-preto-dark'>
            <ScrollView contentContainerStyle={{ padding: 10,  paddingBottom: 95 }} className='flex'>
                <Nav />
                <View className='items-center'>
                    <Text>oiiiiiiiiiiii</Text>
                </View>
            </ScrollView>
        </View>
    )
}