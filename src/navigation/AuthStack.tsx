import { createStackNavigator } from '@react-navigation/stack';
import {
  LoginScreen,
  RegisterScreen,
  PartnerRegisterScreen,
  CustomerRegisterScreen,
  OTPVerificationScreen,
  ForgotPasswordMethodsScreen,
  ForgotPasswordPhoneScreen,
  ForgotPasswordEmailScreen,
  CreateNewPasswordScreen,
  ChangePasswordScreen
} from '@screens';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    initialRouteName="onboarding"
    screenOptions={{
      headerShown: false,
    }}>
    <Stack.Screen name="login" component={LoginScreen} />
    <Stack.Screen name="register" component={RegisterScreen} />
    <Stack.Screen name="customerregister" component={CustomerRegisterScreen} />
    <Stack.Screen name="partnerregister" component={PartnerRegisterScreen} />
    <Stack.Screen
      name="forgotpasswordmethods"
      component={ForgotPasswordMethodsScreen}
    />
    <Stack.Screen
      name="forgotpasswordemail"
      component={ForgotPasswordEmailScreen}
    />
    <Stack.Screen
      name="forgotpasswordphone"
      component={ForgotPasswordPhoneScreen}
    />
    <Stack.Screen name="otpverification" component={OTPVerificationScreen} />
    <Stack.Screen
      name="createnewpassword"
      component={CreateNewPasswordScreen}
    />
    <Stack.Screen
      name="changepassword"
      component={ChangePasswordScreen}
    />
  </Stack.Navigator>
);

export default AuthStack;
