import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, Pressable,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Header, Icon } from '@components';
import { COLORS, SIZES } from '@constants';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserData } from '@services/useUserData';
import {
  getFirestore, collection, addDoc, query, orderBy, limit,
  onSnapshot, serverTimestamp,
} from '@react-native-firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from '@react-native-firebase/auth';
import { useRoute } from '@react-navigation/native';

const RESTRICTED_PATTERNS = {
  email: /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/,
  phone: /[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/,
  social: /@[a-zA-Z0-9._]+/,
};

const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const MessageBubble = ({ item, isMine }) => (
  <View
    style={[
      styles.messageContainer,
      styles.messageBubble,
      isMine
        ? [styles.sentContainer, styles.sent, { backgroundColor: COLORS.primary }]
        : [styles.receivedContainer, styles.received, { backgroundColor: '#f0f0f0' }],
    ]}
  >
    {!isMine && <Text style={styles.senderName}>{item.senderName}</Text>}
    <Text style={[styles.messageText, { color: isMine ? '#fff' : '#000' }]}>{item.text}</Text>
    <Text style={[styles.timestamp, isMine ? styles.sentTimestamp : styles.receivedTimestamp]}>
      {formatTime(item.createdAt)}
    </Text>
  </View>
);

export default function ChatComponent() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showError, setShowError] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const { userData } = useUserData();
  const route = useRoute<any>();
  const gameId = String(route.params?.game_id ?? '');

  const checkRestrictions = (text) =>
    Object.values(RESTRICTED_PATTERNS).some(p => p.test(text));

  // 1) Make sure Firebase has some signed-in user
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, user => setAuthReady(!!user));
    if (!auth.currentUser) {
      signInAnonymously(auth).catch(e =>
        console.warn('Anon sign-in failed:', e.code, e.message)
      );
    }
    return unsub;
  }, []);

  // 2) Listen to messages only after auth is ready
  useEffect(() => {
    const q = query(
      collection(getFirestore(), 'games', String(gameId), 'messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    return onSnapshot(
      q,
      snap =>
        setMessages(
          snap.docs.map(d => {
            const data = d.data({ serverTimestamps: 'estimate' });
            return { id: d.id, ...data, createdAt: data.createdAt?.toMillis?.() ?? Date.now() };
          })
        ),
      err => console.warn('Chat listener error', err)
    );
  }, [gameId, authReady]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    const senderId = userData?.id;
    if (!senderId) {
      console.warn('User not loaded yet');
      return;
    }

    if (checkRestrictions(text)) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setInputText('');
      await addDoc(collection(getFirestore(), 'games', String(gameId), 'messages'), {
        text,
        senderId: String(senderId),
        senderName: `${userData?.firstName ?? ''} ${userData?.lastName ?? ''}`.trim() || 'Player',
        createdAt: serverTimestamp(),
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView style={styles.area}>
        <Header title={t('viewShipment.Chat')} />
        <FlatList
          data={messages}
          inverted
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <MessageBubble item={item} isMine={item.senderId === String(userData?.id)} />
          )}
          contentContainerStyle={styles.messagesList}
        />

        {showError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Sharing contact information is not allowed</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={handleSend}
            style={({ pressed }) => [styles.sendButton, pressed && styles.sendButtonPressed]}
          >
            <Icon type="ionicons" name="send" size={24} color="white" />
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    }, 
    area: {
        flex: 1,
        backgroundColor: COLORS.white,
        minHeight: SIZES.height
    },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold', 
    color: '#000',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  sentContainer: {
    alignSelf: 'flex-end',
  },
  receivedContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 20,
    padding: 12,
    minWidth: 80,
  },
  sent: {
    borderTopRightRadius: 4,
  },
  received: {
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  sentText: {
    color: '#000',
  },
  receivedText: {
    color: '#000',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    marginRight: 4,
  },
  sentTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  receivedTimestamp: {
    color: '#8e8e8e',
  },
  statusIcon: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
  errorContainer: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

