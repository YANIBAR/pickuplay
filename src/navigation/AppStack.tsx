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
  TeamsScreen,
  CompetitionsScreen,
  AddCompetitionsScreen,
  ScheduleScreen,
  GamesScreen,
  GameScreen,
  LoginScreen,
  MyGamesScreen,
  EditGameScreen,
  AddGameScreen,
  SettingScreen,
  NotificationScreen,
  ChangePasswordScreen,
  mapFieldsScreen,
  addFieldScreen,
  fieldScreen,
  ChatScreen,
  ProfileOnboardingScreen,
  MyProfileScreen,
  CompetitionDetailScreen,
  EditCompetitionsScreen,
  AddTeamScreen,
  TeamDetailScreen,
  TeamRequestsScreen
} from '@screens';
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator();

const AppNavigator = ({ initialRouteName = 'onboarding' }) => {

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" component={TabNavigator} /> 
      <Stack.Screen name="onboarding" component={OnboardingScreen} />
      <Stack.Screen name="profileOnboarding" component={ProfileOnboardingScreen} />
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen name="myProfile" component={MyProfileScreen} />
      <Stack.Screen name="setting" component={SettingScreen} />
      <Stack.Screen name="LanguageItem" component={LanguageItemScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="customerservice" component={CustomerServiceScreen} />
      <Stack.Screen name="terms" component={TermsScreen} />
      <Stack.Screen name="teams" component={TeamsScreen} />
      <Stack.Screen name="addTeam" component={AddTeamScreen} />
      <Stack.Screen name="teamDetail" component={TeamDetailScreen} />
      <Stack.Screen name="teamRequests" component={TeamRequestsScreen} />
      <Stack.Screen name="competitions" component={CompetitionsScreen} />
      <Stack.Screen name="addCompetition" component={AddCompetitionsScreen} />
      <Stack.Screen name="editCompetition" component={EditCompetitionsScreen} />
      <Stack.Screen name="competitionDetail" component={CompetitionDetailScreen} />
      <Stack.Screen name="booking" component={ScheduleScreen} />
      <Stack.Screen name="Games" component={GamesScreen} />
      <Stack.Screen name="myGames" component={MyGamesScreen} />
      <Stack.Screen name="editGame" component={EditGameScreen} />
      <Stack.Screen name="addGame" component={AddGameScreen} />
      <Stack.Screen name="editProfile" component={EditProfileScreen} />
      <Stack.Screen name="map" component={mapFieldsScreen} />
      <Stack.Screen name="game" component={GameScreen} />
      <Stack.Screen name="chat" component={ChatScreen} />
      
      <Stack.Screen name="addField" component={addFieldScreen} />
      <Stack.Screen name="field" component={fieldScreen} />
      <Stack.Screen name="register" component={RegisterScreen} />
      <Stack.Screen name="forgotpasswordmethods"component={ForgotPasswordMethodsScreen}/>
      <Stack.Screen name="forgotpasswordemail"component={ForgotPasswordEmailScreen}/>
      <Stack.Screen name="forgotpasswordphone"component={ForgotPasswordPhoneScreen}/>
      <Stack.Screen name="otpverification" component={OTPVerificationScreen} />
      <Stack.Screen name="createnewpassword" component={CreateNewPasswordScreen} />
      <Stack.Screen name="changepassword" component={ChangePasswordScreen} />
      <Stack.Screen name="notifications" component={NotificationScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
