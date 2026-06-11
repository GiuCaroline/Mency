import { Text, View, ScrollView, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from "react-native";
import { Nav } from "../components/nav";
import { NavBottom } from "../components/navBottom";
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeSlash, WarningCircle } from 'phosphor-react-native';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigation } from "@react-navigation/native";
import { IconeDinamico } from '../components/iconeDinamico';
import { DropdownMeses } from '../components/dropdown';
import Svg, { Path, G, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useColorScheme } from "nativewind";
import pluggy from '../api/pluggy.js';
import { useAuth } from '../context/AuthContext.js';
import {
  formatMoney,
  agruparPorCategoria,
  calcularSalario,
  calcularTotalGastos,
  calcularTodasEntradas,
  extrairMesesDisponiveis,
  filtrarPorMes,
} from '../utils/financial.js';

const AnimatedG = Animated.createAnimatedComponent(G);


function coordenadasPolares(cx, cy, r, anguloGraus) {
  const anguloRadianos = (anguloGraus - 90) * Math.PI / 180.0;
  return { x: cx + r * Math.cos(anguloRadianos), y: cy + r * Math.sin(anguloRadianos) };
}

function criarArco(cx, cy, r, anguloInicial, anguloFinal) {
  const inicio = coordenadasPolares(cx, cy, r, anguloFinal);
  const fim = coordenadasPolares(cx, cy, r, anguloInicial);
  const arcoMaior = anguloFinal - anguloInicial <= 180 ? "0" : "1";
  return ["M", inicio.x, inicio.y, "A", r, r, 0, arcoMaior, 0, fim.x, fim.y].join(" ");
}

function FatiaAnimada({ isElevada, anguloMeio, cor, caminho }) {
  const animacao = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(animacao, { toValue: isElevada ? 1 : 0, friction: 6, tension: 40, useNativeDriver: false }).start();
  }, [isElevada]);
  const deslocamentoMaximo = 10;
  const radianos = (anguloMeio - 90) * Math.PI / 180.0;
  const translateX = animacao.interpolate({ inputRange: [0, 1], outputRange: [0, deslocamentoMaximo * Math.cos(radianos)] });
  const translateY = animacao.interpolate({ inputRange: [0, 1], outputRange: [0, deslocamentoMaximo * Math.sin(radianos)] });
  return (
    <AnimatedG style={{ transform: [{ translateX }, { translateY }] }}>
      <Path d={caminho} stroke="rgba(0,0,0,0.15)" strokeWidth="20" fill="none" transform="translate(0, 4)" />
      <Path d={caminho} stroke={cor} strokeWidth="20" fill="none" />
    </AnimatedG>
  );
}

function formataDinheiro(value) {
  const numero = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numero)) return "0,00";
  return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function Home() {
  const { colorScheme } = useColorScheme();
  const cor = colorScheme == 'dark' ? '#FAFAFA' : '#000';
  const primeiraCor = colorScheme == 'light' ? '#FAFAFA' : '#121212';
  const segundaCor = colorScheme == 'light' ? '#e3d097' : '#ad9f73';
  const coresPadroes = [
    '#E8B635', '#B2821A', '#8D6409', '#634401',
    colorScheme == 'dark' ? '#5f4a1d' : '#3F2B00', '#F4C430', '#D4AF37', '#AA6C39'
  ];

  const [contas, setContas] = useState([]);
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [todasTransacoes, setTodasTransacoes] = useState([]);
  const { dadosFinanceiros, loadingFinanceiros, carregarDadosFinanceiros } = useAuth();

  const [mostrarValor, setMostrarValor] = useState(false);
  const [mesSelecionadoGastos, setMesSelecionadoGastos] = useState(null);
  const [mesSelecionadoSalario, setMesSelecionadoSalario] = useState(null);
  const [categoriaElevada, setCategoriaElevada] = useState(null);
  const [termoBusca, setTermoBusca] = useState("");

  const navigation = useNavigation();

  useEffect(() => {
    carregarDadosFinanceiros();
  }, []);

  useEffect(() => {
    if (!dadosFinanceiros) return;
    setTotalSaldo(dadosFinanceiros.totalSaldo);
    setContas(dadosFinanceiros.contas);
    setTodasTransacoes(dadosFinanceiros.todasTransacoes);

    const meses = extrairMesesDisponiveis(dadosFinanceiros.todasTransacoes);
    if (meses.length > 0 && !mesSelecionadoGastos) {
      setMesSelecionadoGastos(meses[0].chave);
      setMesSelecionadoSalario(meses[0].chave);
    }
  }, [dadosFinanceiros]);

  // --- LÓGICA DE PREVISÃO DE PAGAMENTOS FUTUROS ---
  const previsoesFuturas = useMemo(() => {
    if (!todasTransacoes || todasTransacoes.length === 0) return [];

    const gruposDescricao = {};
    const today = new Date();

    todasTransacoes.forEach(t => {
      const valor = Number(t.valor ?? t.amount ?? t.value ?? 0);
      if (valor > 0) return; // Apenas gastos

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

          // i = 0 inclui o mês atual caso a data de vencimento ainda não tenha chegado
          for (let i = 0; i <= 2; i++) {
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
            });
          }
        }
      }
    }
    return previsoes;
  }, [todasTransacoes]);

  // Filtra as previsões e exibe apenas os 2 próximos pagamentos na Home
  const proximosPagamentos = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let filtrados = previsoesFuturas.filter(pag => {
      const partes = pag.dataProg.split('-');
      const dataPag = new Date(partes[0], partes[1] - 1, partes[2]);
      return dataPag >= hoje; // Apenas datas futuras ou de hoje
    });

    filtrados.sort((a, b) => {
      const pa = a.dataProg.split('-');
      const pb = b.dataProg.split('-');
      return new Date(pa[0], pa[1]-1, pa[2]) - new Date(pb[0], pb[1]-1, pb[2]);
    });

    if (termoBusca.trim()) {
      filtrados = filtrados.filter(p => p.nome.toLowerCase().includes(termoBusca.toLowerCase()));
    }

    return filtrados.slice(0, 2); // Mantém os 2 primeiros na Home
  }, [previsoesFuturas, termoBusca]);

  function calcularDias(dataAlvo) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const partes = dataAlvo.split('-');
    const data = new Date(partes[0], partes[1] - 1, partes[2]);
    return Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
  }

  const mesesDisponiveis = useMemo(() => extrairMesesDisponiveis(todasTransacoes), [todasTransacoes]);

  const transacoesMesGastos = useMemo(() =>
    mesSelecionadoGastos ? filtrarPorMes(todasTransacoes, mesSelecionadoGastos) : [],
    [todasTransacoes, mesSelecionadoGastos]
  );

  const transacoesMesSalario = useMemo(() =>
    mesSelecionadoSalario ? filtrarPorMes(todasTransacoes, mesSelecionadoSalario) : [],
    [todasTransacoes, mesSelecionadoSalario]
  );

  const dadosGastoMes = useMemo(() => agruparPorCategoria(transacoesMesGastos), [transacoesMesGastos]);
  const totalGasto = useMemo(() => calcularTotalGastos(transacoesMesGastos), [transacoesMesGastos]);

  const salarioMes = useMemo(() => calcularSalario(transacoesMesSalario), [transacoesMesSalario]);
  const todasEntradasMes = useMemo(() => calcularTodasEntradas(transacoesMesSalario), [transacoesMesSalario]);
  const gastosMesSalario = useMemo(() => calcularTotalGastos(transacoesMesSalario), [transacoesMesSalario]);

  const pctApenasSalario = salarioMes > 0 ? Math.min(Math.round((gastosMesSalario / salarioMes) * 100), 999) : 0;
  const pctTodasEntradas = todasEntradasMes > 0 ? Math.min(Math.round((gastosMesSalario / todasEntradasMes) * 100), 999) : 0;

  const mesesParaDropdown = useMemo(() =>
    mesesDisponiveis.map(m => m.chave),
    [mesesDisponiveis]
  );

  const mesesDropdownGastos = useMemo(() => mesesParaDropdown, [mesesParaDropdown]);
  const mesesDropdownSalario = useMemo(() => mesesParaDropdown, [mesesParaDropdown]);

  let anguloAcumulado = 0;
  const fatiasGrafico = dadosGastoMes.map((item, index) => {
    const porcentagem = (item.valor / totalGasto) * 100;
    const anguloFatia = (porcentagem / 100) * 360;
    const anguloInicial = anguloAcumulado;
    const anguloFinal = anguloAcumulado + anguloFatia;
    anguloAcumulado += anguloFatia;
    const anguloMeio = anguloInicial + anguloFatia / 2;
    const caminho = criarArco(90, 90, 55, anguloInicial, anguloFinal);
    return { ...item, cor: coresPadroes[index % coresPadroes.length], porcentagem, anguloMeio, caminho };
  });

  if (loadingFinanceiros && !dadosFinanceiros) {
    return (
      <View className='flex-1 bg-branco dark:bg-preto-dark items-center justify-center'>
        <ActivityIndicator size="large" color="#E8B635" />
      </View>
    );
  }

  return (
    <View className='flex-1 bg-branco dark:bg-preto-dark'>
      <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 110 }} className='flex'>
        <Nav
          placeholder="Buscar..."
          onSearch={(texto) => setTermoBusca(texto)}
        />
        <View className='items-center px-2'>

          {/* Saldo */}
          <View style={styles.sombra} className="h-[100px] w-full">
            <LinearGradient
              colors={[primeiraCor, segundaCor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.5, y: 0 }}
              className="h-full w-full justify-between items-center py-2 px-4 relative overflow-hidden flex-row"
              style={{ borderRadius: 20 }}
            >
              <View className="z-20">
                <Text className="text-preto dark:text-branco font-popRegular text-[14px]">Saldo atual</Text>
                <Text className="mt-[-3%] text-preto dark:text-branco font-popRegular text-[22px]">
                  R$ {mostrarValor ? formataDinheiro(totalSaldo) : '••••••'}
                </Text>
              </View>
              <TouchableOpacity
                className='bg-branco dark:bg-preto-dark rounded-full p-2'
                onPress={() => setMostrarValor(!mostrarValor)}
              >
                {mostrarValor ? <Eye size={24} color={cor} /> : <EyeSlash size={24} color={cor} />}
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Pagamentos futuros */}
          <View className='flex-row justify-between items-center w-full mt-[8%]'>
            <Text className='font-popMedium text-[18px] text-preto dark:text-branco'>Pagamentos futuros</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Futuro')}>
              <Text className='font-popRegular text-[14px] text-[#9C9999]'>Ver tudo</Text>
            </TouchableOpacity>
          </View>
          <View className='w-full items-center mt-2'>
            <View className='flex-row w-full items-center justify-center mt-[2%] gap-5 flex-wrap'>
              {proximosPagamentos.length > 0 ? (
                proximosPagamentos.map((pag) => {
                  const dias = calcularDias(pag.dataProg);
                  const corItem = dias <= 4 ? coresPadroes[Math.max(0, dias)] : cor;
                  const corItemIcon = dias <= 4 ? coresPadroes[Math.max(0, dias)] : '#000';
                  return (
                    <View key={pag.id} className='flex-col bg-input dark:bg-input-dark p-4 w-[45%] py-6 rounded-[20px]' style={styles.sombra}>
                      <View className='bg-branco rounded-full p-2 items-center w-[40px]'>
                        <IconeDinamico nome={pag.nome} cor={corItemIcon} />
                      </View>
                      <Text className='font-popMedium mt-[3%] text-[15px]' style={{ color: corItem }} numberOfLines={1}>{pag.nome}</Text>
                      <Text className='font-popMedium text-[15px] mt-[2%]' style={{ color: corItem }}>
                        R$ {formataDinheiro(pag.valor)}
                        <Text className='font-popRegular text-[11px]' style={{ color: corItem }}>/mês</Text>
                      </Text>
                      {calcularDias(pag.dataProg) >= 0 && (
                        <Text
                            className='font-popRegular text-[13px] mt-[2%]'
                            style={{ color: corItem }}
                        >
                            {calcularDias(pag.dataProg) === 0
                                ? 'Hoje'
                                : `Daqui ${calcularDias(pag.dataProg)} dias`}
                        </Text>
                    )}
                    </View>
                  );
                })
              ) : (
                <Text className="text-[#9C9999] font-popRegular mt-2">Nenhum pagamento futuro próximo.</Text>
              )}
            </View>
          </View>

          {/* Gastos por categoria */}
          <View className='bg-input dark:bg-input-dark mt-[8%] rounded-[20px] p-4 flex-col w-full' style={styles.sombra}>
            <View className='flex-row justify-between items-center mb-2'>
              <Text className='font-popMedium text-[16px] text-preto dark:text-branco'>Gastos por categoria</Text>
              <DropdownMeses
                onMesSelecionado={(v) => { setMesSelecionadoGastos(v); setCategoriaElevada(null); }}
                mesesDisponiveis={mesesDropdownGastos}
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

          {/* % do salário gasto */}
          <View className='bg-input dark:bg-input-dark mt-[4%] rounded-[20px] p-5 flex-col w-full' style={styles.sombra}>
            <View className='flex-row justify-between items-center mb-4'>
              <Text className='font-popMedium text-[16px] text-preto dark:text-branco'>% do salário gasto</Text>
              <DropdownMeses
                onMesSelecionado={setMesSelecionadoSalario}
                mesesDisponiveis={mesesDropdownSalario}
              />
            </View>

            {salarioMes === 0 && todasEntradasMes === 0 ? (
              <View className="py-6 items-center">
                <Text className="text-[#9C9999] font-popRegular">Sem entradas identificadas neste mês.</Text>
              </View>
            ) : (
              <View className='flex-row justify-between'>
                <View className='w-[48%]'>
                  <Text className='font-popRegular text-[11px] text-[#4A4A4A] dark:text-[#CCCCCC] mb-1'>Considerando apenas salário</Text>
                  <Text className='font-popMedium text-[22px] text-preto dark:text-branco'>{pctApenasSalario}%</Text>
                  <View className='w-full h-1.5 bg-[#e3e3e3] rounded-full mt-1 mb-2'>
                    <View style={{ width: `${Math.min(pctApenasSalario, 100)}%`, backgroundColor: coresPadroes[0] }} className='h-full rounded-full' />
                  </View>
                  <Text className='font-popRegular text-[10px] text-[#9C9999]'>
                    R$ {formataDinheiro(gastosMesSalario)} de R$ {formataDinheiro(salarioMes)}
                  </Text>
                </View>

                <View className='w-[1px] bg-gray-300' />

                <View className='w-[48%]'>
                  <Text className='font-popRegular text-[11px] text-[#4A4A4A] dark:text-[#CCCCCC] mb-1'>Todas as entradas</Text>
                  <Text className='font-popMedium text-[22px] text-preto dark:text-branco'>{pctTodasEntradas}%</Text>
                  <View className='w-full h-1.5 bg-[#e3e3e3] rounded-full mt-1 mb-2'>
                    <View style={{ width: `${Math.min(pctTodasEntradas, 100)}%`, backgroundColor: coresPadroes[0] }} className='h-full rounded-full' />
                  </View>
                  <Text className='font-popRegular text-[10px] text-[#9C9999]'>
                    R$ {formataDinheiro(gastosMesSalario)} de R$ {formataDinheiro(todasEntradasMes)}
                  </Text>
                </View>
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      <NavBottom active="Home" onChange={(r) => navigation.navigate(r)} />
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