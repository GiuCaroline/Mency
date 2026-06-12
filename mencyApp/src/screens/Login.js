import { View, Text, KeyboardAvoidingView, ScrollView, Image, Platform, TouchableOpacity, Alert, ActivityIndicator, Modal } from "react-native";
import { Input } from '../components/input';
import { useState } from "react";
import { GoogleLogoIcon } from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { useAuth } from '../context/AuthContext';
import pluggy from '../api/pluggy';
import { PluggyConnect } from 'react-native-pluggy-connect';

export function Login(){
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [connectToken, setConnectToken] = useState(null);
  const navigation = useNavigation();
  const { login } = useAuth();

  const { colorScheme } = useColorScheme();
  const cor = colorScheme == 'dark' ? '#FAFAFA' : '#000';

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert("Erro", "Por favor, preencha email e senha.");
      return;
    }
    setIsLoading(true);
    try {
      await login({ email, password: senha });

      try {
        const itemsCheck = await pluggy.checkItems();
        if (itemsCheck?.hasItems) {
          navigation.navigate('Home');
        } else {
          openPluggyWidget();
        }
      } catch {
        openPluggyWidget();
      }
    } catch (error) {
      const mensagem = error?.data?.message || error?.message || "Erro ao fazer login.";
      Alert.alert("Erro", mensagem);
    } finally {
      setIsLoading(false);
    }
  };

  const openPluggyWidget = async () => {
    try {
      const tokenResult = await pluggy.getConnectToken();
      const token = tokenResult?.connectToken || tokenResult?.data?.connectToken;
      if (!token) {
        Alert.alert("Erro", "Não foi possível obter o token do widget.");
        return;
      }
      setConnectToken(token);
      setShowWidget(true);
    } catch (error) {
      const mensagem = error?.data?.message || error?.message || "Erro ao obter widget.";
      Alert.alert("Erro", mensagem);
    }
  };

  const handleWidgetSuccess = async ({ item }) => {
    try {
      await pluggy.saveItem({ itemId: item.id });
      setShowWidget(false);
      setConnectToken(null);
      navigation.navigate('Home');
    } catch {
      Alert.alert("Erro", "Não foi possível salvar a conta conectada.");
    }
  };

  const handleWidgetClose = () => {
    setShowWidget(false);
    setConnectToken(null);
  };

  return (
    <>
      <View className="flex-1 items-center bg-branco dark:bg-preto-dark">
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>
          <ScrollView contentContainerStyle={{ padding: 5, alignItems: 'center' }} className='flex'>
            <Image
              source={require("../../assets/images/logoAmarela.png")}
              className="w-[40%] mt-[-50%]"
              resizeMode="contain"
            />
            <Text className="font-popSemibold text-[22px] text-preto dark:text-branco mt-[-70%] mb-[10%]">
              Login
            </Text>

            <View className='w-[350px] mt-[5%] items-center'>
              <Input texto={'Email'} value={email} onChangeText={(text) => setEmail(text.toLowerCase())} keyboardType="email-address" />
              <Input texto={'Senha'} seguranca={true} onChangeText={setSenha} value={senha} />
            </View>

            <View className='w-[95%]'>
              <Text className="font-popLight text-[12px] text-preto dark:text-branco mt-[-5%] mb-[10%]"
                onPress={() => navigation.navigate('EsqueciSenha')}>
                Esqueci minha senha
              </Text>
            </View>

            <TouchableOpacity
              className="px-16 bg-amarelo w-[70%] rounded-[15px] items-center justify-center mt-2 py-2"
              onPress={handleLogin} activeOpacity={0.8} disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FAFAFA" />
              ) : (
                <Text className="text-branco font-popRegular text-[18px]">Entrar</Text>
              )}
            </TouchableOpacity>

            <View className='flex-row items-center mt-[10%] gap-3'>
              <View className='h-[1px] w-[15%] bg-preto dark:bg-branco' />
              <Text className='font-popLight text-preto dark:text-branco'>ou</Text>
              <View className='h-[1px] w-[15%] bg-preto dark:bg-branco' />
            </View>

            <TouchableOpacity 
              className='flex-row justify-center border bg-transparent rounded-xl gap-2 p-1 mt-[10%] border-preto dark:border-branco'
            >
              <GoogleLogoIcon weight="regular" size={25} color={cor} />
              <Text className='font-popRegular text-[18px] text-preto dark:text-branco'>Acesse pelo Google</Text>
            </TouchableOpacity>

            <Text className='font-popLight text-[13px] mt-[15%] text-preto dark:text-branco' onPress={() => navigation.navigate('Cadastro')}>
              Faça o cadastro clicando <Text className='text-amarelo' onPress={() => navigation.navigate('Cadastro')}>aqui</Text>
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <Modal visible={showWidget} animationType="slide" onRequestClose={handleWidgetClose}>
        <View className="flex-1">
          {connectToken ? (
            <PluggyConnect
              connectToken={connectToken}
              includeSandbox={true}
              onSuccess={handleWidgetSuccess}
              onError={({ message }) => console.log('Widget error:', message)}
              onClose={handleWidgetClose}
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-branco dark:bg-preto-dark">
              <ActivityIndicator size="large" color="#E8B635" />
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}