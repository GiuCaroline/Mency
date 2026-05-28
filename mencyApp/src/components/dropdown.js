import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { CaretDown } from 'phosphor-react-native';

export function DropdownMeses({ onMesSelecionado, mesesDisponiveis = [] }) {
  const [aberto, setAberto] = useState(false);
  const [selecionado, setSelecionado] = useState({ label: 'Este mês', value: 'atual' });

  const opcoesMeses = useMemo(() => {
    const mesesNomes = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const opcoes = mesesDisponiveis.map(chave => {
      if (chave === 'atual') {
        return { label: 'Este mês', value: 'atual' };
      }
      
      const [ano, mes] = chave.split('-');
      const nomeMes = mesesNomes[parseInt(mes, 10)];
      
      return {
        label: `${nomeMes} ${ano}`,
        value: chave
      };
    });

    return opcoes.slice(0, 5);
  }, [mesesDisponiveis]);

  function handleSelecionar(item) {
    setSelecionado(item);
    setAberto(false);
    if (onMesSelecionado) {
      onMesSelecionado(item.value);
    }
  }

  return (
    <View>
      <TouchableOpacity
        onPress={() => setAberto(true)}
        className="flex-row items-center justify-end gap-1"
      >
        <Text className="text-[#9C9999] font-popRegular text-[14px]">
          {selecionado.label}
        </Text>
        <CaretDown size={14} color="#9C9999" weight="bold" />
      </TouchableOpacity>

      <Modal
        visible={aberto}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAberto(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-black/20"
          activeOpacity={1}
          onPress={() => setAberto(false)}
        >
          <View 
            className="bg-[#FAFAFA] dark:bg-preto-dark w-[200px] rounded-[15px] max-h-[300px] shadow-lg"
            style={{ elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
          >
            <FlatList
              data={opcoesMeses}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="p-4 border-b border-gray-200/50"
                  onPress={() => handleSelecionar(item)}
                >
                  <Text 
                    className={`text-center font-popRegular text-[14px] ${
                      selecionado.value === item.value 
                        ? 'text-[#d4b96a] font-popMedium' 
                        : 'text-preto dark:text-branco'
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}