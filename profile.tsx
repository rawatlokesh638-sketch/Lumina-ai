import React from 'react';
import { Feather } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/expo';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress || 'Your account';
  const name = user?.firstName || email.split('@')[0] || 'Lumina user';

  return <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 18, paddingBottom: insets.bottom + 80 }]}>
    <Text style={[styles.kicker, { color: colors.primary }]}>YOUR ACCOUNT</Text><Text style={[styles.title, { color: colors.ink }]}>Profile</Text>
    <View style={[styles.identity, { backgroundColor: colors.navy }]}><View style={[styles.avatar, { backgroundColor: colors.coral }]}><Text style={[styles.avatarText, { color: colors.navy }]}>{name.slice(0, 1).toUpperCase()}</Text></View><View style={styles.identityCopy}><Text style={styles.identityName}>{name}</Text><Text style={styles.identityEmail}>{email}</Text></View><Feather name="check-circle" size={19} color={colors.green} /></View>
    <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>PREFERENCES</Text>{[['sliders', 'Response style', 'Balanced and thoughtful'], ['shield', 'Privacy', 'Your chats stay on this device'], ['help-circle', 'Help center', 'Get answers about Lumina']].map(([icon, label, value]) => <Pressable key={label} style={[styles.setting, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.settingIcon, { backgroundColor: colors.secondary }]}><Feather name={icon as keyof typeof Feather.glyphMap} size={17} color={colors.primary} /></View><View style={styles.settingCopy}><Text style={[styles.settingLabel, { color: colors.ink }]}>{label}</Text><Text style={[styles.settingValue, { color: colors.mutedForeground }]}>{value}</Text></View><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></Pressable>)}</View>
    <Pressable testID="sign-out" onPress={async () => { await signOut(); router.replace('/'); }} style={[styles.signOut, { borderColor: colors.border }]}><Feather name="log-out" size={17} color={colors.destructive} /><Text style={[styles.signOutText, { color: colors.destructive }]}>Sign out</Text></Pressable>
    <Text style={[styles.version, { color: colors.mutedForeground }]}>Lumina 1.0.0 · Built for better thinking</Text>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  kicker: { fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 9 },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -1.2, marginBottom: 24 },
  identity: { borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800' },
  identityCopy: { flex: 1 },
  identityName: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  identityEmail: { color: '#b9c8e8', fontSize: 12 },
  section: { marginTop: 28, gap: 9 },
  sectionTitle: { fontSize: 11, letterSpacing: 1.6, fontWeight: '700', marginBottom: 3 },
  setting: { minHeight: 68, borderRadius: 17, borderWidth: 1, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  settingIcon: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  settingValue: { fontSize: 11 },
  signOut: { height: 50, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28 },
  signOutText: { fontSize: 14, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: 11, marginTop: 18 },
});