import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import {
  getFirestore,
  collection,
  query,
  getDocs,
} from 'firebase/firestore';
import { auth } from '../services/firebase';
import { useNavigation } from '@react-navigation/native';

const SavedPinsScreen = () => {
  const navigation = useNavigation();
  const [savedPins, setSavedPins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedPins();
  }, []);

  const fetchSavedPins = async () => {
    if (!auth.currentUser) return;

    try {
      const db = getFirestore();
      const savedPinsRef = collection(db, 'users', auth.currentUser.uid, 'savedPins');
      const q = query(savedPinsRef);
      const querySnapshot = await getDocs(q);

      const pins = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setSavedPins(pins);
    } catch (error) {
      console.error('Error fetching saved pins:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.pinCard}
      onPress={() => navigation.navigate('Story', { pin: item })}
    >
      <View style={styles.moodContainer}>
        <Text style={styles.moodEmoji}>{item.mood?.emoji || '😊'}</Text>
      </View>
      <View style={styles.pinInfo}>
        <Text style={styles.pinTitle}>{item.title}</Text>
        <Text style={styles.pinDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.savedDate}>
          Saved on {item.savedAt ? new Date(item.savedAt).toLocaleDateString() : 'Unknown'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../../assets/bg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#64CEB2" />
        </View>
      ) : savedPins.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No saved pins yet</Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Explore')}
          >
            <Text style={styles.exploreButtonText}>Explore Pins</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedPins}
          renderItem={renderItem}
          keyExtractor={item => `${item.id}-${item.savedAt || 'nosavedat'}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 100,
  },
  pinCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(100, 206, 178, 0.15)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  moodContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  moodEmoji: {
    fontSize: 30,
  },
  pinInfo: {
    flex: 1,
  },
  pinTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  pinDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  savedDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: 'rgba(57, 220, 187, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(57, 187, 220, 0.3)',
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SavedPinsScreen;
