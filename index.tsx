import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { ChatMessage, consumeActiveConversation, saveConversation } from '@/lib/storage';

type Mode = { key: string; label: string; icon: keyof typeof Feather.glyphMap; prompt: string };
const modes: Mode[] = [
  { key: 'general', label: 'Think', icon: 'zap', prompt: 'Help me think through this clearly: ' },
  { key: 'write', label: 'Write', icon: 'edit-3', prompt: 'Help me write this with a confident, human tone: ' },
  { key: 'plan', label: 'Plan', icon: 'map', prompt: 'Turn this into a practical step-by-step plan: ' },
  { key: 'learn', label: 'Learn', icon: 'book-open', prompt: 'Explain this simply, then give me an example: ' },
  { key: 'translate', label: 'Translate', icon: 'globe', prompt: 'Translate this naturally and preserve the tone: ' },
];

function makeId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('general');
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState(makeId);
  const [lastError, setLastError] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    let mounted = true;
    consumeActiveConversation().then((saved) => {
      if (mounted && saved) {
        setConversationId(saved.id);
        setMessages(saved.messages);
      }
    });
    return () => { mounted = false; };
  }, []);

  const activeMode = useMemo(() => modes.find((item) => item.key === mode) ?? modes[0], [mode]);

  async function persist(nextMessages: ChatMessage[]) {
    const firstUser = nextMessages.find((item) => item.role === 'user');
    await saveConversation({
      id: conversationId,
      title: firstUser?.text.slice(0, 42) || 'New conversation',
      preview: nextMessages[nextMessages.length - 1]?.text.slice(0, 90) || 'No messages yet',
      messages: nextMessages,
      updatedAt: Date.now(),
    });
  }

  async function sendMessage(text = input) {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    const userMessage: ChatMessage = { id: makeId(), role: 'user', text: trimmed, createdAt: Date.now() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLastError('');
    setIsSending(true);
    try {
      const token = await getToken();
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      if (!domain || !token) throw new Error('Your secure session is not ready yet.');
      const response = await fetch('https://' + domain + '/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ message: trimmed, mode: activeMode.key, history: nextMessages.slice(-12).map(({ role: itemRole, text: itemText }) => ({ role: itemRole, text: itemText })) }),
      });
      const payload = await response.json() as { reply?: string; error?: string };
      if (!response.ok || !payload.reply) throw new Error(payload.error || 'Lumina could not answer right now.');
      const assistantMessage: ChatMessage = { id: makeId(), role: 'assistant', text: payload.reply, createdAt: Date.now() };
      const complete = [...nextMessages, assistantMessage];
      setMessages(complete);
      await persist(complete);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      setLastError(message);
      setMessages(nextMessages);
    } finally {
      setIsSending(false);
    }
  }

  function newChat() {
    setConversationId(makeId());
    setMessages([]);
    setInput('');
    setLastError('');
  }

  const displayMessages = [...messages].reverse();
  return (
    <KeyboardAvoidingView style={[styles.screen, { backgroundColor: colors.background }]} behavior="padding" keyboardVerticalOffset={0}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View><Text style={[styles.greeting, { color: colors.mutedForeground }]}>THURSDAY, AUGUST 27</Text><Text style={[styles.headerTitle, { color: colors.ink }]}>What are we solving?</Text></View>
        <Pressable onPress={newChat} testID="new-chat" style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="plus" size={20} color={colors.ink} /></Pressable>
      </View>
      {messages.length === 0 ? <FlatList
        data={[] as ChatMessage[]}
        inverted
        keyExtractor={() => 'empty'}
        contentContainerStyle={styles.emptyContent}
        keyboardShouldPersistTaps="handled"
        renderItem={() => null}
        ListHeaderComponent={<View style={styles.emptyWrap}>
          <View style={[styles.spark, { backgroundColor: colors.navy }]}><Feather name="star" size={23} color={colors.coral} /></View>
          <Text style={[styles.emptyTitle, { color: colors.ink }]}>A little clarity{'\n'}goes a long way.</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Choose a mode or start with whatever is on your mind.</Text>
          <View style={styles.promptGrid}>
            {modes.slice(1).map((item) => <Pressable key={item.key} onPress={() => { setMode(item.key); setInput(item.prompt); inputRef.current?.focus(); }} style={({ pressed }) => [styles.promptCard, { backgroundColor: item.key === 'write' ? colors.lilac : colors.sky, opacity: pressed ? 0.72 : 1 }]}><Feather name={item.icon} size={18} color={colors.primary} /><Text style={[styles.promptLabel, { color: colors.ink }]}>{item.label}</Text><Text style={[styles.promptHint, { color: colors.mutedForeground }]}>{item.key === 'write' ? 'Find the right words' : item.key === 'plan' ? 'Make it actionable' : item.key === 'learn' ? 'Go from stuck to clear' : 'Speak another language'}</Text></Pressable>)}
          </View>
        </View>}
      /> : <FlatList
        inverted
        data={displayMessages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={isSending ? <View style={styles.typingRow}><View style={[styles.typingDot, { backgroundColor: colors.coral }]} /><Text style={[styles.typingText, { color: colors.mutedForeground }]}>Lumina is thinking…</Text></View> : null}
        renderItem={({ item }) => <View style={[styles.messageRow, item.role === 'user' ? styles.userRow : styles.assistantRow]}><View style={[styles.messageBubble, item.role === 'user' ? { backgroundColor: colors.navy } : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}><Text style={[styles.messageText, { color: item.role === 'user' ? '#ffffff' : colors.ink }]}>{item.text}</Text></View></View>}
      />}
      {lastError ? <View style={[styles.errorBar, { backgroundColor: colors.accent }]}><Feather name="alert-circle" size={15} color={colors.accentForeground} /><Text style={[styles.errorText, { color: colors.accentForeground }]}>{lastError}</Text></View> : null}
      <View style={[styles.composerShell, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.background }]}>
        <View style={styles.modeRow}>{modes.map((item) => <Pressable key={item.key} onPress={() => setMode(item.key)} style={[styles.modeChip, { backgroundColor: mode === item.key ? colors.secondary : colors.card, borderColor: mode === item.key ? colors.primary : colors.border }]}><Feather name={item.icon} size={14} color={mode === item.key ? colors.primary : colors.mutedForeground} /><Text style={[styles.modeText, { color: mode === item.key ? colors.secondaryForeground : colors.mutedForeground }]}>{item.label}</Text></Pressable>)}</View>
        <View style={[styles.composer, { backgroundColor: colors.card, borderColor: colors.border }]}><TextInput ref={inputRef} testID="chat-input" style={[styles.input, { color: colors.ink }]} multiline maxLength={8000} value={input} onChangeText={setInput} placeholder={activeMode.prompt} placeholderTextColor={colors.mutedForeground} /><Pressable testID="send-button" onPress={() => sendMessage()} disabled={!input.trim() || isSending} style={({ pressed }) => [styles.sendButton, { backgroundColor: colors.primary, opacity: pressed || !input.trim() || isSending ? 0.5 : 1 }]}><Feather name="arrow-up" size={19} color={colors.primaryForeground} /></Pressable></View>
        <Text style={[styles.safeNote, { color: colors.mutedForeground }]}>Lumina can make mistakes. Check important information.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, greeting: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700', marginBottom: 7 }, headerTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.8 }, headerButton: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, emptyContent: { flexGrow: 1, justifyContent: 'flex-end' }, emptyWrap: { paddingHorizontal: 20, paddingBottom: 20 }, spark: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }, emptyTitle: { fontSize: 32, lineHeight: 37, fontWeight: '700', letterSpacing: -1.2 }, emptySubtitle: { fontSize: 15, lineHeight: 22, marginTop: 10, maxWidth: 320 }, promptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 28 }, promptCard: { width: '48%', minHeight: 106, borderRadius: 18, padding: 14, justifyContent: 'space-between' }, promptLabel: { fontSize: 15, fontWeight: '700', marginTop: 10 }, promptHint: { fontSize: 11, lineHeight: 15, marginTop: 2 }, messageList: { padding: 18, gap: 12 }, messageRow: { width: '100%', marginBottom: 11 }, userRow: { alignItems: 'flex-end' }, assistantRow: { alignItems: 'flex-start' }, messageBubble: { maxWidth: '88%', paddingHorizontal: 16, paddingVertical: 13, borderRadius: 18 }, messageText: { fontSize: 15, lineHeight: 22 }, typingRow: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 8 }, typingDot: { width: 8, height: 8, borderRadius: 8 }, typingText: { fontSize: 12 }, errorBar: { flexDirection: 'row', alignItems: 'center', gap: 7, marginHorizontal: 20, padding: 10, borderRadius: 12 }, errorText: { flex: 1, fontSize: 12, lineHeight: 17 }, composerShell: { paddingTop: 6, paddingHorizontal: 16 }, modeRow: { flexDirection: 'row', gap: 7, marginBottom: 9 }, modeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 99, borderWidth: 1 }, modeText: { fontSize: 11, fontWeight: '600' }, composer: { minHeight: 58, borderRadius: 19, borderWidth: 1, flexDirection: 'row', alignItems: 'flex-end', paddingLeft: 15, paddingVertical: 7, paddingRight: 7 }, input: { flex: 1, minHeight: 42, maxHeight: 110, fontSize: 15, paddingTop: 10, paddingBottom: 8 }, sendButton: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, safeNote: { textAlign: 'center', fontSize: 10, marginTop: 8 },
});
