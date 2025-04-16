import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ImageBackground, Alert } from 'react-native';
import { getFirestore, doc, updateDoc, setDoc } from 'firebase/firestore';
import { auth } from '../services/firebase';

const EditProfileScreen = ({ navigation }) => {
  const [username, setUsername] = useState(auth.currentUser?.email?.split('@')[0] || '');
  const [emoji, setEmoji] = useState('🌟');
  const [isLoading, setIsLoading] = useState(false);

  const emojiOptions = [
    '😎', // cool shades
    '🤖', // robot – techy/fun
    '🦄', // unicorn – magical/unique
    '🐸', // frog – meme culture/fun
    '🍕', // pizza – foodie/vibe
    '🛸', // UFO – weird/fun energy
    '👾', // alien monster – retro gamer or quirky
    '💩', // poop – chaotic fun
    '🪩', // disco ball – party person
    '🕺', // dancing man – vibing
    '🔥', // fire – bold, energetic
  '🚀', // rocket – ambitious, going places
  '🎮', // game controller – gamer
  '🎧', // headphones – music lover
  '📚', // books – studious, reader
  '🧠', // brain – thoughtful, intelligent
  '💻', // laptop – coder, tech-savvy
  '🎯', // target – focused, goal-oriented
  '🗺️', // map – traveler, explorer
  ];
  const handleSave = async () => {
    if (!auth.currentUser) return;
    
    setIsLoading(true);
    try {
      const db = getFirestore();
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      await setDoc(userRef, {
        username: username,
        emoji: emoji,
        email: auth.currentUser.email,
      }, { merge: true });

      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/bg.png')} 
      style={styles.container} 
      resizeMode="cover"
    >
      <View style={styles.content}>
        <Text style={styles.title}>Edit Profile</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>

        <View style={styles.emojiSection}>
          <Text style={styles.label}>Choose Your Emoji</Text>
          <View style={styles.emojiGrid}>
            {emojiOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.emojiOption, emoji === option && styles.selectedEmoji]}
                onPress={() => setEmoji(option)}
              >
                <Text style={styles.emojiText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>{isLoading ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(100, 206, 178, 0.15)',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  emojiSection: {
    marginBottom: 30,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  emojiOption: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(100, 206, 178, 0.15)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedEmoji: {
    backgroundColor: 'rgba(57, 220, 187, 0.3)',
    borderColor: '#fff',
  },
  emojiText: {
    fontSize: 24,
  },
  saveButton: {
    backgroundColor: 'rgba(57, 220, 187, 0.15)',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(57, 187, 220, 0.3)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
});

export default EditProfileScreen;