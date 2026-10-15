
import { webClientId } from '@env';
import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: webClientId,
  offlineAccess: false,
  scopes: ['email', 'profile'],
});

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices();
    console.log('Google Play Services are available');
  const response = await GoogleSignin.signIn();

  if (!isSuccessResponse(response)) {
    return null;
  }

  const { idToken } = await GoogleSignin.getTokens();

  if (!idToken) {
    throw new Error('Google ID token was not returned');
  }

  return {
    idToken,
    email: response.data.user.email,
    name: response.data.user.name,
    photo: response.data.user.photo,
  };
}
