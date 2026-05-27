import { View } from "react-native";
import * as PhosphorIcons from 'phosphor-react-native';

export function IconeDinamico({ nome, tamanho = 27, cor = "#000" }) {
  const primeiraPalavra = nome.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');

  const nomeIconeNaBiblioteca = Object.keys(PhosphorIcons).find(chaveIcone => 
    chaveIcone.toLowerCase().includes(primeiraPalavra)
  );

  const IconeComponente = nomeIconeNaBiblioteca ? PhosphorIcons[nomeIconeNaBiblioteca] : PhosphorIcons.CreditCardIcon;

  return (
    <View>
      <IconeComponente weight="fill" size={tamanho} color={cor} />
    </View>
  );
}