import { View, Text, Pressable, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import { House, WalletIcon, ClockCountdownIcon, User, Sparkle, } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";

const { width } = Dimensions.get("window");

export function NavBottom({ active, onChange }) {
 const insets = useSafeAreaInsets();
 const { colorScheme } = useColorScheme();

 const dark = colorScheme === "dark";
 const bg = dark ? "#252525" : "#F5F5F5";
 const cor = dark ? "#FAFAFA" : "#000000";

 const altura = 88 + insets.bottom;

 return (
  <View
   style={{
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: altura,
   }}
  >
   <Svg
    width="100%"
    height="100%"
    viewBox="0 0 400 110"
    preserveAspectRatio="none"
    style={{ position: "absolute", bottom: 0 }}
   >
    <Path
     d="
      M 0 20
      H 145
      C 160 20, 163 55, 200 55
      C 237 55, 240 20, 255 20
      H 400
      V 110
      H 0
      Z
     "
     fill={bg}
    />
   </Svg>

   <View
    style={{
     flexDirection: "row",
     alignItems: "center",
     justifyContent: "space-around",
     paddingTop: 25,
     paddingBottom: insets.bottom,
     height: altura,
    }}
   >
    <Tab
     label="Home"
     active={active === "Home"}
     onPress={() => onChange("Home")}
     icon={House}
     cor={cor}
    />

    <Tab
     label="Transações"
     active={active === "Transacao"}
     onPress={() => onChange("Transacao")}
     icon={WalletIcon}
     cor={cor}
    />

    {/* Espaço reservado para o botão IA */}
    <View style={{ width: 65 }} />

    <Tab
     label="Pag. futuros"
     active={active === "Futuro"}
     onPress={() => onChange("Futuro")}
     icon={ClockCountdownIcon}
     cor={cor}
    />

    <Tab
     label="Perfil"
     active={active === "Perfil"}
     onPress={() => onChange("Perfil")}
     icon={User}
     cor={cor}
    />
   </View>

   <Pressable
    onPress={() => onChange("Assistente")}
    style={{
      position: "absolute",
      top: -15,
      left: width / 2 - 31,
      width: 62,
      height: 62,
      borderRadius: 31,
     backgroundColor: "#C19200",
     alignItems: "center",
     justifyContent: "center",
     elevation: 10,
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.25,
     shadowRadius: 5,
    }}
   >
    <Sparkle size={29} color="#FFFFFF" weight="fill" />
   </Pressable>
  </View>
 );
}

function Tab({ label, icon: Icon, active, onPress, cor }) {
 return (
  <Pressable
   onPress={onPress}
   style={{
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
   }}
  >
   <Icon
    size={24}
    color={active ? "#C19200" : cor}
    weight={active ? "fill" : "regular"}
   />

   <Text
    style={{
     color: active ? "#C19200" : cor,
     fontSize: 11,
     fontFamily: "Poppins_400Regular",
     marginTop: 3,
    }}
   >
    {label}
   </Text>
  </Pressable>
 );
}