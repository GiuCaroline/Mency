import { Text, View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Nav } from '../components/nav';
import { Eye, EyeSlash } from 'phosphor-react-native';
import { NavBottom } from '../components/navBottom';
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect, useMemo } from "react";
import { IconeDinamico } from '../components/iconeDinamico'
import { useColorScheme } from "nativewind";
import { useAuth } from '../context/AuthContext';

export function Transacao() {
    const [mostrarValor, setMostrarValor] = useState(false);
    const [busca, setBusca] = useState('');
    const [mesesExibidos, setMesesExibidos] = useState(1);
    const [carregandoMais, setCarregandoMais] = useState(false);
    const [nomesExpandidos, setNomesExpandidos] = useState([]);
    
    const navigation = useNavigation();
    const { dadosFinanceiros, loadingFinanceiros, carregarDadosFinanceiros } = useAuth();

    const { colorScheme, toggleColorScheme } = useColorScheme();
    const cor = colorScheme == 'dark' ? '#FAFAFA' : '#000';
    const primeiraCor = colorScheme == 'light' ? '#FAFAFA' : '#121212';
    const segundaCor = colorScheme == 'light' ? '#e3d097' : '#ad9f73'; 

    useEffect(() => {
        carregarDadosFinanceiros();
    }, []);

    const saldoAtual = dadosFinanceiros?.totalSaldo || 0;
    const todasTransacoes = dadosFinanceiros?.todasTransacoes || [];

    const transacoesMapeadas = useMemo(() => {
        return todasTransacoes.map((t, index) => {
            const valor = Number(t.valor ?? t.amount ?? t.value ?? 0);
            return {
                id: t.id || index.toString(),
                dataProg: t.data || t.date || t.createdAt,
                valor: Math.abs(valor),
                nome: (t.descricao || t.description || t.merchant || 'Transação').trim(),
                tipo: valor > 0 ? 'entrada' : 'saida'
            };
        }).sort((a, b) => new Date(b.dataProg) - new Date(a.dataProg));
    }, [todasTransacoes]);

    const { gruposArray, temMais } = useMemo(() => {
        const isSearching = busca.trim() !== '';
        let filtradas = transacoesMapeadas;

        const chavesMeses = [...new Set(transacoesMapeadas.map(t => {
            const d = new Date(t.dataProg);
            return isNaN(d.getTime()) ? 'Desconhecido' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        }))];

        let podeCarregarMais = false;

        if (!isSearching) {
            const chavesVisiveis = chavesMeses.slice(0, mesesExibidos);
            filtradas = transacoesMapeadas.filter(t => {
                const d = new Date(t.dataProg);
                const chave = isNaN(d.getTime()) ? 'Desconhecido' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                return chavesVisiveis.includes(chave);
            });
            podeCarregarMais = mesesExibidos < chavesMeses.length;
        } else {
            filtradas = transacoesMapeadas.filter(transacao =>
                transacao.nome.toLowerCase().includes(busca.toLowerCase())
            );
        }

        const grupos = [];
        filtradas.forEach(item => {
            const dataCabecalho = formataDataCabecalho(item.dataProg);
            let grupo = grupos.find(g => g.data === dataCabecalho);
            if (!grupo) { grupo = { data: dataCabecalho, itens: [] }; grupos.push(grupo); }
            grupo.itens.push(item);
        });

        return { gruposArray: grupos, temMais: podeCarregarMais };
    }, [transacoesMapeadas, busca, mesesExibidos]);

    const toggleNome = (id) => {
        setNomesExpandidos(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    if (loadingFinanceiros && !dadosFinanceiros) {
        return (
            <View className='flex-1 bg-branco dark:bg-preto-dark items-center justify-center'>
                <ActivityIndicator size="large" color="#E8B635" />
            </View>
        );
    }

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
                                    R$ {mostrarValor ? formataDinheiro(saldoAtual) : '••••••'}
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
                    
                    {gruposArray.length > 0 ? gruposArray.map((grupo) => (
                        <View key={grupo.data} className="w-full mt-[4%]">
                            <Text className="font-popMedium text-[15px] text-[#9C9999] px-2">{grupo.data}</Text>
                            
                            {grupo.itens.map((item) => (
                                <View style={[styles.sombra]} key={item.id} className='bg-input dark:bg-input-dark flex-row items-center justify-between py-4 px-5 mt-[3%] w-full rounded-[20px]'>
                                    <View className='flex-row items-center flex-1 pr-2'> 
                                        <View className='bg-branco rounded-full p-2'>
                                            <IconeDinamico nome={item.nome} tamanho={30} />
                                        </View>
                                        <View className='flex-col ml-[3%] flex-1'>
                                            <TouchableOpacity onPress={() => toggleNome(item.id)}>
                                                <Text className='font-popRegular text-preto dark:text-branco text-[16px] flex-wrap'>
                                                    {nomesExpandidos.includes(item.id) ? item.nome : formataNome(item.nome)}
                                                </Text>
                                            </TouchableOpacity>
                                            <Text className='font-popRegular text-preto dark:text-branco text-[14px]'>{formataData(item.dataProg)}</Text>
                                        </View>
                                    </View>
                                    <Text className={`font-popRegular text-[16px] ${item.tipo === 'entrada' ? 'text-[#006A1D]' : 'text-[#A4000D]'}`}>
                                        {item.tipo === 'entrada' ? '+' : '-'}R$ {formataDinheiro(item.valor)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )) : (
                        <Text className="text-[#9C9999] font-popRegular mt-[10%] text-[16px] text-center w-full">
                            Nenhuma transação encontrada.
                        </Text>
                    )}

                    {temMais && (
                        <TouchableOpacity 
                            className="mt-[8%] mb-[4%] items-center justify-center py-3 border border-[#C19200] w-[60%] rounded-full self-center"
                            disabled={carregandoMais}
                            onPress={() => {
                                setCarregandoMais(true);
                                setTimeout(() => {
                                    setMesesExibidos(prev => prev + 1);
                                    setCarregandoMais(false);
                                }, 400); 
                            }}
                        >
                            {carregandoMais ? (
                                <ActivityIndicator size="small" color="#C19200" />
                            ) : (
                                <Text className="font-popMedium text-[#C19200] text-[14px]">Ver mais</Text>
                            )}
                        </TouchableOpacity>
                    )}

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
    if (!dataString) return '';
    const date = new Date(dataString);
    if (isNaN(date.getTime())) return dataString;

    const dia = String(date.getDate()).padStart(2, '0');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const mesFormatado = meses[date.getMonth()];
    const ano = date.getFullYear();
    const hora = String(date.getHours()).padStart(2, '0');
    const minuto = String(date.getMinutes()).padStart(2, '0');
    
    return `${dia} ${mesFormatado} ${ano}, ${hora}:${minuto}`;
}

function formataDataCabecalho(dataString) {
    if (!dataString) return '';
    const date = new Date(dataString);
    if (isNaN(date.getTime())) return dataString;

    const dia = String(date.getDate()).padStart(2, '0');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const mesFormatado = meses[date.getMonth()];
    const ano = date.getFullYear();
    
    return `${dia} ${mesFormatado} ${ano}`;
}

function formataNome(nome) {
    if (!nome) return '';
    const partes = nome.trim().split(" ");
    
    if (partes.length > 2) {
        return partes.slice(0, 2).join(" ") + "...";
    }
    
    return nome;
}