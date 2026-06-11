import { ScrollView, Text, View, StyleSheet, PanResponder, ActivityIndicator } from "react-native";
import { NavBottom } from "../components/navBottom";
import { Nav } from "../components/nav";
import { useNavigation } from "@react-navigation/native";
import { CustomCalendar } from "../components/customCalendar";
import { MonthHeader } from "../components/monthHeader";
import { useState, useRef, useEffect } from "react";
import { IconeDinamico } from '../components/iconeDinamico';
import { useColorScheme } from "nativewind";
import { listAccounts, getAccountTransactions } from '../api/pluggy';
import { normalizeListResponse, normalizeTransactionsResponse } from '../utils/financial';

function calcularDias(dataAlvo) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const partesData = dataAlvo.split('-');
    const data = new Date(partesData[0], partesData[1] - 1, partesData[2]);
    
    const diferencaTempo = data.getTime() - hoje.getTime();
    return Math.ceil(diferencaTempo / (1000 * 3600 * 24));
}

function formataData(dataString) {
    const partes = dataString.split(' ');
    const data = partes[0];
    const [ano, mes, dia] = data.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const mesFormatado = meses[parseInt(mes, 10) - 1];
    
    return `${dia} ${mesFormatado}`;
}

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

export function Futuro() {
    const [termoBusca, setTermoBusca] = useState("");
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const { colorScheme } = useColorScheme();
    const cor = colorScheme == 'dark' ? '#FAFAFA' : '#000';

    const coresPadroes = [
        '#E8B635', 
        '#B2821A', 
        '#8D6409', 
        '#634401', 
        colorScheme == 'dark' ? '#5f4a1d' : '#3F2B00', 
        '#F4C430', 
        '#D4AF37', 
        '#AA6C39'  
    ];

    const corPadrao = "#C19200";

    const navigation = useNavigation();
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [selected, setSelected] = useState(null);

    const getTextColor = (dias) => {
        if (dias >= 0 && dias <= 4) return coresPadroes[dias];
        return cor;
    };

    const getIconColor = (dias) => {
        if (dias >= 0 && dias <= 4) return coresPadroes[dias];
        return '#000';
    };

    useEffect(() => {
        async function buscarEPreverTransacoes() {
            try {
                const respostaContas = await listAccounts();
                const contas = normalizeListResponse(respostaContas);

                let todasTransacoes = [];
                const dataLimite = new Date();
                dataLimite.setMonth(dataLimite.getMonth() - 3);
                const stringDataFrom = dataLimite.toISOString().split('T')[0];

                for (const conta of contas) {
                    const respostaTx = await getAccountTransactions(conta.id, { dateFrom: stringDataFrom });
                    const transacoesConta = normalizeTransactionsResponse(respostaTx);
                    todasTransacoes = [...todasTransacoes, ...transacoesConta];
                }

                const gruposDescricao = {};
                todasTransacoes.forEach(t => {
                    const valor = Number(t.valor ?? t.amount ?? t.value ?? 0);
                    if (valor > 0) return; 

                    const descricao = (t.descricao || t.description || t.merchant || 'Desconhecido').trim();
                    if (!gruposDescricao[descricao]) gruposDescricao[descricao] = [];
                    gruposDescricao[descricao].push({
                        ...t,
                        amount: valor,
                        date: new Date(t.data || t.date || t.createdAt)
                    });
                });

                const previsoes = [];
                let contadorId = 1;

                for (const desc in gruposDescricao) {
                    const transacoes = gruposDescricao[desc];
                    
                    if (transacoes.length >= 2) {
                        transacoes.sort((a, b) => a.date - b.date);
                        const ultimasDuas = transacoes.slice(-2);
                        
                        const mes1 = ultimasDuas[0].date.getMonth();
                        const mes2 = ultimasDuas[1].date.getMonth();

                        if (mes1 !== mes2) {
                            const somaDias = ultimasDuas.reduce((acc, t) => acc + t.date.getDate(), 0);
                            const diaMedio = Math.round(somaDias / 2);
                            
                            const somaValores = ultimasDuas.reduce((acc, t) => acc + t.amount, 0);
                            const valorMedio = Math.abs(somaValores / 2);

                            // Inclui mês anterior (-1) até os 2 próximos meses para contabilizar também os passados na visualização do calendário
                            for (let i = -1; i <= 2; i++) {
                                const dataFutura = new Date(today.getFullYear(), today.getMonth() + i, diaMedio);
                                const ano = dataFutura.getFullYear();
                                const mes = String(dataFutura.getMonth() + 1).padStart(2, '0');
                                const dia = String(dataFutura.getDate()).padStart(2, '0');
                                const dataProgStr = `${ano}-${mes}-${dia}`;

                                previsoes.push({
                                    id: contadorId++,
                                    dataProg: dataProgStr,
                                    valor: valorMedio.toFixed(2),
                                    nome: desc,
                                    diaExibicao: dataProgStr,
                                    color: corPadrao
                                });
                            }
                        }
                    }
                }

                setEventos(previsoes);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        buscarEPreverTransacoes();
    }, []);

    function handleSearch(texto) {
        setTermoBusca(texto);
        
        if (texto.trim() === "") {
            setSelected(null);
            return;
        }

        const primeiroMatch = eventos.find(event => 
            event.nome.toLowerCase().includes(texto.toLowerCase())
        );

        if (primeiroMatch) {
            const partes = primeiroMatch.diaExibicao.split('-');
            setMonth(parseInt(partes[1], 10) - 1);
            setYear(parseInt(partes[0], 10));
            setSelected(null);
        } else {
            setSelected(null);
        }
    }

    const eventsByDate = eventos.reduce((acc, event) => {
        if (!event || !event.diaExibicao) return acc;

        if (termoBusca && !event.nome.toLowerCase().includes(termoBusca.toLowerCase())) {
            return acc;
        }

        if (!acc[event.diaExibicao]) {
            acc[event.diaExibicao] = [];
        }
        acc[event.diaExibicao].push(event.color || corPadrao);
        return acc;
    }, {});

   const filteredEvents = eventos.filter(event => {
        if (!event || !event.diaExibicao) return false;

        const dias = calcularDias(event.dataProg);

        if (selected) {
            return event.diaExibicao === selected;
        }

        if (termoBusca) {
            return event.nome.toLowerCase().includes(termoBusca.toLowerCase());
        }

        // Caso normal (sem dia específico selecionado): esconde os que já passaram (dias < 0) e restringe ao mês
        return (
            dias >= 0 &&
            event.diaExibicao.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)
        );
    }).sort((a, b) => {
        // Ordena pela data: os mais próximos (ou que já passaram mas estão selecionados) aparecem primeiro
        return calcularDias(a.dataProg) - calcularDias(b.dataProg);
    });

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onStartShouldSetPanResponderCapture: () => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return Math.abs(gestureState.dx) > 30 && Math.abs(gestureState.dy) < 20;
            },
            onPanResponderTerminationRequest: () => true,
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dx > 60) {
                    setMonth(prevMonth => {
                        if (prevMonth === 0) {
                            setYear(prevYear => prevYear - 1);
                            return 11;
                        }
                        return prevMonth - 1;
                    });
                }
                else if (gestureState.dx < -60) {
                    setMonth(prevMonth => {
                        if (prevMonth === 11) {
                            setYear(prevYear => prevYear + 1);
                            return 0;
                        }
                        return prevMonth + 1;
                    });
                }
            },
            onPanResponderTerminate: () => {}
        })
    ).current;

    return (
        <View className='flex-1 bg-branco dark:bg-preto-dark'>
            <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 95 }} className='flex'>
                <Nav 
                    titulo={'Pag. Futuros'}
                    placeholder="Buscar pagamentos..." 
                    onSearch={handleSearch}
                />
                
                <View className='items-center'>
                    <MonthHeader
                        month={month}
                        year={year}
                        setMonth={setMonth}
                        setYear={setYear}
                    />
                </View>

                <View {...panResponder.panHandlers}>
                    <CustomCalendar
                        month={month}
                        year={year}
                        selected={selected} 
                        onSelectDay={(date) => {
                            if (selected === date) {
                                setSelected(null); 
                            } else {
                                setSelected(date);
                            }
                        }}
                        events={eventsByDate}
                    />
                </View>
                
                <View className='w-full items-center'>
                    {loading ? (
                        <ActivityIndicator size="large" color={corPadrao} style={{ marginTop: 20 }} />
                    ) : filteredEvents.length > 0 ? (
                        filteredEvents.map((event, index) => {
                            const dias = calcularDias(event.dataProg);
                            const textColor = getTextColor(dias);
                            
                            return (
                                <View
                                    key={`${event.id}-${index}`}
                                    style={[styles.sombra]}
                                    className='bg-input dark:bg-input-dark flex-row items-center justify-between py-4 px-5 mt-[3%] w-[95%] rounded-[20px]'
                                >
                                    <View className='flex-row items-center w-full'> 
                                        <View className='bg-branco rounded-full p-2'>
                                            <IconeDinamico 
                                                nome={event.nome} 
                                                cor={getIconColor(dias)} 
                                                tamanho={30}
                                            />
                                        </View>
                                        <View className='flex-col ml-[3%] flex-1'>
                                            <View className='flex-row justify-between w-full'>  
                                                <Text 
                                                    className='font-popRegular text-[16px]' 
                                                    style={{ color: textColor }}
                                                    numberOfLines={1}
                                                >
                                                    {event.nome}
                                                </Text>

                                                {/* Renderiza as informações de dias apenas se for futuro ou hoje */}
                                                {dias >= 0 && (
                                                    <Text
                                                        className='font-popRegular text-[13px] mt-[2%]'
                                                        style={{ color: textColor }}
                                                    >
                                                        {dias === 0 ? 'Hoje' : `${dias} dias`}
                                                    </Text>
                                                )}
                                            </View>
                                            <View className='flex-row justify-between w-full mt-1'>
                                                <Text className='font-popRegular text-[14px]' style={{ color: textColor }}>
                                                    R${formataDinheiro(event.valor)}
                                                </Text>
                                                
                                                <Text className='font-popRegular text-[14px]' style={{ color: textColor }}>
                                                    {formataData(event.dataProg)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <Text className="text-center text-cinza mt-[10%] font-popLight">
                            Nenhum pagamento encontrado
                        </Text>
                    )}
                </View>

            </ScrollView>
            <NavBottom
                active="Futuro"
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