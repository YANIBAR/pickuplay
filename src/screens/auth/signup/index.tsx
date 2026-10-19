import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, icons, images } from '@constants';
import Header from '@components/Header';
import Button from '@components/Button';
import SocialButton from '@components/SocialButton';
import OrSeparator from '@components/OrSeparator';
import { useNavigation } from '@react-navigation/native';
import { signInWithGoogle } from '@services/googleSignIn';
import publicApi from '@services/api';

type Nav = {
  navigate: (value: string) => void
}

const LetsYouIn = () => {
  const { navigate } = useNavigation<Nav>();

  // implementing facebook authentication
  const facebookAuthHandler = () => {
    console.log("Facebook Authentication")
  };

  // implementing google authentication
  const googleAuthHandler = () => {
    console.log("Google Authentication")
  };

  // implementing apple authentication
  const appleAuthHandler = () => {
    console.log("Apple Authentication")
  };

  
const handleGoogleSignIn = async () => {
  try {

    const googleUser = await signInWithGoogle();

    if (!googleUser) {
      console.log('Google Sign-In cancelled');
      return;
    }

    // Next step: send googleUser.idToken to your Java API.
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);

    Alert.alert(
      'Google Sign-In Failed',
      `${error?.code ?? 'UNKNOWN'}: ${
        error?.message ?? 'Please try again.'
      }`,
    );
  }
};


  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        {/* Back arrow */}
        <Header title="" />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Illustration */}
          <View style={styles.logoContainer}>
            <Image
              source={images.welcome} // replace with your "Let's you in" illustration
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Let's you in</Text>

          {/* Social buttons */}
          <View style={styles.socialBtnContainer}>
            <SocialButton
              icon={icons.facebook}
              onPress={facebookAuthHandler}
              text="Continue with Facebook"
            />
          </View>
          <View style={styles.socialBtnContainer}>
            <SocialButton
              icon={icons.google}
              onPress={handleGoogleSignIn}
              text="Continue with Google"
            />
          </View>
          <View style={styles.socialBtnContainer}>
            <SocialButton
              icon={icons.apple}
              onPress={appleAuthHandler}
              text="Continue with Applesss"
            />
          </View>

          <OrSeparator text="or" />

          <Button
            title="Sign in with password"
            filled
            onPress={() => navigate("login")}
            style={styles.button}
          />
        </ScrollView>

        {/* Bottom link */}
        <View style={styles.bottomContainer}>
          <Text style={styles.bottomLeft}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigate("signup")}>
            <Text style={styles.bottomRight}>{" "}Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.white
  },
  logo: {
    width: 232,
    height: 200,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 24
  },
  title: {
    fontSize: 40,
    fontFamily: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 32
  },
  socialBtnContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4
  },
  button: {
    marginTop: 24,
    marginBottom: 6,
    width: SIZES.width - 32,
    borderRadius: 30
  },
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 18,
    position: "absolute",
    bottom: 12,
    right: 0,
    left: 0,
  },
  bottomLeft: {
    fontSize: 14,
    fontFamily: "regular",
    color: "gray"
  },
  bottomRight: {
    fontSize: 14,
    fontFamily: "medium",
    color: COLORS.primary
  },
})

export default LetsYouIn