import React, { useCallback, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { deleteConversation, getConversations, SavedConversation, setActiveConversation } from '@/lib/storage';

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<SavedConversation[]>([]);
  const refresh = useCallback(() => { getConversations().then(setItems); }, []);
  useFocusEffect(refresh);
  async function remove(id: string) { await deleteConversation(id); refresh(); }

  return <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 18, paddingBottom: insets.bottom + 80 }]}>
    <View style={styles.header}><View><Text style={[styles.kicker, { color: colors.primary }]}>YOUR SPACE</Text><Text style={[styles.title, { color: colors.ink }]}>Library</Text></View><View style={[styles.count, { backgroundColor: colors.secondary }]}><Text style={[styles.countText, { color: colors.secondaryForeground }]}>{items.length}</Text></View></View>
    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Your best thinking, kept close.</Text>
    {items.length === 0 ? <View style={styles.empty}><View style={[styles.emptyIcon, { backgroundColor: colors.lilac }]}><Feather name="bookmark" size={22} color={colors.primary} /></View><Text style={[styles.emptyTitle, { color: colors.ink }]}>Nothing saved yet</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Start a conversation and it will appear here automatically.</Text></View> : <View style={styles.list}>{items.map((item) => <View key={item.id} style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}><Pressable style={styles.itemMain} onPress={async () => { await setActiveConversation(item.id); router.replace('/(tabs)'); }}><View style={[styles.itemIcon, { backgroundColor: colors.sky }]}><Feather name="message-square" size={17} color={colors.primary} /></View><View style={styles.itemCopy}><Text numberOfLines={1} style={[styles.itemTitle, { color: colors.ink }]}>{item.title}</Text><Text numberOfLines={2} style={[styles.itemPreview, { color: colors.mutedForeground }]}>{item.preview}</Text></View></Pressable><Pressable onPress={() => remove(item.id)} hitSlop={12}><Feather name="trash-2" size={17} color={colors.mutedForeground} /></Pressable></View>)}</View>}
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  kicker: { fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 9 },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -1.2 },
  count: { minWidth: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  countText: { fontSize: 14, fontWeight: '700' },
  subtitle: { fontSize: 15, marginTop: 10, marginBottom: 26 },
  list: { gap: 10 },
  item: { minHeight: 88, borderRadius: 18, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center' },
  itemMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  itemCopy: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700', marginBottom: 5 },
  itemPreview: { fontSize: 12, lineHeight: 17 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34, paddingBottom: 90 },
  emptyIcon: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
});