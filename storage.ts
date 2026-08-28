import AsyncStorage from '@react-native-async-storage/async-storage';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: number;
};

export type SavedConversation = {
  id: string;
  title: string;
  preview: string;
  messages: ChatMessage[];
  updatedAt: number;
};

const HISTORY_KEY = '@lumina/conversations';
const ACTIVE_KEY = '@lumina/active-conversation';

export async function getConversations(): Promise<SavedConversation[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedConversation[];
  } catch {
    return [];
  }
}

export async function saveConversation(conversation: SavedConversation) {
  const current = await getConversations();
  const next = [conversation, ...current.filter((item) => item.id !== conversation.id)]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 30);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export async function deleteConversation(id: string) {
  const current = await getConversations();
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(current.filter((item) => item.id !== id)));
}

export async function setActiveConversation(id: string | null) {
  if (id) await AsyncStorage.setItem(ACTIVE_KEY, id);
  else await AsyncStorage.removeItem(ACTIVE_KEY);
}

export async function consumeActiveConversation(): Promise<SavedConversation | null> {
  const id = await AsyncStorage.getItem(ACTIVE_KEY);
  if (!id) return null;
  await AsyncStorage.removeItem(ACTIVE_KEY);
  const current = await getConversations();
  return current.find((item) => item.id === id) ?? null;
}