import { ScrollView, Text, View, StyleSheet, PanResponder } from "react-native";
import { NavBottom } from "../components/navBottom";
import { Nav } from "../components/nav";
import { useNavigation } from "@react-navigation/native";
import { CustomCalendar } from "../components/customCalendar";
import { MonthHeader } from "../components/monthHeader";
import { useState, useRef } from "react";
import { IconeDinamico } from '../components/iconeDinamico';
import { useColorScheme } from "nativewind";

function calcularDias(dataAlvo) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const partesData = dataAlvo.split('-');
    const data = new Date(partesData[0], partesData[1] - 1, partesData[2]);
    
    const diferencaTempo = data.getTime() - hoje.getTime();
    return Math.ceil(diferencaTempo / (1000 * 3600 * 24));
}

export function Futuro() {
    const [termoBusca, setTermoBusca] = useState("");
    
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const cor = colorScheme == 'dark' ? '#FAFAFA' : '#000';

    const coresPadroes = [
        '#E8B635', 
        '#B2821A', 
        '#8D6409', 
        '#634401', 
        '#3F2B00', 
        '#F4C430', 
        '#D4AF37', 
        '#AA6C39'  
    ];

    const pags = [
        { id: 1, dataProg: '2026-06-05', valor: '20.40', nome: 'Youtube Premium' },
        { id: 2, dataProg: '2026-06-11', valor: '60.0', nome: 'Discord - Nitro' },
        { id: 3, dataProg: '2026-08-05', valor: '10.99', nome: 'Google Photos' },
        { id: 4, dataProg: '2026-06-26', valor: '20.40', nome: 'Youtube Premium' },
        { id: 5, dataProg: '2026-07-26', valor: '20.40', nome: 'Youtube Premium' }
    ];

    const corPadrao = "#C19200";

    const navigation = useNavigation();
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [selected, setSelected] = useState(null);

    const [eventos, setEventos] = useState(
        pags.map(pag => ({
            ...pag,
            diaExibicao: pag.dataProg,
            color: pag.color || corPadrao
        }))
    );

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

        if (termoBusca) {
            return (
                dias >= 0 &&
                event.nome.toLowerCase().includes(termoBusca.toLowerCase())
            );
        }

        if (selected) {
            return event.diaExibicao === selected;
        }

        return (
            dias >= 0 &&
            event.diaExibicao.startsWith(
                `${year}-${String(month + 1).padStart(2, "0")}`
            )
        );
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
                    {filteredEvents.map((event, index) => (
                        <View
                            key={`${event.id}-${index}`}
                            style={[styles.sombra]}
                            className='bg-input dark:bg-input-dark flex-row items-center justify-between py-4 px-5 mt-[3%] w-[95%] rounded-[20px]'
                        >
                            <View className='flex-row items-center w-full'> 
                                <View className='bg-branco rounded-full p-2'>
                                    <IconeDinamico nome={event.nome} cor={calcularDias(event.dataProg) == 4
                                        ? coresPadroes[4]
                                        : calcularDias(event.dataProg) == 3
                                        ? coresPadroes[3]
                                        : calcularDias(event.dataProg) == 2
                                        ? coresPadroes[2]
                                        : calcularDias(event.dataProg) == 1
                                        ? coresPadroes[1]
                                        : calcularDias(event.dataProg) == 0
                                        ? coresPadroes[0]
                                        : undefined} tamanho={30}
                                    />
                                </View>
                                <View className='flex-col ml-[3%]'>
                                    <View className='flex-row justify-between w-[92%]'>  
                                        <Text className='font-popRegular text-[16px]' style={{
                                            color: calcularDias(event.dataProg) == 4
                                            ? coresPadroes[4]
                                            : calcularDias(event.dataProg) == 3
                                            ? coresPadroes[3]
                                            : calcularDias(event.dataProg) == 2
                                            ? coresPadroes[2]
                                            : calcularDias(event.dataProg) == 1
                                            ? coresPadroes[1]
                                            : calcularDias(event.dataProg) == 0
                                            ? coresPadroes[0]
                                            : cor
                                        }}>{event.nome}</Text>

                                        {calcularDias(event.dataProg) >= 0 && (
                                            <Text
                                                className='font-popRegular text-[13px] mt-[2%]'
                                                style={{
                                                    color:
                                                        calcularDias(event.dataProg) == 4 ? coresPadroes[4] :
                                                        calcularDias(event.dataProg) == 3 ? coresPadroes[3] :
                                                        calcularDias(event.dataProg) == 2 ? coresPadroes[2] :
                                                        calcularDias(event.dataProg) == 1 ? coresPadroes[1] :
                                                        calcularDias(event.dataProg) == 0 ? coresPadroes[0] :
                                                        cor
                                                }}
                                            >
                                                {calcularDias(event.dataProg) === 0
                                                    ? 'Hoje'
                                                    : `${calcularDias(event.dataProg)} dias`}
                                            </Text>
                                        )}
                                    </View>
                                    <View className='flex-row justify-between w-[92%]'>
                                        <Text className='font-popRegular text-[14px]' style={{
                                            color: calcularDias(event.dataProg) == 4
                                            ? coresPadroes[4]
                                            : calcularDias(event.dataProg) == 3
                                            ? coresPadroes[3]
                                            : calcularDias(event.dataProg) == 2
                                            ? coresPadroes[2]
                                            : calcularDias(event.dataProg) == 1
                                            ? coresPadroes[1]
                                            : calcularDias(event.dataProg) == 0
                                            ? coresPadroes[0]
                                            : cor
                                        }}>R${formataDinheiro(event.valor)}</Text>
                                        
                                        <Text className='font-popRegular text-[14px]' style={{
                                            color: calcularDias(event.dataProg) == 4
                                            ? coresPadroes[4]
                                            : calcularDias(event.dataProg) == 3
                                            ? coresPadroes[3]
                                            : calcularDias(event.dataProg) == 2
                                            ? coresPadroes[2]
                                            : calcularDias(event.dataProg) == 1
                                            ? coresPadroes[1]
                                            : calcularDias(event.dataProg) == 0
                                            ? coresPadroes[0]
                                            : cor
                                        }}>{formataData(event.dataProg)}</Text>
                                    </View>
                                </View>
                            </View>
                            <View className='flex-1 ml-[3%]'>
                            </View>
                        </View>
                    ))}

                    {filteredEvents.length === 0 && (
                        <Text className="text-center text-cinza mt-[10%] font-popLight">
                        Nenhum evento encontrado
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

function formataData(dataString) {
    const [data, hora] = dataString.split(' ');
    const [ano, mes, dia] = data.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const mesFormatado = meses[parseInt(mes, 10) - 1];
    
    return `${dia} ${mesFormatado}`;
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