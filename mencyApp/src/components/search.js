import React, { useState, useRef } from "react";
import { View, TouchableOpacity, TextInput, Animated, StyleSheet, Dimensions } from "react-native";
import { MagnifyingGlassIcon, X } from "phosphor-react-native";
import { useColorScheme } from "nativewind";

const { width } = Dimensions.get("window");

export function Search({ onSearch, placeholder = "Pesquisar..." }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [text, setText] = useState("");
    const widthAnim = useRef(new Animated.Value(42)).current;
    
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const cor = colorScheme == 'dark' ? '#FAFAFA' : '#000';

    const toggleSearch = () => {
        if (isExpanded) {
            Animated.timing(widthAnim, {
                toValue: 42,
                duration: 1000,
                useNativeDriver: false,
            }).start(() => setIsExpanded(false));
            setText("");
            if (onSearch) onSearch("");
        } else {
            setIsExpanded(true);
            Animated.timing(widthAnim, {
                toValue: width * 0.8,
                duration: 1000,
                useNativeDriver: false,
            }).start();
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.sombra,
                    {
                        width: widthAnim,
                        position: isExpanded ? "absolute" : "relative",
                        right: 0,
                    }
                ]}
                className="bg-input dark:bg-input-dark rounded-full flex-row items-center h-[42px]"
            >
                <TouchableOpacity
                    className="p-2"
                    activeOpacity={0.8}
                    onPress={toggleSearch}
                >
                    <MagnifyingGlassIcon size={26} color={cor} />
                </TouchableOpacity>

                {isExpanded && (
                    <>
                        <TextInput
                            className="flex-1 h-full text-preto dark:text-branco p-2 justify-center font-popRegular"
                            placeholder={placeholder}
                            placeholderTextColor="#888"
                            autoFocus
                            value={text}
                            onChangeText={(val) => {
                                setText(val);
                                if (onSearch) onSearch(val);
                            }}
                        />
                        <TouchableOpacity onPress={toggleSearch} className="p-4">
                            <X size={20} color="#000" />
                        </TouchableOpacity>
                    </>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 42,
        justifyContent: "center",
        alignItems: "flex-end",
        zIndex: 50,
    },
    sombra: {
        shadowColor: "#000",
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 7,
    }
});