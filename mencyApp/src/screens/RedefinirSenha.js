import { View, Text, KeyboardAvoidingView, ScrollView, Image, Platform, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Input } from '../components/input';
import { useState } from "react";
import { resetPassword } from '../api/auth';
import { useNavigation, useRoute } from '@react-navigation/native';

export function RedefinirSenha(){
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();

  const token = route.params?.token;

  const handleSalvar = async () => {
    if (!senha) {
      Alert.alert("Erro", "Por favor, digite sua nova senha.");
      return;
    }
    
    if (!token) {
      Alert.alert("Erro", "Link inválido ou expirado.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, password: senha });
      Alert.alert("Sucesso", "Senha atualizada com sucesso!");
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert("Erro", "Não foi possível redefinir sua senha.");
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
            Nova Senha
          </Text>

          <Text className="font-popLight text-[12px] text-center text-preto dark:text-branco mt-[-5%] px-4">
            Crie uma nova senha de acesso.
          </Text>

          <View className='w-[350px] mt-[5%] items-center'>
            <Input texto={'Nova Senha'} value={senha} onChangeText={setSenha} secureTextEntry={true} />
          </View>

          <TouchableOpacity
            className="px-16 bg-amarelo w-[70%] rounded-[15px] items-center justify-center mt-2 py-2 h-[48px]"
            activeOpacity={0.8} 
            onPress={handleSalvar}
            disabled={loading}
          >
            {loading ? (
               <ActivityIndicator color="#ffffff" />
            ) : (
               <Text className="text-branco font-popRegular text-[18px]">Salvar</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}