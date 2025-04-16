import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, increment,setDoc } from 'firebase/firestore';
import { auth } from '../services/firebase';
import { BlurView } from 'expo-blur';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { addXP } from '../services/userService';

const StoryScreen = ({ route }) => {
  const navigation = useNavigation();
  const { pin } = route.params || {};
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePin = async () => {
    if (isSaving || !pin || !auth.currentUser) {
      if (!auth.currentUser) {
        Alert.alert('Error', 'Please log in to save pins.');
        return;
      }
      return;
    }

    try {
      setIsSaving(true);
      const db = getFirestore();
      const userId = auth.currentUser.uid;
      const savedPinRef = doc(db, 'users', userId, 'savedPins', pin.id);

      // Check for duplicate save
      const savedPinDoc = await getDoc(savedPinRef);
      if (savedPinDoc.exists()) {
        Alert.alert('Info', 'This pin is already saved.');
        return;
      }

      // Save to user's savedPins subcollection
await setDoc(doc(db, 'users', userId, 'savedPins', pin.id), {
        pinId: pin.id,
        title: pin.title,
        description: pin.description,
        mood: pin.mood,
        location: pin.location,
        savedBy: userId,
        savedAt: new Date().toISOString(),
      });

      // Add XP for saving a pin
      await addXP(userId, 'SAVE_PIN').catch((xpError) => {
        console.error('Failed to add XP for SAVE_PIN:', xpError);
      });

      Alert.alert('Success', 'Pin saved successfully!');
    } catch (error) {
      console.error('Error saving pin:', error);
      const errorMessage =
        error.code === 'permission-denied'
          ? 'You do not have permission to save pins. Please try again later.'
          : 'Failed to save pin. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ImageBackground source={require('../../assets/bg.png')} style={styles.container} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.moodContainer}>
          <Text style={styles.mood}>{pin?.mood?.emoji || '😊'}</Text>
        </View>
        <View style={styles.contentBox}>
          <Text style={styles.title}>{pin?.title || 'Memory Title'}</Text>
        </View>
        <View style={styles.contentBox}>
          <Text style={styles.description}>{pin?.description || 'No description available.'}</Text>
        </View>
        
        {pin?.location && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={{
                latitude: pin.location.latitude,
                longitude: pin.location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: pin.location.latitude,
                  longitude: pin.location.longitude,
                }}
              />
            </MapView>
          </View>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, isSaving && styles.disabledButton]} 
            onPress={handleSavePin}
            disabled={isSaving}
          >
            <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Save Pin'}</Text>
          </TouchableOpacity>


        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    paddingTop: 80,
  },
  moodContainer: {
    backgroundColor: 'rgba(100, 206, 178, 0.15)',
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  mood: {
    fontSize: 64,
  },
  contentBox: {
    backgroundColor: 'rgba(100, 206, 178, 0.15)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    color: '#fff',
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    backgroundColor: 'rgba(57, 220, 187, 0.15)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(57, 187, 220, 0.3)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default StoryScreen;