import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { CaretLeft, CaretRight } from "phosphor-react-native";
import { useRef } from "react";

const months = [
  "Jan","Fev","Mar","Abr","Maio","Jun",
  "Jul","Ago","Set","Out","Nov","Dez"
];

export function MonthHeader({ month, year, setMonth, setYear }) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  function animateChange(direction, updateState) {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: direction * -30,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      
      updateState();
      
      slideAnim.setValue(direction * 30);
      
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    });
  }

  function handlePrev() {
    animateChange(-1, () => {
      if (month === 0) {
        setMonth(11);
        setYear(year - 1);
      } else {
        setMonth(month - 1);
      }
    });
  }

  function handleNext() {
    animateChange(1, () => {
      if (month === 11) {
        setMonth(0);
        setYear(year + 1);
      } else {
        setMonth(month + 1);
      }
    });
  }

  return (
    <View style={styles.container} className="flex-row justify-between items-center bg-input dark:bg-input-dark rounded-full px-3 w-[80%]">
      <TouchableOpacity onPress={handlePrev}>
        <CaretLeft size={24} className='text-preto dark:text-branco' />
      </TouchableOpacity>

      <Animated.Text 
        style={{
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim
        }}
        className='font-popLight text-[15px] bg-amarelo rounded-full px-6 py-3 text-branco'
      >
        {months[month]}
      </Animated.Text>

      <TouchableOpacity onPress={handleNext}>
        <CaretRight size={24} className='text-preto dark:text-branco' />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    marginVertical: 20,
    overflow: 'hidden'
  },
});