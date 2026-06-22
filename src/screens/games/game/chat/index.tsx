import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Header, Icon } from '@components';
import { COLORS, SIZES } from '@constants';
import { useTranslation } from 'react-i18next';
import firestore from '@react-native-firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
const RESTRICTED_PATTERNS = {
  email: /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g,
  phone: /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/g,
  social: /[@][a-zA-Z0-9._]+/g,
};

const ChatComponent = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showError, setShowError] = useState(false);
  const flatListRef = useRef(null);

  const checkRestrictions = (text) => {
    for (const [key, pattern] of Object.entries(RESTRICTED_PATTERNS)) {
      if (pattern.test(text)) {
        return true;
      }
    }
    return false;
  };

  const handleSend = () => {
    if (inputText.trim() === '') return;
    
    if (checkRestrictions(inputText)) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: Date.now(),
      isSent: true,
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    // Simulate received message
    setTimeout(() => {
      const response = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! 😊",
        timestamp: Date.now(),
        isSent: false,
        status: 'read'
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const MessageBubble = ({ item }) => (
    <View style={[styles.messageContainer, item.isSent ? styles.sentContainer : styles.receivedContainer]}>
        <Text style={[styles.messageText, item.isSent ? styles.sentText : styles.receivedText]}>
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.timestamp, item.isSent ? styles.sentTimestamp : styles.receivedTimestamp]}>
            {formatTime(item.timestamp)}
          </Text>
          {item.isSent && (
            <Icon type="ionicons"
              name={item.status === 'read' ? 'checkmark-done' : 'checkmark'}
              size={16}
              color={item.status === 'read' ? '#0084ff' : '#8e8e8e'}
              style={styles.statusIcon}
            />
          )}
        </View>
    </View>
  );

  return (
    
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
        <SafeAreaView style={styles.area}>

      <Header title={t('viewShipment.Chat')} />
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <MessageBubble item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
      />

      {showError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Sharing contact information is not allowed
          </Text>
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
          style={({ pressed }) => [
            styles.sendButton,
            pressed && styles.sendButtonPressed
          ]}
        >
          <Icon type="ionicons" name="send" size={24} color="white" />
        </Pressable>
      </View></SafeAreaView>
    </KeyboardAvoidingView>
  );
};

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

export default ChatComponent;