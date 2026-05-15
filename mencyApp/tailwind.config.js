module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'popExtralight': 'Poppins_200ExtraLight',
        'popLight': 'Poppins_300Light',
        'popLightItalic': 'Poppins_300Light_Italic',
        'popRegular': 'Poppins_400Regular',
        'popMedium': 'Poppins_500Medium',
        'popSemibold' : 'Poppins_600SemiBold',
        'popSemiboldItalic' : 'Poppins_600SemiBold_Italic',
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
          dark: '',
        },
      },
    }
  },
  plugins: []
}