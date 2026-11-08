import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";

import {
  Sparkle,
  ChartLineUp,
  PiggyBank,
  CalendarCheck,
  Lightbulb,
  PaperPlaneTilt,
  TrashSimple,
  Bank,
  WarningCircle,
} from "phosphor-react-native";

import Markdown, { MarkdownIt } from "react-native-markdown-display";
import { PluggyConnect } from "react-native-pluggy-connect";

import { NavBottom } from "../components/navBottom";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import ai, { LIMITE_MENSAGEM } from "../api/ai";
import pluggy from "../api/pluggy";

const sugestoes = [
  {
    titulo: "Analisar meus gastos",
    descricao: "Entenda para onde vai seu dinheiro.",
    pergunta: "Me ajude a analisar meus gastos.",
    Icone: ChartLineUp,
  },
  {
    titulo: "Como economizar?",
    descricao: "Encontre oportunidades para economizar.",
    pergunta: "Como posso economizar dinheiro?",
    Icone: PiggyBank,
  },
  {
    titulo: "Planejar meu mês",
    descricao: "Organize suas receitas e despesas.",
    pergunta: "Me ajude a planejar meu mês.",
    Icone: CalendarCheck,
  },
  {
    titulo: "Receber sugestões",
    descricao: "Melhore sua organização financeira.",
    pergunta: "Me dê sugestões para melhorar minhas finanças.",
    Icone: Lightbulb,
  },
];

// A resposta da IA vem em Markdown. HTML nunca é interpretado (html: false),
// links só abrem se forem https e imagens remotas não são carregadas.
const markdownParser = MarkdownIt({ html: false, linkify: false, typographer: true });
const regrasMarkdown = { image: () => null };
const abrirSoHttps = (url) => typeof url === "string" && /^https:\/\//i.test(url);

function mensagemDeErro(error) {
  switch (error?.status) {
    case 0:
      return error.message; // sem conexão / tempo esgotado (vem do client)
    case 404:
      return "Conecte um banco para que o assistente possa analisar suas finanças.";
    case 400:
    case 429:
      return error.message;
    case 503:
      return "O assistente está indisponível no momento.";
    default:
      return "O assistente não conseguiu responder agora. Tente novamente.";
  }
}

let proximoId = 0;
const novoId = () => `local-${Date.now()}-${proximoId++}`;

export function Assistente() {
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const { carregarDadosFinanceiros } = useAuth();
  const scrollRef = useRef(null);

  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [temBanco, setTemBanco] = useState(null); // null = ainda não sabemos
  const [connectToken, setConnectToken] = useState(null);

  const dark = colorScheme === "dark";

  const cores = {
    texto: dark ? "#FAFAFA" : "#202020",
    secundario: dark ? "#C0C0C0" : "#777777",
    card: dark ? "#212124" : "#FFFFFF",
    borda: dark ? "#303033" : "#EAEAEA",
    destaque: "#C19000",
    fundoDestaque: dark ? "#212124" : "#F5EBCB",
    input: dark ? "#212124" : "#FFFFFF",
    erroFundo: dark ? "#3A1D1F" : "#FBE9EA",
    erroTexto: dark ? "#F28B82" : "#A4000D",
  };

  const estiloMarkdown = {
    body: { fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 21, color: cores.texto },
    strong: { fontFamily: "Poppins_600SemiBold", fontWeight: "normal" },
    em: { fontFamily: "Poppins_400Regular", fontStyle: "italic" },
    heading1: { fontFamily: "Poppins_600SemiBold", fontSize: 17, marginVertical: 4 },
    heading2: { fontFamily: "Poppins_600SemiBold", fontSize: 15, marginVertical: 4 },
    heading3: { fontFamily: "Poppins_500Medium", fontSize: 14, marginVertical: 4 },
    paragraph: { marginTop: 0, marginBottom: 8 },
    bullet_list: { marginBottom: 6 },
    ordered_list: { marginBottom: 6 },
    list_item: { marginBottom: 4 },
    link: { color: cores.destaque, textDecorationLine: "underline" },
    code_inline: { backgroundColor: cores.fundoDestaque, color: cores.texto, borderRadius: 4 },
    hr: { backgroundColor: cores.borda },
    table: { borderColor: cores.borda },
    tr: { borderColor: cores.borda },
  };

  const carregarInicio = useCallback(async () => {
    setCarregandoHistorico(true);
    setErro(null);
    const [historico, itens] = await Promise.allSettled([
      ai.listarMensagens(),
      pluggy.checkItems(),
    ]);

    if (historico.status === "fulfilled") {
      setMensagens(
        (historico.value?.mensagens || []).map((m, i) => ({
          id: `srv-${i}-${m.created_at}`,
          role: m.role === "user" ? "user" : "assistant",
          content: String(m.content ?? ""),
        }))
      );
    } else {
      setErro(mensagemDeErro(historico.reason));
    }

    if (itens.status === "fulfilled") setTemBanco(Boolean(itens.value?.hasItems));
    setCarregandoHistorico(false);
  }, []);

  useEffect(() => {
    carregarInicio();
  }, [carregarInicio]);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [mensagens, enviando]);

  function selecionarSugestao(pergunta) {
    setMensagem(pergunta);
  }

  async function enviarMensagem() {
    const texto = mensagem.trim();
    if (!texto || enviando || texto.length > LIMITE_MENSAGEM) return;

    const idUsuario = novoId();
    setErro(null);
    setEnviando(true);
    setMensagem("");
    setMensagens((atual) => [...atual, { id: idUsuario, role: "user", content: texto }]);

    try {
      const { resposta } = await ai.enviarMensagem(texto);
      setMensagens((atual) => [
        ...atual,
        { id: novoId(), role: "assistant", content: String(resposta ?? "") },
      ]);
    } catch (error) {
      // Desfaz a mensagem otimista e devolve o texto para o campo, para tentar de novo.
      setMensagens((atual) => atual.filter((m) => m.id !== idUsuario));
      setMensagem(texto);
      if (error?.status === 404) setTemBanco(false);
      setErro(mensagemDeErro(error));
    } finally {
      setEnviando(false);
    }
  }

  function confirmarLimpeza() {
    Alert.alert(
      "Limpar conversa",
      "Todas as mensagens com o assistente serão apagadas.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            try {
              await ai.limparMensagens();
              setMensagens([]);
              setErro(null);
            } catch (error) {
              setErro(mensagemDeErro(error));
            }
          },
        },
      ]
    );
  }

  async function conectarBanco() {
    try {
      const { connectToken: token } = await pluggy.getConnectToken();
      if (!token) throw new Error("Não foi possível abrir a conexão com o banco.");
      setConnectToken(token);
    } catch (error) {
      Alert.alert("Erro", error?.message || "Não foi possível abrir a conexão com o banco.");
    }
  }

  async function aoConectarBanco({ item }) {
    setConnectToken(null);
    try {
      await pluggy.saveItem({ itemId: item.id });
      setTemBanco(true);
      setErro(null);
      carregarDadosFinanceiros(true);
      Alert.alert(
        "Banco conectado",
        "A primeira sincronização pode levar alguns minutos. Se a análise vier incompleta, tente novamente em instantes."
      );
    } catch {
      Alert.alert("Erro", "Não foi possível salvar a conta conectada.");
    }
  }

  const semConversa = !carregandoHistorico && mensagens.length === 0;
  const textoValido = mensagem.trim().length > 0 && mensagem.trim().length <= LIMITE_MENSAGEM;
  const podeEnviar = textoValido && !enviando && temBanco !== false;

  return (
    <View className="flex-1 bg-branco dark:bg-preto-dark">

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.top}
      >

        {/* Cabeçalho */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 20,
            paddingTop: insets.top + 15,
            paddingBottom: 15,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: cores.destaque,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkle size={27} color="#FFFFFF" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 21, color: cores.texto }}>
              Assistente Mency
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: 12,
                color: cores.secundario,
                marginTop: 2,
              }}
            >
              {enviando ? "Digitando…" : "Sua inteligência financeira pessoal"}
            </Text>
          </View>

          {mensagens.length > 0 && (
            <Pressable
              onPress={confirmarLimpeza}
              disabled={enviando}
              hitSlop={10}
              accessibilityLabel="Limpar conversa"
              style={({ pressed }) => ({ opacity: enviando ? 0.4 : pressed ? 0.6 : 1, padding: 6 })}
            >
              <TrashSimple size={24} color={cores.secundario} />
            </Pressable>
          )}
        </View>

        {/* Conteúdo principal */}
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {carregandoHistorico ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="large" color={cores.destaque} />
            </View>
          ) : semConversa ? (
            <View style={{ flex: 1, justifyContent: "center", paddingVertical: 20 }}>

              {/* Apresentação */}
              <View style={{ alignItems: "center", marginBottom: 28 }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 22,
                    backgroundColor: cores.fundoDestaque,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                  }}
                >
                  <Sparkle size={35} color={cores.destaque} />
                </View>

                <Text
                  style={{
                    fontFamily: "Poppins_500Medium",
                    fontSize: 22,
                    color: cores.texto,
                    textAlign: "center",
                  }}
                >
                  Vamos cuidar do seu dinheiro?
                </Text>

                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: 13,
                    lineHeight: 21,
                    color: cores.secundario,
                    textAlign: "center",
                    marginTop: 10,
                    paddingHorizontal: 5,
                  }}
                >
                  Tire dúvidas sobre suas finanças e encontre novas
                  formas de organizar seu dinheiro.
                </Text>
              </View>

              {temBanco === false ? (
                <CartaoConectarBanco cores={cores} onPress={conectarBanco} />
              ) : (
                /* Sugestões */
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  {sugestoes.map(({ titulo, descricao, pergunta, Icone }) => (
                    <Pressable
                      key={titulo}
                      onPress={() => selecionarSugestao(pergunta)}
                      style={({ pressed }) => ({
                        width: "48%",
                        minHeight: 115,
                        backgroundColor: cores.card,
                        borderWidth: 1,
                        borderColor: cores.borda,
                        borderRadius: 18,
                        padding: 13,
                        opacity: pressed ? 0.75 : 1,
                      })}
                    >
                      <Icone size={25} color={cores.destaque} />

                      <Text
                        style={{
                          fontFamily: "Poppins_500Medium",
                          fontSize: 12,
                          color: cores.texto,
                          marginTop: 10,
                        }}
                      >
                        {titulo}
                      </Text>

                      <Text
                        style={{
                          fontFamily: "Poppins_400Regular",
                          fontSize: 10,
                          lineHeight: 16,
                          color: cores.secundario,
                          marginTop: 4,
                        }}
                      >
                        {descricao}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {mensagens.map((m) =>
                m.role === "user" ? (
                  <View
                    key={m.id}
                    style={{
                      alignSelf: "flex-end",
                      maxWidth: "85%",
                      backgroundColor: cores.destaque,
                      borderRadius: 18,
                      borderBottomRightRadius: 6,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                    }}
                  >
                    <Text
                      selectable
                      style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20, color: "#FFFFFF" }}
                    >
                      {m.content}
                    </Text>
                  </View>
                ) : (
                  <View
                    key={m.id}
                    style={{
                      alignSelf: "flex-start",
                      maxWidth: "92%",
                      backgroundColor: cores.card,
                      borderWidth: 1,
                      borderColor: cores.borda,
                      borderRadius: 18,
                      borderBottomLeftRadius: 6,
                      paddingTop: 10,
                      paddingBottom: 2,
                      paddingHorizontal: 14,
                    }}
                  >
                    <Markdown
                      markdownit={markdownParser}
                      rules={regrasMarkdown}
                      onLinkPress={abrirSoHttps}
                      style={estiloMarkdown}
                    >
                      {m.content}
                    </Markdown>
                  </View>
                )
              )}

              {enviando && (
                <View
                  style={{
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: cores.card,
                    borderWidth: 1,
                    borderColor: cores.borda,
                    borderRadius: 18,
                    borderBottomLeftRadius: 6,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                  }}
                >
                  <ActivityIndicator size="small" color={cores.destaque} />
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: cores.secundario }}>
                    Analisando suas finanças…
                  </Text>
                </View>
              )}

              {temBanco === false && (
                <CartaoConectarBanco cores={cores} onPress={conectarBanco} />
              )}
            </View>
          )}
        </ScrollView>

        {/* Aviso de erro */}
        {erro && (
          <View
            style={{
              marginHorizontal: 15,
              marginBottom: 8,
              backgroundColor: cores.erroFundo,
              borderRadius: 12,
              paddingVertical: 8,
              paddingHorizontal: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <WarningCircle size={18} color={cores.erroTexto} weight="fill" />
            <Text style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 11, color: cores.erroTexto }}>
              {erro}
            </Text>
            {carregandoHistorico === false && mensagens.length === 0 && temBanco === null && (
              <Pressable onPress={carregarInicio} hitSlop={8}>
                <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 11, color: cores.erroTexto }}>
                  Recarregar
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Campo de mensagem */}
        <View
          style={{
            marginHorizontal: 15,
            marginBottom: 115 + insets.bottom,
            backgroundColor: cores.input,
            borderWidth: 1,
            borderColor: cores.borda,
            borderRadius: 18,
            padding: 12,

            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 5,
            elevation: 2,
          }}
        >
          <TextInput
            value={mensagem}
            onChangeText={setMensagem}
            placeholder="Pergunte algo sobre suas finanças..."
            placeholderTextColor={dark ? "#888888" : "#A0A0A0"}
            multiline
            maxLength={LIMITE_MENSAGEM}
            editable={!enviando}
            textAlignVertical="top"
            style={{
              minHeight: 55,
              maxHeight: 110,
              paddingHorizontal: 5,
              paddingVertical: 8,
              fontFamily: "Poppins_400Regular",
              fontSize: 13,
              color: cores.texto,
            }}
          />

          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: cores.borda,
              paddingTop: 10,
              marginTop: 5,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, color: cores.destaque }}>
              {mensagem.length > LIMITE_MENSAGEM * 0.8
                ? `${mensagem.length}/${LIMITE_MENSAGEM}`
                : "O que você gostaria de saber?"}
            </Text>

            <Pressable
              onPress={enviarMensagem}
              disabled={!podeEnviar}
              accessibilityLabel="Enviar mensagem"
              style={({ pressed }) => ({
                width: 42,
                height: 42,
                borderRadius: 13,
                backgroundColor: cores.destaque,
                alignItems: "center",
                justifyContent: "center",
                opacity: !podeEnviar ? 0.4 : pressed ? 0.7 : 1,
              })}
            >
              {enviando ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <PaperPlaneTilt size={21} color="#FFFFFF" weight="fill" />
              )}
            </Pressable>
          </View>
        </View>

      </KeyboardAvoidingView>

      <NavBottom active="Assistente" onChange={(r) => navigation.navigate(r)}  />

      <Modal visible={Boolean(connectToken)} animationType="slide" onRequestClose={() => setConnectToken(null)}>
        <View style={{ flex: 1 }}>
          {connectToken && (
            <PluggyConnect
              connectToken={connectToken}
              includeSandbox={true}
              onSuccess={aoConectarBanco}
              onError={() => {}}
              onClose={() => setConnectToken(null)}
            />
          )}
        </View>
      </Modal>

    </View>
  );
}

function CartaoConectarBanco({ cores, onPress }) {
  return (
    <View
      style={{
        backgroundColor: cores.card,
        borderWidth: 1,
        borderColor: cores.borda,
        borderRadius: 18,
        padding: 16,
        alignItems: "center",
        gap: 10,
      }}
    >
      <Bank size={30} color={cores.destaque} />
      <Text
        style={{
          fontFamily: "Poppins_400Regular",
          fontSize: 12,
          lineHeight: 19,
          color: cores.secundario,
          textAlign: "center",
        }}
      >
        Para analisar suas finanças, o assistente precisa de um banco conectado.
      </Text>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          backgroundColor: cores.destaque,
          borderRadius: 13,
          paddingVertical: 10,
          paddingHorizontal: 22,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 13, color: "#FFFFFF" }}>
          Conectar banco
        </Text>
      </Pressable>
    </View>
  );
}
