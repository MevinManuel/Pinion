// src/services/userService.js
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

// XP thresholds for each level
const LEVEL_THRESHOLDS = [
  { xp: 0, title: 'Newbie' },
  { xp: 50, title: 'Story Seeker' },
  { xp: 150, title: 'Map Scribe' },
  { xp: 300, title: 'Vibe Curator' }
];

// XP rewards for different actions
const XP_REWARDS = {
  CREATE_PIN: 1,
  SAVE_PIN: 5
};

// Calculate level and title based on XP
const calculateLevel = (xp) => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      return LEVEL_THRESHOLDS[i];
    }
  }
  return LEVEL_THRESHOLDS[0];
};

// Get user's XP and level info
export const getUserXP = async (userId) => {
  try {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Initialize new user with 0 XP
      const initialData = { xp: 0 };
      await setDoc(userRef, initialData);
      return { ...initialData, ...calculateLevel(0) };
    }

    const userData = userDoc.data();
    return { ...userData, ...calculateLevel(userData.xp || 0) };
  } catch (error) {
    console.error('Error getting user XP:', error);
    return { xp: 0, ...LEVEL_THRESHOLDS[0] };
  }
};

// Add XP for user actions
export const addXP = async (userId, action) => {
  try {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    const currentXP = userDoc.exists() ? (userDoc.data().xp || 0) : 0;
    const xpToAdd = XP_REWARDS[action] || 0;
    const newXP = currentXP + xpToAdd;

    await updateDoc(userRef, { xp: newXP });
    return { ...calculateLevel(newXP), xp: newXP };
  } catch (error) {
    console.error('Error adding XP:', error);
    return null;
  }
};