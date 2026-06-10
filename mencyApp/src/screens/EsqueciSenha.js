import { View, Text, KeyboardAvoidingView, ScrollView, Image, Platform, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Input } from '../components/input';
import { useState } from "react";
import { forgotPassword } from '../api/auth';
import { useNavigation } from '@react-navigation/native';

export function EsqueciSenha(){
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleEnviar = async () => {
    if (!email) {
      Alert.alert("Erro", "Por favor, digite seu e-mail.");
      return;
    }
    
    setLoading(true);
    try {
      await forgotPassword({ email });
      Alert.alert("Sucesso", "O link de recuperação foi enviado para o seu e-mail.");
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert("Erro", "Não foi possível processar a solicitação. Verifique o e-mail e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return(
    <View className="flex-1 items-center bg-branco dark:bg-preto-dark">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
        <ScrollView contentContainerStyle={{ padding: 5, alignItems: 'center' }} className='flex'>
          <Image
            source={require("../../assets/images/logoAmarela.png")}
            className="w-[40%] mt-[-35%]"
            resizeMode="contain"
          />
          <Text className="font-popSemibold text-[22px] text-preto dark:text-branco mt-[-60%] mb-[10%]">
            Esqueci Senha
          </Text>

          <Text className="font-popLight text-[12px] text-center text-preto dark:text-branco mt-[-5%] px-4">
            Digite seu email para receber o link e alterar a sua senha.
          </Text>

          <View className='w-[350px] mt-[5%] items-center'>
            <Input texto={'Email'} value={email} onChangeText={(text) => setEmail(text.toLowerCase())} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <TouchableOpacity
            className="px-16 bg-amarelo w-[70%] rounded-[15px] items-center justify-center mt-2 py-2 h-[48px]"
            activeOpacity={0.8} 
            onPress={handleEnviar}
            disabled={loading}
          >
            {loading ? (
               <ActivityIndicator color="#ffffff" />
            ) : (
               <Text className="text-branco font-popRegular text-[18px]">Enviar</Text>
            )}
          </TouchableOpacity>

          <Text className='font-popLight text-[13px] mt-[15%] text-preto dark:text-branco' onPress={() => navigation.navigate('Login')}>
            Faça o login clicando <Text className='text-amarelo'>aqui</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}