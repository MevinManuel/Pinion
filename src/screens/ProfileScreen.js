import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { getFirestore, collection, query, getDocs, doc, deleteDoc, getDoc, where } from 'firebase/firestore';
import { auth } from '../services/firebase';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const [userStats, setUserStats] = useState({ createdPins: 0, savedPins: 0 });
  const [createdPins, setCreatedPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({
    username: auth.currentUser?.email?.split('@')[0] || '',
    emoji: '🌟'
  });

  useEffect(() => {
    fetchUserData();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserData();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchUserData = async () => {
    if (!auth.currentUser) return;
    try {
      const db = getFirestore();

      // Get user profile
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }

      // Get created pins
      const createdQuery = query(collection(db, 'pins'), where('userId', '==', auth.currentUser.uid));
      const createdSnapshot = await getDocs(createdQuery);

      // Get saved pins from nested collection
      const savedPinsRef = collection(db, `users/${auth.currentUser.uid}/savedPins`);
      const savedSnapshot = await getDocs(savedPinsRef);

      // Update state
      setUserStats({
        createdPins: createdSnapshot.size,
        savedPins: savedSnapshot.size
      });

      setCreatedPins(createdSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAchievements = () => {
    const achievements = [];
    
    // Level achievements based on created pins
    if (userStats.createdPins >= 1) achievements.push('lvl 1: 🌱 Noobie Explorer');
    if (userStats.createdPins >= 3) achievements.push('lvl 2: ⭐ Pro Pinner');
    if (userStats.createdPins >= 6) achievements.push('lvl 3: 👑 Goated Creator');
    if (userStats.createdPins >= 10) achievements.push('lvl 4: 🔥 Legend');
    if (userStats.createdPins >= 15) achievements.push('lvl 5: 🌟 Memory Master');
    
    // Additional achievements
    if (userStats.savedPins >= 10) achievements.push('🔖 Collector');
    
    return achievements;
  };

  if (loading) {
    return (
      <ImageBackground source={require('../../assets/bg.png')} style={styles.container} resizeMode="cover">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#64CEB2" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../../assets/bg.png')} style={styles.container} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>{userProfile.emoji}</Text>
          </View>
          <Text style={styles.username}>{userProfile.username}</Text>
          <Text style={styles.email}>{auth.currentUser?.email}</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats.createdPins}</Text>
            <Text style={styles.statLabel}>Created Pins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats.savedPins}</Text>
            <Text style={styles.statLabel}>Saved Pins</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsContainer}>
            {renderAchievements().map((achievement, index) => (
              <View key={index} style={styles.achievementBadge}>
                <Text style={styles.achievementText}>{achievement}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>My Pins</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pinsScrollContainer}>
            {createdPins.map(pin => (
              <View key={pin.id} style={styles.pinCard}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={async () => {
                    try {
                      const db = getFirestore();
                      await deleteDoc(doc(db, 'pins', pin.id));
                      setCreatedPins(prev => prev.filter(p => p.id !== pin.id));
                      setUserStats(prev => ({
                        ...prev,
                        createdPins: prev.createdPins - 1
                      }));
                    } catch (error) {
                      console.error('Error deleting pin:', error);
                      Alert.alert('Error', 'Failed to delete pin');
                    }
                  }}
                >
                  <Ionicons name="close-circle" size={24} color="rgba(255, 255, 255, 0.8)" />
                </TouchableOpacity>
                <Text style={styles.pinEmoji}>{pin.mood?.emoji || '😊'}</Text>
                <Text style={styles.pinTitle} numberOfLines={1}>{pin.title}</Text>
                <Text style={styles.pinDescription} numberOfLines={2}>{pin.description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.creatorsNookButton} onPress={() => navigation.navigate('CreatorsNook')}>
          <Text style={styles.creatorsNookButtonText}>Creator's Nook</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 55, paddingBottom: 85 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: {
    width: 100, height: 100,
    backgroundColor: 'rgba(100, 206, 178, 0.15)',
    borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  avatarEmoji: { fontSize: 40 },
  username: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  email: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 15 },
  editButton: {
    backgroundColor: 'rgba(57, 220, 187, 0.15)',
    paddingVertical: 8, paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(57, 187, 220, 0.3)'
  },
  editButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30 },
  statCard: {
    backgroundColor: 'rgba(100, 206, 178, 0.15)',
    borderRadius: 15,
    padding: 20, alignItems: 'center', width: '45%',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  statLabel: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)' },
  sectionContainer: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  achievementsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievementBadge: {
    backgroundColor: 'rgba(100, 206, 178, 0.15)',
    borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 15,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  achievementText: { color: '#fff', fontSize: 14 },
  pinsScrollContainer: { paddingRight: 20 },
  pinCard: {
    backgroundColor: 'rgba(100, 206, 178, 0.15)',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative'
  },
  deleteButton: { position: 'absolute', top: 5, right: 5, zIndex: 1, padding: 5 },
  pinEmoji: { fontSize: 30, marginBottom: 10 },
  pinTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  pinDescription: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)' },
  creatorsNookButton: {
    backgroundColor: 'rgba(57, 220, 187, 0.15)',
    paddingVertical: 15, paddingHorizontal: 30,
    borderRadius: 25, marginTop: 20,
    borderWidth: 1, borderColor: 'rgba(57, 187, 220, 0.3)',
    width: '100%'
  },
  creatorsNookButtonText: {
    color: '#fff', fontSize: 18,
    fontWeight: 'bold', textAlign: 'center'
  }
});

export default ProfileScreen;
