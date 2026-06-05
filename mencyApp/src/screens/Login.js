import { View, Text, KeyboardAvoidingView, ScrollView, Image, Platform, TouchableOpacity, Alert } from "react-native";
import { Input } from '../components/input';
import { useState } from "react";
import { GoogleLogoIcon } from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";

export function Login(){
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigation = useNavigation();

  const { colorScheme, toggleColorScheme } = useColorScheme();
  const cor = colorScheme == 'dark' ? '#FAFAFA' : '#000';

  const handleLogin = () => {
    if (email === "" && senha === "") {
      navigation.navigate('Home');
    } else {
      Alert.alert("Acesso Negado", "Email ou senha incorretos.");
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
                      className="w-[40%] mt-[-50%]"
                      resizeMode="contain"
                  />
                  <Text className="font-popSemibold text-[22px] text-preto dark:text-branco mt-[-70%] mb-[10%]">
                      Login
                  </Text>

                  <View className='w-[350px] mt-[5%] items-center'>
                      <Input 
                          texto={'Email'} 
                          value={email}
                          onChangeText={(text) => setEmail(text.toLowerCase())}
                          keyboardType="email-address"
                      />
                      
                      <Input 
                          texto={'Senha'} 
                          seguranca={true}
                          onChangeText={setSenha}
                          value={senha}
                      />
                  </View>

                  <View className='w-[95%]'>
                      <Text className="font-popLight text-[12px] text-preto dark:text-branco mt-[-5%] mb-[10%]"
                      onPress={() => navigation.navigate('EsqueciSenha')}>
                      Esqueci minha senha
                      </Text>
                  </View>

                  <TouchableOpacity 
                      className="px-16 bg-amarelo w-[70%] rounded-[15px] items-center justify-center mt-2 py-2"
                      onPress={handleLogin}
                      activeOpacity={0.8}
                  >
                      <Text className="text-branco font-popRegular text-[18px]">
                      Entrar
                      </Text>
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
  )
}