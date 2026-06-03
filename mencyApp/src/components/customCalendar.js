import { View, StyleSheet, Text, Animated } from "react-native";
import { generateCalendar } from "../utils/calendarUtils";
import { DayCell } from "./dayCell";
import { useRef, useEffect } from "react";

const monthsName = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CustomCalendar({
  month,
  year,
  selected,
  onSelectDay,
  events = {}
}) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const prevDate = useRef({ month, year });

  useEffect(() => {
    let direction = 30; 

    if (
      year < prevDate.current.year || 
      (year === prevDate.current.year && month < prevDate.current.month)
    ) {
      direction = -30; 
    }

    slideAnim.setValue(direction);
    opacityAnim.setValue(0);

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

    prevDate.current = { month, year };

  }, [month, year]);

  const days = generateCalendar(month, year);

  return (
    <View className='mt-[4%] mb-[5%]'>
      
      <Animated.View 
        className='flex-row items-center mb-[3%] ml-[5%]'
        style={{ opacity: opacityAnim, transform: [{ translateX: slideAnim }] }}
      >
        <Text className='font-popRegular text-preto dark:text-branco text-base'>
          {monthsName[month]} {year}
        </Text>
      </Animated.View>

      <View style={styles.sombra} className='bg-input dark:bg-input-dark mx-[5%] rounded-[20px] p-2'>
        
        <Animated.View 
          className="flex-row justify-between mb-2"
          style={{ opacity: opacityAnim, transform: [{ translateX: slideAnim }] }}
        >
          {weekDays.map((day, index) => (
            <Text
              key={index}
              className="w-[14.28%] text-center text-[12px] font-popSemibold text-preto dark:text-branco mt-[2%]"
            >
              {day}
            </Text>
          ))}
        </Animated.View>

        <Animated.View 
          style={[styles.grid, { opacity: opacityAnim, transform: [{ translateX: slideAnim }] }]}
        >
          {days.map((day, index) => {
            if (!day) {
              return <View key={index} style={styles.empty} />;
            }

            const dateKey = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const markers = events[dateKey] || [];

            return (
              <DayCell
                key={index}
                day={day}
                isSelected={selected === dateKey}
                onPress={() => onSelectDay(dateKey)}
                markers={markers}
              />
            );
          })}
        </Animated.View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid:{
    flexDirection:"row",
    flexWrap:"wrap"
  },
  empty:{
    width:"14.2%",
    height:60
  },
  sombra: {
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  }
});