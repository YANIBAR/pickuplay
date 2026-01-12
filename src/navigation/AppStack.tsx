import { createStackNavigator } from '@react-navigation/stack';
import {
  EditProfileScreen,
  LanguageItemScreen,
  PrivacyPolicyScreen,
  PaymentScreen,
  HelpCenterScreen,
  CustomerServiceScreen,
  OnboardingScreen,
  TermsScreen,
  ProfileScreen,
  RegisterScreen,
  WelcomeScreen,
  OTPVerificationScreen,
  ForgotPasswordMethodsScreen,
  ForgotPasswordPhoneScreen,
  ForgotPasswordEmailScreen,
  CreateNewPasswordScreen,
  EventsScreen,
  EventDetailsScreen,
  PrizeScreen,
  ScanQRCodeScreen,
  ChartScreen,
  PhotoIdScreen,
  MembershipScreen,
  AddMembershipScreen,
  ActivitiesScreen,
  EditActivityScreen,
  DetailScreen,
  LoginScreen

} from '@screens';
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator();

const AppNavigator = ({ initialRouteName = 'onboarding' }) => {

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="welcome" component={TabNavigator} /> 
      <Stack.Screen name="onboarding" component={OnboardingScreen} />
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen name="LanguageItem" component={LanguageItemScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="customerservice" component={CustomerServiceScreen} />
      <Stack.Screen name="terms" component={TermsScreen} />
      <Stack.Screen name="events" component={EventsScreen} />
      <Stack.Screen name="eventDetail" component={EventDetailsScreen} />
      <Stack.Screen name="prize" component={PrizeScreen} />
      <Stack.Screen name="chart" component={ChartScreen} />
      <Stack.Screen name="scanqrcode" component={ScanQRCodeScreen} />
      <Stack.Screen name="membership" component={MembershipScreen} />
      <Stack.Screen name="addMembership" component={AddMembershipScreen} />
      <Stack.Screen name="activities" component={ActivitiesScreen} />
      <Stack.Screen name="editActivity" component={EditActivityScreen} />
      <Stack.Screen name="editProfile" component={EditProfileScreen} />
      <Stack.Screen name="photoid" component={PhotoIdScreen} />
      <Stack.Screen name="detail" component={DetailScreen} /><Stack.Screen name="register" component={RegisterScreen} />
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
      <Stack.Screen name="createnewpassword" component={CreateNewPasswordScreen} />
      

    </Stack.Navigator>
  );
};

export default AppNavigator;
