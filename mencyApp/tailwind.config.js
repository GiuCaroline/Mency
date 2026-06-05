module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'popExtralight': 'Poppins_200ExtraLight',
        'popLight': 'Poppins_300Light',
        'popRegular': 'Poppins_400Regular',
        'popMedium': 'Poppins_500Medium',
        'popSemibold' : 'Poppins_600SemiBold',
        'popBold': 'Poppins_700Bold',
      },
      colors: {
        'amarelo': '#C19200',
        'branco': '#FAFAFA',
        'preto': {
          DEFAULT: '#000',
          dark: '#121212'
        },
        'input': {
          DEFAULT: '#EDEDED',
          dark: '#212124',
        },
        vermelho: '#A4000D'
      },
    }
  },
  plugins: []
}