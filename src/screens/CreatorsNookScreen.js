import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, TouchableOpacity, Linking } from 'react-native';

const CreatorsNookScreen = () => {
  return (
    <ImageBackground 
      source={require('../../assets/bg.png')} 
      style={styles.container} 
      resizeMode="cover"
    >
      <View style={styles.headingContainer}>
        <Text style={styles.heading}>Heloo Gois!!</Text>
      </View>
      <ScrollView 
        style={styles.descriptionContainer} 
        contentContainerStyle={{ padding: 20 }}
      >
        <Text style={[styles.description, { marginBottom: 12 }]}>
          Hey! I'm so glad you're here 💫
        </Text>
        <Text style={[styles.description, { marginBottom: 12 }]}>
        This little app was built by just one very curious (and slightly sleep-deprived) human — me 👋
        Fueled by late-night inspiration, too much coffee ☕, and the dream of blending stories with locations 🌍
        </Text>
        <Text style={[styles.description, { marginBottom: 12 }]}>
          It's a love letter to memories, moments, and all the random thoughts that deserve a place on the map 🗺️
        </Text>
        <Text style={[styles.description, { marginBottom: 12 }]}>
          The idea? Pin your stories to real locations, and revisit not just where you were, but how you felt. Kinda like a digital time capsule with ✨vibes✨.
        </Text>
        <Text style={[styles.description, { marginBottom: 12 }]}>
          Now, quick honesty break — I really wanted to let you upload photos too 📸 but Firebase wanted me to upgrade to a paid plan for storage... and well, let's just say my wallet disagreed 💸😂 So for now, we're keeping it beautifully simple with emojis and text. But hey, maybe someday!
        </Text>
        <Text style={[styles.description, { marginBottom: 12 }]}>
          Anyway — thanks for exploring this little passion project. It means the world 🌍
        </Text>
        <Text style={styles.description}>
        — Me and my AI buddies (plus a ton of code!)
        </Text>

        <View style={styles.socialLinksContainer}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => Linking.openURL('https://www.instagram.com/mevin_manuel/')}
          >
            <Text style={styles.socialButtonText}>📸 Instagram</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => Linking.openURL('https://github.com/MevinManuel')}
          >
            <Text style={styles.socialButtonText}>💻 GitHub</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  socialLinksContainer: {
    marginTop: 20,
    gap: 10,
  },
  socialButton: {
    backgroundColor: 'rgba(57, 220, 187, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(57, 187, 220, 0.3)',
    alignItems: 'center',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headingContainer: {
    backgroundColor: 'rgba(100, 206, 178, 0.15)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  descriptionContainer: {
    backgroundColor: 'rgba(100, 206, 178, 0.15)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flexGrow: 1, // Ensure ScrollView takes available space
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default CreatorsNookScreen;