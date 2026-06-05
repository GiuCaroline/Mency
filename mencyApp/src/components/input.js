import { View, TextInput, StyleSheet, Text } from 'react-native';

export function Input({
  texto,
  seguranca,
  value = '',
  onChangeText,
  keyboardType = 'default',
}) {

  return (
    <View
      className="w-full mb-[10%]"
    >
      <Text className='text-left font-popRegular text-preto dark:text-branco text-[15px]'>{texto}</Text>
      
      <TextInput
        className={`px-[3%] w-full text-[16px] text-preto dark:text-branco bg-input dark:bg-input-dark rounded-xl flex items-center justify-center h-[50px] ${!seguranca ? 'font-popRegular' : ''}`}
        style={[ styles.sombra ]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={seguranca}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sombra: {
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
});