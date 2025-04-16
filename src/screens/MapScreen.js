// src/screens/MapScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, Animated } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { collection, getDocs, getFirestore } from 'firebase/firestore';

const MapScreen = ({ navigation }) => {
  const [pins, setPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchPins();
    requestLocationPermission();
    // Set up real-time pin updates
    const interval = setInterval(fetchPins, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPins = async () => {
    try {
      const db = getFirestore();
      const pinsCollection = collection(db, 'pins');
      const pinsSnapshot = await getDocs(pinsCollection);
      const pinsData = pinsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPins(pinsData);
    } catch (error) {
      console.error('Error fetching pins:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handlePinPress = (pin) => {
    setSelectedPin(pin);
    setIsModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };

  const handleCloseModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => setIsModalVisible(false));
  };

  const handleViewFullStory = () => {
    navigation.navigate('Story', { pin: selectedPin });
  };

  const handleRecenterPress = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={pin.location}
            onPress={() => handlePinPress(pin)}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerEmoji}>{pin.mood.emoji}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {userLocation && (
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={handleRecenterPress}
        >
          <BlurView intensity={20} tint="dark" style={styles.recenterButtonInner}>
            <Ionicons name="navigate" size={24} color="#fff" />
          </BlurView>
        </TouchableOpacity>
      )}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleCloseModal}
        >
          <Animated.View 
            style={[styles.modalContent, {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0]
                })
              }]
            }]}
          >
            {selectedPin && (
              <View style={styles.bottomSheetContent}>
                <Text style={styles.pinEmoji}>{selectedPin.mood.emoji}</Text>
                <Text style={styles.pinTitle}>{selectedPin.title}</Text>
                <Text style={styles.pinDescription} numberOfLines={2}>
                  {selectedPin.description}
                </Text>
                <TouchableOpacity
                  style={styles.viewStoryButton}
                  onPress={handleViewFullStory}
                >
                  <Text style={styles.viewStoryButtonText}>View Full Story</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    backgroundColor: 'rgba(57, 220, 187, 0.15)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(57, 187, 220, 0.3)',
  },
  markerEmoji: {
    fontSize: 20,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    overflow: 'hidden',
    borderRadius: 30,
  },
  recenterButtonInner: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(57, 220, 187, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(57, 187, 220, 0.3)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(30, 85, 71, 0.97)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    height: '25%',
  },
  bottomSheetContent: {
    padding: 16,
    alignItems: 'center',
  },
  pinEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  pinTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  pinDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    textAlign: 'center',
  },
  viewStoryButton: {
    backgroundColor: 'rgba(57, 220, 187, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(57, 187, 220, 0.5)',
  },
  viewStoryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MapScreen;