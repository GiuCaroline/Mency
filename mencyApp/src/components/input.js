import { View, TextInput, StyleSheet } from 'react-native';

export function Input({
  texto,
  seguranca,
  value = '',
  onChangeText,
  keyboardType = 'default',
  containerStyle,
}) {

  return (
    <View
      style={[styles.sombra, containerStyle]}
      className="bg-input dark:bg-input-dark rounded-xl flex items-center justify-center w-[95%] h-[50px] mb-[10%]"
    >

      <TextInput
        className="font-popRegular px-[2%] w-[95%] text-[16px] text-preto dark:text-branco"
        style={{ height: 65 }}
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