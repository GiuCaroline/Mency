
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import {
  Sparkle,
  ChartLineUp,
  PiggyBank,
  CalendarCheck,
  Lightbulb,
  PaperPlaneTilt,
} from "phosphor-react-native";

import { NavBottom } from "../components/navBottom";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

export function Assistente() {
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  const [mensagem, setMensagem] = useState("");

  const dark = colorScheme === "dark";

  const cores = {
    texto: dark ? "#FAFAFA" : "#202020",
    secundario: dark ? "#C0C0C0" : "#777777",
    card: dark ? "#212124" : "#FFFFFF",
    borda: dark ? "#303033" : "#EAEAEA",
    destaque: "#C19000",
    fundoDestaque: dark ? "#212124" : "#F5EBCB",
    input: dark ? "#212124" : "#FFFFFF",
  };

  function selecionarSugestao(pergunta) {
    setMensagem(pergunta);
  }

  function enviarMensagem() {
    if (!mensagem.trim()) return;

    console.log("Mensagem enviada:", mensagem);

    // Aqui você poderá integrar a API da sua IA.
    setMensagem("");
  }

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

          <View>
            <Text
              style={{
                fontFamily: "popMedium",
                fontSize: 21,
                color: cores.texto,
              }}
            >
              Assistente Mency
            </Text>

            <Text
              style={{
                fontFamily: "popRegular",
                fontSize: 12,
                color: cores.secundario,
                marginTop: 2,
              }}
            >
              Sua inteligência financeira pessoal
            </Text>
          </View>
        </View>

        {/* Conteúdo principal */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 20,
          }}
          keyboardShouldPersistTaps="handled"
        >

          <View
            style={{
              flex: 1,
              justifyContent: "center",
              paddingVertical: 20,
            }}
          >

            {/* Apresentação */}
            <View
              style={{
                alignItems: "center",
                marginBottom: 28,
              }}
            >
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
                <Sparkle
                  size={35}
                  color={cores.destaque}
                />
              </View>

              <Text
                style={{
                  fontFamily: "popMedium",
                  fontSize: 22,
                  color: cores.texto,
                  textAlign: "center",
                }}
              >
                Vamos cuidar do seu dinheiro?
              </Text>

              <Text
                style={{
                  fontFamily: "popRegular",
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

            {/* Sugestões */}
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
                  <Icone
                    size={25}
                    color={cores.destaque}
                  />

                  <Text
                    style={{
                      fontFamily: "popMedium",
                      fontSize: 12,
                      color: cores.texto,
                      marginTop: 10,
                    }}
                  >
                    {titulo}
                  </Text>

                  <Text
                    style={{
                      fontFamily: "popRegular",
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

          </View>
        </ScrollView>

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
            textAlignVertical="top"
            style={{
              minHeight: 55,
              maxHeight: 110,
              paddingHorizontal: 5,
              paddingVertical: 8,
              fontFamily: "popRegular",
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
            <Text
              style={{
                fontFamily: "popRegular",
                fontSize: 10,
                color: cores.destaque,
              }}
            >
              O que você gostaria de saber?
            </Text>

            <Pressable
              onPress={enviarMensagem}
              disabled={!mensagem.trim()}
              style={({ pressed }) => ({
                width: 42,
                height: 42,
                borderRadius: 13,
                backgroundColor: cores.destaque,
                alignItems: "center",
                justifyContent: "center",
                opacity: !mensagem.trim() ? 0.4 : pressed ? 0.7 : 1,
              })}
            >
              <PaperPlaneTilt size={21} color="#FFFFFF" weight="fill" />
            </Pressable>
          </View>
        </View>

      </KeyboardAvoidingView>

      <NavBottom active="Assistente" onChange={(r) => navigation.navigate(r)}  />

    </View>
  );
}
