import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { BlurView } from 'expo-blur';
import { auth } from '../services/firebase';
import { getUserXP } from '../services/userService';
import { useIsFocused } from '@react-navigation/native';

// Utility function to format timestamps
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'unknown time';
  const now = new Date();
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const HomeScreen = ({ navigation }) => {
  // User data and state
  const [userStats, setUserStats] = useState({ createdPins: 0 });
  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState('Newbie');
  const [nextLevelXP, setNextLevelXP] = useState(50);
  const [latestPins, setLatestPins] = useState([]);
  const isFocused = useIsFocused(); // Detect screen focus

  // XP thresholds (consistent with userService.js)
  const LEVEL_THRESHOLDS = [
    { xp: 0, title: 'Newbie' },
    { xp: 50, title: 'Story Seeker' },
    { xp: 150, title: 'Map Scribe' },
    { xp: 300, title: 'Vibe Curator' },
  ];

  // Fetch user XP and level
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userData = await getUserXP(auth.currentUser.uid);
          setUserXP(userData.xp || 0);
          setUserLevel(userData.title || 'Newbie');
          // Find next level threshold
          const currentLevelIndex = LEVEL_THRESHOLDS.findIndex(level => level.title === userData.title);
          const nextLevel = LEVEL_THRESHOLDS[currentLevelIndex + 1];
          setNextLevelXP(nextLevel ? nextLevel.xp : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].xp);
        } catch (error) {
          console.error('Error fetching user XP:', error);
        }
      }
    };

    fetchUserData();
  }, [isFocused]); // Re-run when screen is focused

  // Fetch latest pins from Firebase
  useEffect(() => {
    const fetchLatestPins = async () => {
      try {
        const db = getFirestore();
        const pinsRef = collection(db, 'pins');
        const q = query(pinsRef, orderBy('createdAt', 'desc'), limit(5));
        
        const querySnapshot = await getDocs(q);
        const pins = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          time: formatTimeAgo(doc.data().createdAt)
        }));
        
        setLatestPins(pins);
      } catch (error) {
        console.error('Error fetching latest pins:', error);
      }
    };

    fetchLatestPins();
  }, []);

  // Animation setup
  const [glowingBorder] = useState(new Animated.Value(0));
  const [cardRotate] = useState(new Animated.Value(0));

  useEffect(() => {
    // Start both animations
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(cardRotate, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(cardRotate, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glowingBorder, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowingBorder, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ]),
      ])
    ).start();
  }, []);

  const getLevelInfo = (pinCount) => {
    if (pinCount >= 15) return { level: 5, title: '🌟 Memory Master', progress: 5 };
    if (pinCount >= 10) return { level: 4, title: '🔥 Legend', progress: 4 };
    if (pinCount >= 6) return { level: 3, title: '👑 Goated Creator', progress: 3 };
    if (pinCount >= 3) return { level: 2, title: '⭐ Pro Pinner', progress: 2 };
    if (pinCount >= 1) return { level: 1, title: '🌱 Noobie Explorer', progress: 1 };
    return { level: 0, title: '🆕 New User', progress: 0 };
  };

  // Modify the existing fetchUserData or similar function to include pin count
  const fetchUserData = async () => {
    if (!auth.currentUser) return;
    try {
      const db = getFirestore();
      const pinsQuery = query(
        collection(db, 'pins'),
        where('userId', '==', auth.currentUser.uid)
      );
      const pinsSnapshot = await getDocs(pinsQuery);
      const pinCount = pinsSnapshot.size;
      setUserStats({ createdPins: pinCount });
      
      // Update level based on pin count
      const levelInfo = getLevelInfo(pinCount);
      setUserLevel(levelInfo.title);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Add fetchUserData to the useEffect that runs on focus
  useEffect(() => {
    fetchUserData();
  }, [isFocused]);

  return (
    <ImageBackground source={require('../../assets/bg.png')} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {/* XP Card */}
          <Animated.View 
            style={[styles.xpCard, {
              borderColor: glowingBorder.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(34, 137, 103, 0.6)', 'rgba(171, 255, 219, 0.7)']
              }),
              shadowOpacity: glowingBorder.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8]
              })
            }]}
          >
            <Text style={styles.cardLevel}>{getLevelInfo(userStats?.createdPins || 0).title}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progress, { width: `${(getLevelInfo(userStats?.createdPins || 0).progress / 5) * 100}%` }]} />
            </View>
            <Text style={styles.xpText}>Level {getLevelInfo(userStats?.createdPins || 0).level} / 5</Text>
            <View style={styles.cardDecoration}>
              <View style={[styles.cardCircle, styles.cardCircleOverlap]} />
            </View>
          </Animated.View>
      
          {/* Rest of the navigation cards and latest pins sections */}
          {/* Navigation Cards */}
          <View style={styles.navCardsContainer}>
            <TouchableOpacity 
              style={styles.navCard}
              onPress={() => navigation.navigate('Create Pin')}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.navCardText}>Create a New Pin</Text>
            </TouchableOpacity>
      
            <TouchableOpacity 
              style={styles.navCard}
              onPress={() => navigation.navigate('Explore')}
            >
              <Ionicons name="map" size={24} color="#fff" />
              <Text style={styles.navCardText}>Explore Map Stories</Text>
            </TouchableOpacity>
      
            <TouchableOpacity 
              style={styles.navCard}
              onPress={() => navigation.navigate('Saved Pins')}
            >
              <Ionicons name="bookmark" size={24} color="#fff" />
              <Text style={styles.navCardText}>View Saved Pins</Text>
            </TouchableOpacity>
      
            <TouchableOpacity 
              style={styles.navCard}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person" size={24} color="#fff" />
              <Text style={styles.navCardText}>Profile</Text>
            </TouchableOpacity>
          </View>
      
          {/* Latest Pins List */}
          <Text style={styles.trendingTitle}>🕒 Latest Pins</Text>
          <View style={styles.trendingContainer}>
            {latestPins.map((pin) => (
              <TouchableOpacity key={pin.id} style={styles.trendingItem}>
                <View style={styles.trendingContent}>
                  <View style={styles.trendingHeader}>
                    <Text style={styles.trendingTitle}>{pin.title}</Text>
                    <Text style={styles.trendingTime}>{pin.time}</Text>
                  </View>
                  <View style={styles.trendingFooter}>
                    <Text style={styles.trendingLocation}>
                      <Ionicons name="location" size={14} color="#fff" /> 
                      {`${pin.location.latitude.toFixed(2)}, ${pin.location.longitude.toFixed(2)}`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
);
};

// Update or add these styles
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
  xpCard: {
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: 'rgba(57, 220, 187, 0.15)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    height: 150,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    backgroundImage: require('../../assets/bg.png'),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  cardLevel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'left',
    width: '100%',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressBar: {
    height: 8,
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progress: {
    height: '100%',
    backgroundColor: 'rgba(58, 163, 133, 0.79)',
  },
  xpText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'left',
    width: '100%',
  },
  xpCard: {
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: 'rgba(57, 220, 187, 0.15)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    height: 150,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    backgroundImage: require('../../assets/bg.png'),
  },
  cardLevel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'left',
    width: '100%',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressBar: {
    height: 8,
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progress: {
    height: '100%',
    backgroundColor: 'rgba(58, 163, 133, 0.79)',
  },
  xpText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'left',
    width: '100%',
  },
  cardDecoration: {
    position: 'absolute',
    right: -50,
    bottom: -50,
  },
  cardCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardCircleOverlap: {
    position: 'absolute',
    top: -30,
    left: -30,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  navCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  navCard: {
    width: '48%',
    backgroundColor: 'rgba(57, 220, 187, 0.15)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    height: 100,
  },
  navCardText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  trendingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  trendingContainer: {
    marginBottom: 20,
  },
  trendingItem: {
    backgroundColor: 'rgba(57, 220, 196, 0.15)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  trendingContent: {
    flex: 1,
  },
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendingTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  trendingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  trendingLikes: {
    fontSize: 14,
    color: '#fff',
  },
});

export default HomeScreen;