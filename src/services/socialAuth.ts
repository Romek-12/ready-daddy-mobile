import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

export function configureGoogleSignIn(webClientId: string): void {
  GoogleSignin.configure({ webClientId, offlineAccess: false });
}

export async function getGoogleIdToken(): Promise<string> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  const token = response.data?.idToken;
  if (!token) throw new Error('Brak tokenu Google');
  return token;
}

export async function getGoogleTokens(): Promise<{ idToken: string; accessToken: string }> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  await GoogleSignin.signIn();
  const { idToken, accessToken } = await GoogleSignin.getTokens();
  if (!idToken) throw new Error('Brak tokenu Google');
  return { idToken, accessToken };
}

export async function signOutGoogle(): Promise<void> {
  await GoogleSignin.signOut();
}

export async function getFacebookAccessToken(): Promise<string | null> {
  const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
  if (result.isCancelled) return null;
  const data = await AccessToken.getCurrentAccessToken();
  if (!data) throw new Error('Brak tokenu Facebook');
  return data.accessToken;
}

export async function signOutFacebook(): Promise<void> {
  LoginManager.logOut();
}
