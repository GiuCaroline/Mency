import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Nav } from "../components/nav";
import { NavBottom } from "../components/navBottom";
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeSlash, YoutubeLogoIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { useNavigation } from "@react-navigation/native";
import { IconeDinamico } from '../components/iconeDinamico';

function calcularDias(dataAlvo) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const partesData = dataAlvo.split('-');
  const data = new Date(partesData[0], partesData[1] - 1, partesData[2]);
  
  const diferencaTempo = data.getTime() - hoje.getTime();
  return Math.ceil(diferencaTempo / (1000 * 3600 * 24));
}

function obterProximosPagamentos(pagamentos) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const filtrados = pagamentos.filter(pag => {
    const partes = pag.dataProg.split('-');
    const dataPag = new Date(partes[0], partes[1] - 1, partes[2]);
    return dataPag >= hoje;
  });

  filtrados.sort((a, b) => {
    const partesA = a.dataProg.split('-');
    const partesB = b.dataProg.split('-');
    const dataA = new Date(partesA[0], partesA[1] - 1, partesA[2]);
    const dataB = new Date(partesB[0], partesB[1] - 1, partesB[2]);
    return dataA - dataB;
  });

  return filtrados.slice(0, 2);
}

export function Home() {
  const conta = { id: 1, saldo: '1000000.5' };
  
  const pags = [
    { id: 1, dataProg: '2026-06-05', valor: '20.40', nome: 'Youtube Premium' },
    { id: 2, dataProg: '2026-06-11', valor: '60.0', nome: 'Discord - Nitro' },
    { id: 3, dataProg: '2026-08-05', valor: '10.99', nome: 'Google Photos' }
  ];

  const [mostrarValor, setMostrarValor] = useState(false);
  const navigation = useNavigation();

  const proximosPagamentos = obterProximosPagamentos(pags);

  return (
    <View className='flex-1 bg-branco dark:bg-preto-dark'>
      <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 95 }} className='flex'>
        <Nav 
          placeholder="Buscar pelo nome..." 
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

          <View className='flex-row justify-between items-center w-full mt-[8%]'>
            <Text className='font-popMedium text-[18px] text-preto dark:text-branco'>Pagamentos futuros</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Futuro')}
            >
              <Text className='font-popRegular text-[14px] text-[#9C9999]' >Ver tudo</Text>
            </TouchableOpacity>
          </View>

          <View className='flex-row w-full items-center justify-center mt-[2%] gap-5' style={[styles.sombra]}>
            {proximosPagamentos.map((pag) => (
              <View key={pag.id} className='flex-col bg-input p-4 w-[45%] py-6 rounded-[20px]'>
                <View className='bg-branco rounded-full p-2 items-center w-[40px]'>
                  <IconeDinamico nome={pag.nome} />
                </View>
                <Text className='font-popMedium mt-[3%] text-[15px] text-preto'>{pag.nome}</Text>
                <Text className='font-popMedium text-[15px] text-preto mt-[2%]'>
                  ${formataDinheiro(pag.valor)}
                  <Text className='font-popRegular text-[11px]'>/mês</Text>
                </Text>
                <Text className='font-popRegular text-[13px] mt-[2%]'>
                  Daqui {calcularDias(pag.dataProg)} dias
                </Text>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>
      
      <NavBottom
        active="Home"
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