import { View, Text, Pressable } from "react-native";
import {
  House,
  WalletIcon,
  ClockCountdownIcon,
  User,
} from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";

export function NavBottom({ active, onChange }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[{ paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }]}
      className="absolute bottom-0 w-full bg-input dark:bg-input-dark flex-row justify-around py-[3%] items-center"
    >
      <Tab
        label="Home"
        active={active === "Home"}
        onPress={() => onChange("Home")}
        icon={House}
      />

      <Tab
        label="Transações"
        active={active === "Transacao"}
        onPress={() => onChange("Transacao")}
        icon={WalletIcon}
      />

      <Tab
        label="Pag. futuros"
        active={active === "Futuro"}
        onPress={() => onChange("Futuro")}
        icon={ClockCountdownIcon}
      />

      <Tab
        label="Perfil"
        active={active === "Perfil"}
        onPress={() => onChange("Perfil")}
        icon={User}
      />

    </View>
  );
}

function Tab({ label, icon: Icon, active, onPress }) {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const cor = colorScheme == 'dark' ? '#FAFAFA' : '#000';
  return (
    <Pressable className="items-center justify-center" onPress={onPress}>

      <Icon
        size={24}
        color={active ? "#C19200" : cor}
      />

      <Text className={`text-[11px] ${active ? "text-amarelo" : "text-[#313131]"} dark:text-branco font-popRegular`}>
        {label}
      </Text>
    </Pressable>
  );
}

