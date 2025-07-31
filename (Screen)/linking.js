import * as Linking from 'expo-linking';
import PaymentScreen from './PaymentScreen';

export default {
  prefixes: ["thetrago://",], 
  config: {
    screens: {
      HomeScreen: "home",
      LoginScreen: "login",
      RegisterScreen: "register",
      ForgotPasswordScreen: "forgot-password",
      OTPVerificationScreen: "verify-otp",
      PaymentScreen: "payment",
      ResultScreen: "payment/success",
    }
  }
};
