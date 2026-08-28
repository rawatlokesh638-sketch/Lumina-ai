import React, { useState } from 'react';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Feather } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useSignUp } from '@clerk/expo';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isLoading = fetchStatus === 'fetching';
  const verifying = signUp.status === 'missing_requirements' && signUp.unverifiedFields.includes('email_address');

  async function handleSubmit() {
    const result = await signUp.password({ emailAddress: emailAddress.trim(), password });
    if (result.error) return;
    await signUp.verifications.sendEmailCode();
  }

  async function handleVerify() {
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === 'complete') {
      await signUp.finalize();
      router.replace('/(tabs)');
    }
  }

  const errorMessage = errors?.fields?.emailAddress?.message || errors?.fields?.password?.message || errors?.fields?.code?.message;
  return (
    <KeyboardAwareScrollViewCompat style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }} bottomOffset={24} keyboardShouldPersistTaps="handled">
      <Pressable onPress={() => router.back()} style={styles.backButton}><Feather name="arrow-left" size={21} color={colors.ink} /></Pressable>
      <View style={styles.brandRow}><View style={[styles.brandMark, { backgroundColor: colors.navy }]}><Feather name="star" size={18} color={colors.coral} /></View><Text style={[styles.brand, { color: colors.ink }]}>lumina</Text></View>
      <Text style={[styles.kicker, { color: colors.primary }]}>{verifying ? 'ONE LAST STEP' : 'START FRESH'}</Text>
      <Text style={[styles.title, { color: colors.ink }]}>{verifying ? 'Verify your email.' : 'Make space for better ideas.'}</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{verifying ? 'We sent a six-digit code to your inbox.' : 'Your private space for thinking, creating, and getting unstuck.'}</Text>
      {!verifying ? <View style={styles.form}>
        <Text style={[styles.label, { color: colors.ink }]}>Email address</Text>
        <TextInput testID="signup-email" style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.ink }]} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" value={emailAddress} onChangeText={setEmailAddress} placeholder="you@example.com" placeholderTextColor={colors.mutedForeground} />
        <Text style={[styles.label, { color: colors.ink }]}>Create a password</Text>
        <TextInput testID="signup-password" style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.ink }]} secureTextEntry value={password} onChangeText={setPassword} placeholder="At least 8 characters" placeholderTextColor={colors.mutedForeground} />
        {errorMessage ? <Text style={[styles.error, { color: colors.destructive }]}>{errorMessage}</Text> : null}
        <Pressable testID="create-button" onPress={handleSubmit} disabled={!emailAddress || !password || isLoading} style={({ pressed }) => [styles.button, { backgroundColor: colors.primary, opacity: pressed || isLoading ? 0.7 : (!emailAddress || !password ? 0.5 : 1) }]}><Text style={[styles.buttonText, { color: colors.primaryForeground }]}>{isLoading ? 'Creating…' : 'Create account'}</Text><Feather name="arrow-right" size={18} color={colors.primaryForeground} /></Pressable>
      </View> : <View style={styles.form}>
        <Text style={[styles.label, { color: colors.ink }]}>Verification code</Text>
        <TextInput testID="verification-code" style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.ink }]} keyboardType="number-pad" value={code} onChangeText={setCode} placeholder="6-digit code" placeholderTextColor={colors.mutedForeground} />
        {errorMessage ? <Text style={[styles.error, { color: colors.destructive }]}>{errorMessage}</Text> : null}
        <Pressable testID="verify-button" onPress={handleVerify} disabled={!code || isLoading} style={({ pressed }) => [styles.button, { backgroundColor: colors.primary, opacity: pressed || isLoading ? 0.7 : (!code ? 0.5 : 1) }]}><Text style={[styles.buttonText, { color: colors.primaryForeground }]}>{isLoading ? 'Verifying…' : 'Verify and enter'}</Text><Feather name="check" size={18} color={colors.primaryForeground} /></Pressable>
        <Pressable onPress={() => signUp.verifications.sendEmailCode()}><Text style={[styles.resend, { color: colors.primary }]}>Send me a new code</Text></Pressable>
      </View>}
      <View style={styles.footer}><Text style={[styles.footerText, { color: colors.mutedForeground }]}>Already have an account?</Text><Link href="/sign-in" asChild><Pressable><Text style={[styles.link, { color: colors.primary }]}> Sign in</Text></Pressable></Link></View>
      <View nativeID="clerk-captcha" />
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, backButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 22 }, brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 58 }, brandMark: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, brand: { fontSize: 18, fontWeight: '700' }, kicker: { fontSize: 11, letterSpacing: 2, fontWeight: '700', marginBottom: 12 }, title: { fontSize: 32, lineHeight: 39, fontWeight: '700', letterSpacing: -0.9, marginBottom: 10 }, subtitle: { fontSize: 16, lineHeight: 24, marginBottom: 34 }, form: { gap: 11 }, label: { fontSize: 13, fontWeight: '600', marginTop: 3 }, input: { height: 54, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, fontSize: 15 }, error: { fontSize: 13, marginTop: 2 }, button: { minHeight: 54, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 10 }, buttonText: { fontSize: 15, fontWeight: '700' }, resend: { textAlign: 'center', fontSize: 13, fontWeight: '700', paddingVertical: 10 }, footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 34 }, footerText: { fontSize: 14 }, link: { fontSize: 14, fontWeight: '700' },
});