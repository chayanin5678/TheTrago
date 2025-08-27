import * as Linking from 'expo-linking';

// Linking config must reflect the navigation tree: top-level Tab names are 'Home', 'Booking', 'Web', 'Login'
// and the Home tab contains a nested stack whose screen is 'HomeScreen'. Map paths accordingly so
// thetrago://home routes to the Home tab -> HomeScreen, and thetrago://register routes to Register.
export default {
  prefixes: ['thetrago://'],
  config: {
    screens: {
      Home: {
        path: 'home',
        screens: {
          HomeScreen: '', // thetrago://home -> Home tab -> HomeScreen
        },
      },
      // Booking tab (optional)
      Booking: {
        path: 'booking',
      },
      Web: 'web',
      // Login tab contains nested auth stack; map register/login paths to those screens
      Login: {
        path: 'auth',
        screens: {
          LoginScreen: 'login',
          RegisterScreen: 'register',
          ForgotPasswordScreen: 'forgot-password',
          OTPVerificationScreen: 'verify-otp',
        },
      },
      // Other standalone screens (stack screens under Home/AppNavigator)
      PaymentScreen: 'payment',
      ResultScreen: 'payment/success',
    },
  },
};
