import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { auth } from '../services/firebase';
import { retry } from '../utils/retry';
import { addXP } from '../services/userService';

const MOODS = [
  { emoji: '😊', text: 'Happy' },
  { emoji: '😢', text: 'Sad' },
  { emoji: '🎉', text: 'Celebratory' },
  { emoji: '🌧️', text: 'Nostalgic' },
  { emoji: '😌', text: 'Peaceful' },
  { emoji: '🤔', text: 'Thoughtful' },
];

const CreatePinScreen = ({ navigation }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'Please sign in to create a pin.');
      navigation.navigate('Login');
    }
  }, []);

  const handleMapPress = (event) => {
    setLocation(event.nativeEvent.coordinate);
  };

  const handleSubmit = async () => {
    try {
      if (!title.trim() || !description.trim() || !location || !selectedMood) {
        Alert.alert('Error', 'Please fill in all required fields and place a pin on the map');
        return;
      }

      if (!auth.currentUser) {
        Alert.alert('Error', 'No authenticated user found. Please sign in.');
        return;
      }

      const db = getFirestore();
      const pinData = {
        title: title.trim(),
        description: description.trim(),
        mood: selectedMood,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
      };

      // Save pin with retry
      await retry(async () => {
        await addDoc(collection(db, 'pins'), pinData);
      }, 3);

      // Add XP for creating a pin
      await addXP(auth.currentUser.uid, 'CREATE_PIN').catch((xpError) => {
        console.error('Failed to add XP for CREATE_PIN:', xpError);
      });

      Alert.alert(
        'Success',
        'Your memory has been pinned successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

      setTitle('');
      setDescription('');
      setSelectedMood(null);
      setLocation(null);
    } catch (error) {
      console.error('Error saving pin:', error);
      Alert.alert(
        'Error',
        'Failed to save your memory. Please check your internet connection and try again. Details: ' + error.message
      );
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/bg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>What memory are you pinning today?</Text>
            <Text style={styles.subtitle}>Tell your story and place it on the map.</Text>
          </View>

          <Text style={styles.sectionTitle}>How were you feeling?</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.moodContainer}
          >
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood.text}
                style={[
                  styles.moodButton,
                  selectedMood?.text === mood.text && styles.selectedMoodButton,
                ]}
                onPress={() => setSelectedMood(mood)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodText}>{mood.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.titleInput}
              placeholder="Give your memory a title..."
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Share the story behind this moment..."
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
                   initialRegion={{
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              {location && (
                <Marker
                  coordinate={location}
                  draggable
                  onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
                />
              )}
            </MapView>
            {location && (
              <Text style={styles.coordinatesText}>
                📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Pin My Memory</Text>
          </TouchableOpacity>
        </ScrollView>
      </BlurView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 85,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  moodContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  moodButton: {
    backgroundColor: 'rgba(57, 220, 187, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(57, 187, 220, 0.3)',
  },
  selectedMoodButton: {
    backgroundColor: 'rgba(57, 220, 187, 0.3)',
    borderColor: 'rgba(57, 187, 220, 0.5)',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodText: {
    color: '#fff',
    fontSize: 12,
  },
  inputContainer: {
    backgroundColor: 'rgba(57, 220, 187, 0.15)',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(57, 187, 220, 0.3)',
  },
  titleInput: {
    color: '#fff',
    padding: 16,
    fontSize: 16,
  },
  descriptionInput: {
    color: '#fff',
    padding: 16,
    fontSize: 16,
    minHeight: 120,
  },
  mapContainer: {
    backgroundColor: 'rgba(57, 220, 187, 0.15)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(57, 187, 220, 0.3)',
  },
  map: {
    width: '100%',
    height: 300,
  },
  coordinatesText: {
    color: '#fff',
    padding: 12,
    fontSize: 12,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  submitButton: {
    backgroundColor: 'rgba(57, 220, 187, 0.3)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(57, 187, 220, 0.5)',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreatePinScreen;