import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Nav } from '../components/nav';
import { Eye, EyeSlash } from 'phosphor-react-native';
import { NavBottom } from '../components/navBottom';
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { IconeDinamico } from '../components/iconeDinamico'
import { useColorScheme } from "nativewind";

export function Transacao() {
    const conta = { id: 1, saldo: '1000000.5' };
    const [mostrarValor, setMostrarValor] = useState(false);
    const [busca, setBusca] = useState('');
    const navigation = useNavigation();

    const { colorScheme, toggleColorScheme } = useColorScheme();
    const cor = colorScheme == 'dark' ? '#FAFAFA' : '#000';
    const primeiraCor = colorScheme == 'light' ? '#FAFAFA' : '#121212';
    const segundaCor = colorScheme == 'light' ? '#e3d097' : '#ad9f73';

    const pags = [
        { id: 1, dataProg: '2026-05-05 14:30', valor: '20.40', nome: 'Youtube Premium', tipo: 'saida'},
        { id: 2, dataProg: '2026-05-11 09:15', valor: '60.0', nome: 'Discord - Nitro', tipo: 'saida'},
        { id: 3, dataProg: '2026-05-05 18:00', valor: '10.99', nome: 'Google Photos', tipo: 'saida' },
        { id: 4, dataProg: '2026-05-01 09:03', valor: '1500.00', nome: 'Salário', tipo: 'entrada' },
        { id: 5, dataProg: '2026-04-15 11:20', valor: '350.00', nome: 'Freelance', tipo: 'entrada' },
        { id: 6, dataProg: '2026-04-22 20:15', valor: '45.90', nome: 'Spotify Premium', tipo: 'saida' }
    ];

    const transacoesFiltradas = pags.filter(transacao =>
        transacao.nome.toLowerCase().includes(busca.toLowerCase())
    );

    return(
        <View className='flex-1 bg-branco dark:bg-preto-dark'>
            <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 95 }} className='flex'>
                <Nav 
                    titulo={'Transações'}
                    placeholder="Buscar transações..." 
                    onSearch={(textoDigitado) => setBusca(textoDigitado)}
                />
                <View className='items-center px-2'>

                    <View style={styles.sombra} className="h-[100px] w-full mb-[5%]">
                        <LinearGradient
                            colors={[primeiraCor, segundaCor]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0.5, y: 0 }}
                            className="h-full w-full justify-between items-center py-2 px-4 relative overflow-hidden flex-row"
                            style={{ borderRadius: 20 }}
                        >
                            <View className="z-20">
                                <Text className="text-preto dark:text-branco font-popRegular text-[14px]">
                                    Saldo atual
                                </Text>
                                <Text className="mt-[-3%] text-preto dark:text-branco font-popRegular text-[22px]">
                                    R$ {mostrarValor ? formataDinheiro(conta.saldo) : '••••••'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                className='bg-branco dark:bg-preto-dark rounded-full p-2'
                                onPress={() => setMostrarValor(!mostrarValor)}
                            >
                                {mostrarValor ? (
                                    <Eye size={24} color={cor} />
                                ) : (
                                    <EyeSlash size={24} color={cor} />
                                )}
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                    
                    {transacoesFiltradas.map((item) => (
                        <View style={[styles.sombra]} key={item.id} className='bg-input dark:bg-input-dark flex-row items-center justify-between py-4 px-5 mt-[4%] w-full rounded-[20px]'>
                            <View className='flex-row items-center'> 
                                <View className='bg-branco rounded-full p-2'>
                                    <IconeDinamico nome={item.nome} tamanho={30} />
                                </View>
                                <View className='flex-col ml-[3%]'>
                                    <Text className='font-popRegular text-preto dark:text-branco text-[16px]'>{item.nome}</Text>
                                    <Text className='font-popRegular text-preto dark:text-branco text-[14px]'>{formataData(item.dataProg)}</Text>
                                </View>
                            </View>
                            <Text className={`font-popRegular text-[16px] ${item.tipo === 'entrada' ? 'text-[#006A1D]' : 'text-[#A4000D]'}`}>
                                {item.tipo === 'entrada' ? '+' : '-'}R$ {formataDinheiro(item.valor)}
                            </Text>
                        </View>
                    ))}

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

function formataData(dataString) {
    const [data, hora] = dataString.split(' ');
    const [ano, mes, dia] = data.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const mesFormatado = meses[parseInt(mes, 10) - 1];
    
    return `${dia} ${mesFormatado} ${ano}, ${hora}`;
}