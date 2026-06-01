import { Text, View, ScrollView, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Nav } from "../components/nav";
import { NavBottom } from "../components/navBottom";
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeSlash, WarningCircle } from 'phosphor-react-native';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigation } from "@react-navigation/native";
import { IconeDinamico } from '../components/iconeDinamico';
import { DropdownMeses } from '../components/dropdown';
import Svg, { Path, G, Circle, Line, Text as SvgText } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

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

  return filtrados;
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

function coordenadasPolares(cx, cy, r, anguloGraus) {
  const anguloRadianos = (anguloGraus - 90) * Math.PI / 180.0;
  return {
    x: cx + (r * Math.cos(anguloRadianos)),
    y: cy + (r * Math.sin(anguloRadianos))
  };
}

function criarArco(cx, cy, r, anguloInicial, anguloFinal) {
  const inicio = coordenadasPolares(cx, cy, r, anguloFinal);
  const fim = coordenadasPolares(cx, cy, r, anguloInicial);
  const arcoMaior = anguloFinal - anguloInicial <= 180 ? "0" : "1";
  return [
    "M", inicio.x, inicio.y,
    "A", r, r, 0, arcoMaior, 0, fim.x, fim.y
  ].join(" ");
}

function FatiaAnimada({ isElevada, anguloMeio, cor, caminho }) {
  const animacao = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animacao, {
      toValue: isElevada ? 1 : 0,
      friction: 6,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [isElevada]);

  const deslocamentoMaximo = 10; 
  const radianos = (anguloMeio - 90) * Math.PI / 180.0;
  
  const translateX = animacao.interpolate({
    inputRange: [0, 1],
    outputRange: [0, deslocamentoMaximo * Math.cos(radianos)]
  });
  
  const translateY = animacao.interpolate({
    inputRange: [0, 1],
    outputRange: [0, deslocamentoMaximo * Math.sin(radianos)]
  });

  return (
    <AnimatedG style={{ transform: [{ translateX }, { translateY }] }}>
      <Path 
        d={caminho} 
        stroke="rgba(0,0,0,0.15)" 
        strokeWidth="20" 
        fill="none" 
        transform="translate(0, 4)" 
      />
      <Path 
        d={caminho} 
        stroke={cor} 
        strokeWidth="20" 
        fill="none" 
      />
    </AnimatedG>
  );
}

export function Home() {
  const conta = { id: 1, saldo: '1000000.5' };
  
  const pags = [
    { id: 1, dataProg: '2026-06-05', valor: '20.40', nome: 'Youtube Premium' },
    { id: 2, dataProg: '2026-06-11', valor: '60.0', nome: 'Discord - Nitro' },
    { id: 3, dataProg: '2026-08-05', valor: '10.99', nome: 'Google Photos' }
  ];

  const dadosMockadosGastos = {
    'atual': [
      { id: 1, categoria: 'Alimentação', valor: 850 },
      { id: 2, categoria: 'Streaming', valor: 420 },
      { id: 3, categoria: 'Transporte', valor: 380 },
      { id: 4, categoria: 'Compras', valor: 300 },
      { id: 5, categoria: 'Estudos', valor: 170 },
    ],
    '2026-3': [
      { id: 1, categoria: 'Alimentação', valor: 600 },
      { id: 3, categoria: 'Transporte', valor: 450 },
      { id: 4, categoria: 'Compras', valor: 250 },
    ]
  };

  const dadosMockadosSalario = {
    'atual': {
      apenasSalario: { gasto: 2120, total: 3100 },
      todasEntradas: { gasto: 2120, total: 3950 }
    },
    '2026-3': {
      apenasSalario: { gasto: 1800, total: 3100 },
      todasEntradas: { gasto: 1800, total: 3400 }
    }
  };

  const dadosDashboardAdicionais = {
    frequenciaNegativos: [
      { mes: 'Jan', valor: 20 },
      { mes: 'Fev', valor: 40 },
      { mes: 'Mar', valor: 60 },
      { mes: 'Abr', valor: 40 },
      { mes: 'Mai', valor: 20 },
      { mes: 'Jun', valor: 0 }
    ],
    sobras: {
      atual: 1030,
      media6Meses: 890
    },
    previsao: {
      saldo: -320,
      dataAviso: '28/06'
    }
  };

  const [mostrarValor, setMostrarValor] = useState(false);
  const [mesSelecionadoGastos, setMesSelecionadoGastos] = useState('atual');
  const [mesSelecionadoSalario, setMesSelecionadoSalario] = useState('atual');
  const [categoriaElevada, setCategoriaElevada] = useState(null);
  
  const [termoBusca, setTermoBusca] = useState("");

  const navigation = useNavigation();

  const proximosPagamentos = useMemo(() => {
    let filtrados = obterProximosPagamentos(pags);
    
    if (termoBusca.trim() !== "") {
        filtrados = filtrados.filter(pag => 
            pag.nome.toLowerCase().includes(termoBusca.toLowerCase())
        );
    }
    
    return filtrados.slice(0, 2);
  }, [termoBusca]);

  function lidarComMudancaMesGastos(valorDoMes) {
    setMesSelecionadoGastos(valorDoMes);
    setCategoriaElevada(null); 
  }

  function lidarComMudancaMesSalario(valorDoMes) {
    setMesSelecionadoSalario(valorDoMes);
  }

  const dadosGastoMes = dadosMockadosGastos[mesSelecionadoGastos] || [];
  const totalGasto = dadosGastoMes.reduce((acc, item) => acc + item.valor, 0);

  let anguloAcumulado = 0;
  const fatiasGrafico = dadosGastoMes.map((item, index) => {
    const porcentagem = (item.valor / totalGasto) * 100;
    const anguloFatia = (porcentagem / 100) * 360;
    const anguloInicial = anguloAcumulado;
    const anguloFinal = anguloAcumulado + anguloFatia;
    
    anguloAcumulado += anguloFatia;
    const anguloMeio = anguloInicial + (anguloFatia / 2);
    
    const caminho = criarArco(90, 90, 55, anguloInicial, anguloFinal);
    const corSelecionada = coresPadroes[index % coresPadroes.length];

    return {
      ...item,
      cor: corSelecionada,
      porcentagem,
      anguloMeio,
      caminho
    };
  });

  const dadosSalarioMes = dadosMockadosSalario[mesSelecionadoSalario] || dadosMockadosSalario['atual'];
  const pctApenasSalario = Math.round((dadosSalarioMes.apenasSalario.gasto / dadosSalarioMes.apenasSalario.total) * 100);
  const pctTodasEntradas = Math.round((dadosSalarioMes.todasEntradas.gasto / dadosSalarioMes.todasEntradas.total) * 100);

  const larguraLinha = 280;
  const alturaLinha = 60;
  const offsetLinhaX = 30;
  const offsetLinhaY = 20;

  const pontosGraficoLinha = dadosDashboardAdicionais.frequenciaNegativos.map((d, i) => {
    const x = offsetLinhaX + (i * (larguraLinha / (dadosDashboardAdicionais.frequenciaNegativos.length - 1)));
    const y = offsetLinhaY + (alturaLinha - ((d.valor / 100) * alturaLinha));
    return { x, y, ...d };
  });

  const caminhoLinha = pontosGraficoLinha.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <View className='flex-1 bg-branco dark:bg-preto-dark'>
      <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 95 }} className='flex'>
        <Nav 
          placeholder="Buscar pagamentos..." 
          onSearch={(textoDigitado) => setTermoBusca(textoDigitado)}
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
            <TouchableOpacity onPress={() => navigation.navigate('Futuro')}>
              <Text className='font-popRegular text-[14px] text-[#9C9999]' >Ver tudo</Text>
            </TouchableOpacity>
          </View>

          <View className='flex-row w-full items-center justify-center mt-[2%] gap-5 flex-wrap'>
            {proximosPagamentos.length > 0 ? (
                proximosPagamentos.map((pag) => (
                <View key={pag.id} className='flex-col bg-input p-4 w-[45%] py-6 rounded-[20px]' style={[styles.sombra]}>
                  <View className='bg-branco rounded-full p-2 items-center w-[40px]'>
                    <IconeDinamico nome={pag.nome} cor={calcularDias(pag.dataProg) == 4
                      ? coresPadroes[4]
                      : calcularDias(pag.dataProg) == 3
                      ? coresPadroes[3]
                      : calcularDias(pag.dataProg) == 2
                      ? coresPadroes[2]
                      : calcularDias(pag.dataProg) == 1
                      ? coresPadroes[1]
                      : calcularDias(pag.dataProg) == 0
                      ? coresPadroes[0]
                      : undefined}/>
                  </View>
                  <Text className='font-popMedium mt-[3%] text-[15px]' style={{
                    color: calcularDias(pag.dataProg) == 4
                      ? coresPadroes[4]
                      : calcularDias(pag.dataProg) == 3
                      ? coresPadroes[3]
                      : calcularDias(pag.dataProg) == 2
                      ? coresPadroes[2]
                      : calcularDias(pag.dataProg) == 1
                      ? coresPadroes[1]
                      : calcularDias(pag.dataProg) == 0
                      ? coresPadroes[0]
                      : 'text-preto'
                  }}>{pag.nome}</Text>
                  <Text className='font-popMedium text-[15px] mt-[2%]' style={{
                    color: calcularDias(pag.dataProg) == 4
                      ? coresPadroes[4]
                      : calcularDias(pag.dataProg) == 3
                      ? coresPadroes[3]
                      : calcularDias(pag.dataProg) == 2
                      ? coresPadroes[2]
                      : calcularDias(pag.dataProg) == 1
                      ? coresPadroes[1]
                      : calcularDias(pag.dataProg) == 0
                      ? coresPadroes[0]
                      : 'text-preto'
                  }}>
                    ${formataDinheiro(pag.valor)}
                    <Text className='font-popRegular text-[11px]'>/mês</Text>
                  </Text>
                  <Text className='font-popRegular text-[13px] mt-[2%]'  style={{
                    color: calcularDias(pag.dataProg) == 4
                      ? coresPadroes[4]
                      : calcularDias(pag.dataProg) == 3
                      ? coresPadroes[3]
                      : calcularDias(pag.dataProg) == 2
                      ? coresPadroes[2]
                      : calcularDias(pag.dataProg) == 1
                      ? coresPadroes[1]
                      : calcularDias(pag.dataProg) == 0
                      ? coresPadroes[0]
                      : 'text-preto'
                  }}>
                    Daqui {calcularDias(pag.dataProg)} dias
                  </Text>
                </View>
                ))
            ) : (
                <Text className="text-[#9C9999] font-popRegular mt-2">Nenhum pagamento encontrado.</Text>
            )}
          </View>
          
          <View className='bg-input mt-[8%] rounded-[20px] p-4 flex-col w-full' style={[styles.sombra]}>
            <View className='flex-row justify-between items-center mb-2'>
              <Text className='font-popMedium text-[16px] text-preto dark:text-branco'>Gastos por categoria</Text>
              <DropdownMeses
                onMesSelecionado={lidarComMudancaMesGastos}
                mesesDisponiveis={Object.keys(dadosMockadosGastos)}
              />
            </View>

            {dadosGastoMes.length > 0 ? (
              <View className="flex-row items-center justify-between mt-2">
                <View className="relative justify-center items-center w-[180px] h-[180px]">
                  <Svg width="180" height="180" viewBox="0 0 180 180">
                    {fatiasGrafico.map((fatia) => (
                      <FatiaAnimada
                        key={fatia.id}
                        isElevada={categoriaElevada === fatia.id}
                        anguloMeio={fatia.anguloMeio}
                        cor={fatia.cor}
                        caminho={fatia.caminho}
                      />
                    ))}
                  </Svg>
                  
                  <View className="absolute items-center justify-center">
                    <Text className="text-[#9C9999] font-popRegular text-[11px]">Total gasto</Text>
                    <Text className="text-preto dark:text-branco font-popMedium text-[15px]">
                      R$ {formataDinheiro(totalGasto)}
                    </Text>
                  </View>
                </View>

                <View className="flex-1 gap-4">
                  {fatiasGrafico.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => setCategoriaElevada(categoriaElevada === item.id ? null : item.id)}
                      className="flex-row items-start justify-between"
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center gap-2">
                        <View style={{ backgroundColor: item.cor }} className="w-3 h-3 rounded-full" />
                        <Text className={`font-popMedium text-[12px] ${categoriaElevada === item.id ? 'text-[#C28E18]' : 'text-preto dark:text-branco'}`}>
                          {item.categoria}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className={`font-popMedium text-[12px] ${categoriaElevada === item.id ? 'text-[#C28E18]' : 'text-preto dark:text-branco'}`}>
                          R$ {formataDinheiro(item.valor)}
                        </Text>
                        <Text className="font-popRegular text-[10px] text-[#9C9999]">
                          {Math.round(item.porcentagem)}%
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <View className="py-10 items-center">
                <Text className="text-[#9C9999] font-popRegular">Nenhum gasto neste período.</Text>
              </View>
            )}
          </View>

          <View className='bg-input mt-[4%] rounded-[20px] p-5 flex-col w-full' style={[styles.sombra]}>
            <View className='flex-row justify-between items-center mb-4'>
              <View className='flex-row items-center gap-2'>
                <Text className='font-popMedium text-[16px] text-preto dark:text-branco'>% do salário gasto</Text>
              </View>
              <DropdownMeses
                onMesSelecionado={lidarComMudancaMesSalario}
                mesesDisponiveis={Object.keys(dadosMockadosSalario)}
              />
            </View>

            <View className='flex-row justify-between'>
              <View className='w-[48%]'>
                <Text className='font-popRegular text-[11px] text-[#4A4A4A] dark:text-[#CCCCCC] mb-1'>Considerando apenas salário</Text>
                <Text className='font-popMedium text-[22px] text-preto dark:text-branco'>{pctApenasSalario}%</Text>
                <View className='w-full h-1.5 bg-[#e3e3e3] rounded-full mt-1 mb-2'>
                  <View style={{ width: `${pctApenasSalario}%`, backgroundColor: coresPadroes[0] }} className='h-full rounded-full' />
                </View>
                <Text className='font-popRegular text-[10px] text-[#9C9999]'>
                  R$ {formataDinheiro(dadosSalarioMes.apenasSalario.gasto)} de R$ {formataDinheiro(dadosSalarioMes.apenasSalario.total)}
                </Text>
              </View>

              <View className='w-[1px] bg-gray-300' />

              <View className='w-[48%]'>
                <Text className='font-popRegular text-[11px] text-[#4A4A4A] dark:text-[#CCCCCC] mb-1'>Todas as entradas</Text>
                <Text className='font-popMedium text-[22px] text-preto dark:text-branco'>{pctTodasEntradas}%</Text>
                <View className='w-full h-1.5 bg-[#e3e3e3] rounded-full mt-1 mb-2'>
                  <View style={{ width: `${pctTodasEntradas}%`, backgroundColor: coresPadroes[0] }} className='h-full rounded-full' />
                </View>
                <Text className='font-popRegular text-[10px] text-[#9C9999]'>
                  R$ {formataDinheiro(dadosSalarioMes.todasEntradas.gasto)} de R$ {formataDinheiro(dadosSalarioMes.todasEntradas.total)}
                </Text>
              </View>
            </View>
          </View>

          <View className='bg-input mt-[4%] rounded-[20px] p-5 flex-col w-full' style={[styles.sombra]}>
            <View className='flex-col justify-center items-start mb-6'>
              <Text className='font-popMedium text-[16px] text-preto dark:text-branco'>Frequência de resultados negativos</Text>
              <Text className="text-[#9C9999] font-popRegular text-[13px]">Últimos 6 meses</Text>
            </View>
            
            <View className='w-full items-center justify-center'>
              <Svg width="330" height="120" viewBox="0 0 330 120">
                <Line x1={offsetLinhaX} y1={offsetLinhaY} x2={offsetLinhaX} y2={offsetLinhaY + alturaLinha} stroke="#D1D5DB" strokeWidth="1" />
                <Line x1={offsetLinhaX} y1={offsetLinhaY + alturaLinha} x2={offsetLinhaX + larguraLinha + 10} y2={offsetLinhaY + alturaLinha} stroke="#D1D5DB" strokeWidth="1" />
                
                <SvgText x={offsetLinhaX - 5} y={offsetLinhaY + 5} fontSize="10" fill="#9C9999" textAnchor="end">100%</SvgText>
                <SvgText x={offsetLinhaX - 5} y={offsetLinhaY + (alturaLinha / 2) + 4} fontSize="10" fill="#9C9999" textAnchor="end">50%</SvgText>
                <SvgText x={offsetLinhaX - 5} y={offsetLinhaY + alturaLinha + 4} fontSize="10" fill="#9C9999" textAnchor="end">0%</SvgText>
                
                <Path d={caminhoLinha} fill="none" stroke={coresPadroes[0]} strokeWidth="1.5" />
                
                {pontosGraficoLinha.map((p, i) => (
                  <G key={i}>
                    <Circle cx={p.x} cy={p.y} r="3" fill={coresPadroes[0]} />
                    <SvgText x={p.x} y={p.y - 10} fontSize="10" fill="#4A4A4A" textAnchor="middle" fontWeight="bold">
                      {p.valor}%
                    </SvgText>
                    <SvgText x={p.x} y={offsetLinhaY + alturaLinha + 15} fontSize="10" fill="#9C9999" textAnchor="middle">
                      {p.mes}
                    </SvgText>
                  </G>
                ))}
              </Svg>
            </View>
          </View>

          <View className='flex-row w-full justify-between mt-[4%]'>
            
            <View className='bg-input rounded-[20px] p-5 w-[48%]' style={[styles.sombra]}>
              <View className='flex-row justify-between items-center mb-2'>
                <Text className='font-popMedium text-[14px] text-preto dark:text-branco'>Sobras mensais</Text>
              </View>
              <Text className='font-popMedium text-[20px] text-[#E8B635] mt-1'>
                R$ {formataDinheiro(dadosDashboardAdicionais.sobras.atual)}
              </Text>
              
              <View className='h-[1px] bg-[#e3e1e1] mt-2' />

              <View className='mt-3'>
                <Text className='font-popRegular text-[10px] text-[#9C9999] mb-1'>Média dos últimos 6 meses</Text>
                <Text className='font-popMedium text-[13px] text-[#E8B635]'>
                  R$ {formataDinheiro(dadosDashboardAdicionais.sobras.media6Meses)}
                </Text>
              </View>
            </View>

            <View className='bg-input rounded-[20px] p-5 w-[48%]' style={[styles.sombra]}>
              <View className='flex-row justify-between items-center mb-1'>
                <Text className='font-popMedium text-[14px] text-preto dark:text-branco'>Previsão de saldo</Text>
              </View>
              <Text className='font-popRegular text-[9px] text-[#9C9999] mb-2'>Considerando parcelas futuras</Text>
              <Text className='font-popMedium text-[20px] text-[#8D6409]'>
                -R$ {formataDinheiro(Math.abs(dadosDashboardAdicionais.previsao.saldo))}
              </Text>
              
              <View className='bg-[#8D6409] dark:bg-[#5C2B29] p-2 rounded-[8px] mt-3 flex-row items-center gap-2'>
                <WarningCircle size={14} color="#ffd66e" weight="fill" />
                <Text className='font-popRegular text-[9px] text-[#ffd66e] dark:text-[#F28B82] flex-1 leading-tight'>
                  Seu saldo pode ficar negativo dia {dadosDashboardAdicionais.previsao.dataAviso}
                </Text>
              </View>
            </View>

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