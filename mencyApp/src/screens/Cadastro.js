import { View, Text, KeyboardAvoidingView, ScrollView, Image, Platform, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Input } from '../components/input';
import { useState } from "react";
import { GoogleLogoIcon, Eye, EyeSlash } from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import auth from '../api/auth';

export function Cadastro(){
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [telefone, setTelefone] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [cpfErro, setCpfErro] = useState("");
    const [emailErro, setEmailErro] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const { colorScheme, toggleColorScheme } = useColorScheme();
    const cor = colorScheme == 'dark' ? '#FAFAFA' : '#000';

    const handleCadastro = async () => {
      if (!nome.trim() || !email.trim() || !senha.trim() || !cpf.trim()) {
        Alert.alert("Erro", "Por favor, preencha todos os campos.");
        return;
      }

      const cpfLimpo = cpf.replace(/\D/g, "");
      if (cpfLimpo.length !== 11) {
        Alert.alert("Erro", "CPF deve ter 11 dígitos.");
        return;
      }

      if (!validarCPF(cpfLimpo)) {
        setCpfErro("CPF inválido");
        return;
      }

      if (!validarEmail(email)) {
        setEmailErro("E-mail inválido");
        return;
      }

      setIsLoading(true);
      try {
        await auth.register({
          name: nome,
          email,
          cpf: cpfLimpo,
          password: senha,
        });
        Alert.alert("Sucesso", "Cadastro realizado! Faça login para continuar.");
        navigation.navigate('Login');
      } catch (error) {
        const mensagem = error?.data?.message || error?.message || "Erro ao registrar. Tente novamente.";
        Alert.alert("Erro", mensagem);
      } finally {
        setIsLoading(false);
      }
    }

    return(  
        <View className="flex-1 items-center bg-branco dark:bg-preto-dark">
            <KeyboardAvoidingView 
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            >
                <ScrollView contentContainerStyle={{ padding: 5, alignItems:'center', }} className='flex'>
                    <Image
                        source={require("../../assets/images/logoAmarela.png")}
                        className="w-[30%] mt-[-50%]"
                        resizeMode="contain"
                    />
                    <Text className="font-popSemibold text-[22px] text-preto dark:text-branco mt-[-70%] mb-[10%]">
                        Cadastro
                    </Text>

                    <View className='w-[350px] items-center'>
                        <Input 
                            texto={'Nome'} 
                            value={nome}
                            onChangeText={setNome}
                        />

                        <Input
                          texto={'CPF'}
                          value={cpf}
                          onChangeText={(text) => {
                            const cpfFormatado = maskCPF(text);
                            setCpf(cpfFormatado);

                            const cpfLimpo = cpfFormatado.replace(/\D/g, "");

                            if (cpfLimpo.length === 11) {
                              setCpfErro(
                                validarCPF(cpfLimpo)
                                  ? ""
                                  : "CPF inválido"
                              );
                            } else {
                              setCpfErro("");
                            }
                          }}
                        />

                        {cpfErro ? (
                          <Text className="text-vermelho text-[12px] w-full mt-[-8%] mb-[4%]">
                            {cpfErro}
                          </Text>
                        ) : null}

                        <Input
                          texto={'Email'}
                          value={email}
                          onChangeText={(text) => {
                            const emailFormatado = text.toLowerCase();

                            setEmail(emailFormatado);

                            if (emailFormatado.length > 0) {
                              setEmailErro(
                                validarEmail(emailFormatado)
                                  ? ""
                                  : "E-mail inválido"
                              );
                            } else {
                              setEmailErro("");
                            }
                          }}
                          keyboardType="email-address"
                        />

                        {emailErro ? (
                          <Text className="text-vermelho text-[12px] w-full mt-[-8%] mb-[4%]">
                            {emailErro}
                          </Text>
                        ) : null}
                        
                        <View className="w-full relative">
                            <Input 
                                texto={'Senha'} 
                                seguranca={!mostrarSenha}
                                onChangeText={setSenha}
                                value={senha}
                            />
                            <TouchableOpacity 
                                className="absolute right-5 top-[40px] z-10" 
                                onPress={() => setMostrarSenha(!mostrarSenha)}
                            >
                                {mostrarSenha ? (
                                    <Eye size={24} color={cor} />
                                ) : (
                                    <EyeSlash size={24} color={cor} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity 
                        className="px-16 bg-amarelo w-[70%] rounded-[15px] items-center justify-center mt-2 py-2"
                        onPress={handleCadastro}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                          <ActivityIndicator size="small" color="#FAFAFA" />
                        ) : (
                          <Text className="text-branco font-popRegular text-[18px]">
                          Cadastrar
                          </Text>
                        )}
                    </TouchableOpacity>
                    
                    <Text className='font-popLight text-[13px] mt-[10%] text-preto dark:text-branco' onPress={() => navigation.navigate('Login')}>
                        Faça o login clicando <Text className='text-amarelo' onPress={() => navigation.navigate('Login')}>aqui</Text>
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");

  if (cpf.length !== 11) return false;

  // Impede CPFs iguais
  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }

  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;

  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;

  return resto === parseInt(cpf.charAt(10));
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function maskCPF(value) {
  if (!value) return "";
  
  let v = value.replace(/\D/g, "");
  
  v = v.slice(0, 11);
  
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  
  return v;
}