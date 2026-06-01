import { View } from "react-native";
import * as PhosphorIcons from 'phosphor-react-native';

export function IconeDinamico({ nome, tamanho = 27, cor = "#000" }) {
  const palavras = nome.toLowerCase().split(' ');
  const primeiraPalavra = palavras[0]?.replace(/[^a-z0-9]/g, '');
  const segundaPalavra = palavras[1]?.replace(/[^a-z0-9]/g, '');

  let nomeIconeNaBiblioteca = null;

  if (primeiraPalavra === 'google') {
    if (segundaPalavra === 'photos') {
      nomeIconeNaBiblioteca = 'GooglePhotosLogo';
    } else if (segundaPalavra === 'play') {
      nomeIconeNaBiblioteca = 'GooglePlayLogo';
    } else {
      nomeIconeNaBiblioteca = 'GoogleLogo';
    }
  } else if (primeiraPalavra === 'salario' || primeiraPalavra === 'money' || primeiraPalavra === 'salrio') {
    nomeIconeNaBiblioteca = 'CurrencyDollar';
  } else {
    nomeIconeNaBiblioteca = Object.keys(PhosphorIcons).find(chaveIcone => 
      chaveIcone.toLowerCase().includes(primeiraPalavra)
    );
  }

  const fillCorreto = primeiraPalavra === 'google' || primeiraPalavra === 'salrio' ? 'regular' : 'fill';

  const IconeComponente = nomeIconeNaBiblioteca && PhosphorIcons[nomeIconeNaBiblioteca] 
    ? PhosphorIcons[nomeIconeNaBiblioteca] 
    : PhosphorIcons.CreditCard;

  return (
    <View>
      <IconeComponente weight={fillCorreto} size={tamanho} color={cor} />
    </View>
  );
}