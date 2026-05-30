import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Nav } from '../components/nav';
import { Eye, EyeSlash } from 'phosphor-react-native';
import { NavBottom } from '../components/navBottom';
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { IconeDinamico } from '../components/iconeDinamico'

export function Transacao() {
    const conta = { id: 1, saldo: '1000000.5' };
    const [mostrarValor, setMostrarValor] = useState(false);
    const navigation = useNavigation();

    const pags = [
        { id: 1, dataProg: '2026-05-28', valor: '20.40', nome: 'Youtube Premium' },
        { id: 2, dataProg: '2026-06-11', valor: '60.0', nome: 'Discord - Nitro' },
        { id: 3, dataProg: '2026-08-05', valor: '10.99', nome: 'Google Photos' }
    ];


    return(
        <View className='flex-1 bg-branco dark:bg-preto-dark'>
            <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 95 }} className='flex'>
                <Nav 
                    titulo={'Transações'}
                    placeholder="Buscar tansações..." 
                    onSearch={(textoDigitado) => console.log("Pesquisando por:", textoDigitado)}
                />
                <View className='items-center px-2'>

                    <View style={styles.sombra} className="h-[100px] w-full">
                        <LinearGradient
                            colors={['#FAFAFA', '#e3d097']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0.5, y: 0 }}
                            className="h-full w-full justify-between items-center py-2 px-4 relative overflow-hidden flex-row"
                            style={{ borderRadius: 20 }}
                        >
                            <View className="z-20">
                                <Text className="text-preto font-popRegular text-[14px]">
                                    Saldo atual
                                </Text>
                                <Text className="mt-[-3%] text-preto font-popRegular text-[22px]">
                                    R$ {mostrarValor ? formataDinheiro(conta.saldo) : '••••••'}
                                </Text>
                            </View>
                            <TouchableOpacity
                            className='bg-branco dark:bg-preto-dark rounded-full p-2'
                            onPress={() => setMostrarValor(!mostrarValor)}
                            >
                                {mostrarValor ? (
                                    <Eye size={24} color="#000" />
                                ) : (
                                    <EyeSlash size={24} color="#000" />
                                )}
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                    
                    {trasacoes}
                    <View>
                        <IconeDinamico nome={pags.nome[0]} />
                    </View>

                </View>
            </ScrollView>
            <NavBottom
                active="Transacao"
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

function formataDinheiro(value) {
  const numero = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numero)) {
    return "0,00";
  }

  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}