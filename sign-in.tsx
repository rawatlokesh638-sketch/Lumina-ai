import React, { useState } from 'react';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Feather } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useSignIn } from '@clerk/expo';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isLoading = fetchStatus === 'fetching';

  async function handleSubmit() {
    const result = await signIn.password({ emailAddress: emailAddress.trim(), password });
    if (result.error) return;
    if (signIn.status === 'complete') {
      await signIn.finalize();
      router.replace('/(tabs)');
    } else if (signIn.status === 'needs_client_trust') {
      const factor = signIn.supportedSecondFactors.find((item) => item.strategy === 'email_code');
      if (factor) await signIn.mfa.sendEmailCode();
    }
  }

  async function handleVerify() {
    await signIn.mfa.verifyEmailCode({ code });
    if (signIn.status === 'complete') {
      await signIn.finalize();
      router.replace('/(tabs)');
    }
  }

  const errorMessage = errors?.fields?.identifier?.message || errors?.fields?.password?.message || errors?.fields?.code?.message;
  return (
    <KeyboardAwareScrollViewCompat style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }} bottomOffset={24} keyboardShouldPersistTaps="handled">
      <Pressable onPress={() => router.back()} style={styles.backButton}><Feather name="arrow-left" size={21} color={colors.ink} /></Pressable>
      <View style={styles.brandRow}><View style={[styles.brandMark, { backgroundColor: colors.navy }]}><Feather name="star" size={18} color={colors.coral} /></View><Text style={[styles.brand, { color: colors.ink }]}>lumina</Text></View>
      <Text style={[styles.kicker, { color: colors.primary }]}>WELCOME BACK</Text>
      <Text style={[styles.title, { color: colors.ink }]}>Good to see you.</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Pick up where your thinking left off.</Text>
      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.ink }]}>Email address</Text>
        <TextInput testID="email-input" style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.ink }]} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" value={emailAddress} onChangeText={setEmailAddress} placeholder="you@example.com" placeholderTextColor={colors.mutedForeground} />
        <Text style={[styles.label, { color: colors.ink }]}>Password</Text>
        <TextInput testID="password-input" style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.ink }]} secureTextEntry value={password} onChangeText={setPassword} placeholder="Your password" placeholderTextColor={colors.mutedForeground} />
        {errorMessage ? <Text style={[styles.error, { color: colors.destructive }]}>{errorMessage}</Text> : null}
        <Pressable testID="continue-button" onPress={handleSubmit} disabled={!emailAddress || !password || isLoading} style={({ pressed }) => [styles.button, { backgroundColor: colors.primary, opacity: pressed || isLoading ? 0.7 : (!emailAddress || !password ? 0.5 : 1) }]}><Text style={[styles.buttonText, { color: colors.primaryForeground }]}>{isLoading ? 'Checking…' : 'Continue'}</Text><Feather name="arrow-right" size={18} color={colors.primaryForeground} /></Pressable>
      </View>
      {signIn.status === 'needs_client_trust' ? <View style={[styles.verifyBox, { backgroundColor: colors.secondary }]}><Text style={[styles.verifyTitle, { color: colors.ink }]}>Check your email</Text><Text style={[styles.verifyText, { color: colors.mutedForeground }]}>Enter the verification code we sent you.</Text><TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.ink }]} keyboardType="number-pad" value={code} onChangeText={setCode} placeholder="6-digit code" placeholderTextColor={colors.mutedForeground} /><Pressable onPress={handleVerify} style={[styles.button, { backgroundColor: colors.navy }]}><Text style={[styles.buttonText, { color: '#ffffff' }]}>Verify</Text></Pressable></View> : null}
      <View style={styles.footer}><Text style={[styles.footerText, { color: colors.mutedForeground }]}>New to Lumina?</Text><Link href="/sign-up" asChild><Pressable><Text style={[styles.link, { color: colors.primary }]}> Create an account</Text></Pressable></Link></View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, backButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 22 }, brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 58 }, brandMark: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, brand: { fontSize: 18, fontWeight: '700' }, kicker: { fontSize: 11, letterSpacing: 2, fontWeight: '700', marginBottom: 12 }, title: { fontSize: 34, fontWeight: '700', letterSpacing: -1, marginBottom: 10 }, subtitle: { fontSize: 16, lineHeight: 24, marginBottom: 34 }, form: { gap: 11 }, label: { fontSize: 13, fontWeight: '600', marginTop: 3 }, input: { height: 54, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, fontSize: 15 }, error: { fontSize: 13, marginTop: 2 }, button: { minHeight: 54, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 10 }, buttonText: { fontSize: 15, fontWeight: '700' }, footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 34 }, footerText: { fontSize: 14 }, link: { fontSize: 14, fontWeight: '700' }, verifyBox: { borderRadius: 20, padding: 16, marginTop: 18, gap: 8 }, verifyTitle: { fontSize: 16, fontWeight: '700' }, verifyText: { fontSize: 13, lineHeight: 18 },
});