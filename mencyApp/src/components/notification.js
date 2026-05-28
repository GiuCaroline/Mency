import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { BellIcon } from "phosphor-react-native";

export function Notificacao() {
    const [isOpen, setIsOpen] = useState(false);
    
    const [notificacoes, setNotificacoes] = useState([
        { id: 1, titulo: "Nova transferência", msg: "Você recebeu R$ 50,00", lida: false },
        { id: 2, titulo: "Lembrete", msg: "Vencimento da fatura amanhã", lida: false },
    ]);

    const temNaoLida = notificacoes.some(notificacao => !notificacao.lida);

    const toggleNotificacao = () => {
        if (isOpen) {
            setNotificacoes(prevNotificacoes => 
                prevNotificacoes.map(n => ({ ...n, lida: true }))
            );
        }
        setIsOpen(!isOpen);
    };

    return (
        <View className="relative z-50">
            <TouchableOpacity 
                className="bg-input rounded-full p-2 z-50 relative" 
                style={[styles.sombra]}
                activeOpacity={0.8}
                onPress={toggleNotificacao}
            >
                <BellIcon size={26} color="#000" />
                
                {temNaoLida && (
                    <View className="absolute top-[6px] right-[8px] w-[12px] h-[12px] bg-vermelho rounded-full border border-input" />
                )}
            </TouchableOpacity>

            {isOpen && (
                <View 
                    className="absolute top-[55px] right-0 w-[250px] bg-white dark:bg-preto dark:border dark:border-branco rounded-xl p-4 z-40"
                    style={[styles.sombraPopup]}
                >
                    <View 
                        className="absolute -top-2 right-[14px] w-4 h-4 bg-white rotate-45"
                    />

                    <Text className="font-popMedium text-[18px] text-preto dark:text-branco mb-3">
                        Notificações
                    </Text>

                    <ScrollView className="max-h-[200px]" showsVerticalScrollIndicator={false}>
                        {notificacoes.map((item) => (
                            <View key={item.id} className="mb-3 border-b border-gray-200 pb-2 flex-row justify-between items-center">
                                <View className='flex-col flex-1 pr-2'>
                                    <Text 
                                        className={`text-[14px] text-preto dark:text-branco ${
                                            item.lida ? 'font-popMedium' : 'font-popBold'
                                        }`}
                                    >
                                        {item.titulo}
                                    </Text>
                                    <Text 
                                        className={`text-[12px] ${
                                            item.lida ? 'font-popRegular text-gray-500' : 'font-popMedium text-preto dark:text-gray-300'
                                        }`}
                                    >
                                        {item.msg}
                                    </Text>
                                </View>
                                
                                {!item.lida && (
                                    <View className="w-[10px] h-[10px] bg-amarelo rounded-full" />
                                )}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    sombra: {
        shadowColor: '#000',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 7,
    },
    sombraPopup: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
    }
});