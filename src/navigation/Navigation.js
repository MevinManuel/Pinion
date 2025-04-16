// src/navigation/Navigation.js
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import CreatePinScreen from '../screens/CreatePinScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SavedPinsScreen from '../screens/SavedPinsScreen';
import StoryScreen from '../screens/StoryScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import CreatorsNookScreen from '../screens/CreatorsNookScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Create Pin') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Saved Pins') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: 'rgb(154, 236, 203)',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarStyle: {
          position: 'absolute',
          bottom: 15,
          left: '20%',
          right: '20%',
          elevation: 0,
          backgroundColor: 'rgba(30, 85, 71, 0.87)',
          borderRadius: 25,
          height: 55,
          paddingBottom: 5,
          borderWidth: 1,
          borderColor: 'rgba(147, 212, 205, 0.21)',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: 3,
        },
        tabBarBackground: () => (
          <BlurView
            tint="dark"
            intensity={0}
            style={{
              ...StyleSheet.absoluteFillObject,
              borderRadius: 25,
            }}
          />
        ),
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          headerShown: false
        }} 
      />
      <Tab.Screen 
        name="Explore" 
        component={MapScreen}
        options={{
          headerShown: false
        }} 
      />
      <Tab.Screen 
        name="Create Pin" 
        component={CreatePinScreen}
        options={{
          headerShown: false
        }} 
      />
      <Tab.Screen 
        name="Saved Pins" 
        component={SavedPinsScreen}
        options={{
          headerShown: false
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: false
        }} 
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  return (
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: 'rgba(30, 85, 71, 0.87)',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(147, 212, 205, 0.21)',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            color: '#fff',
            fontSize: 18,
            fontWeight: '600',
          },
          headerTintColor: '#fff',
          headerBackground: () => (
            <BlurView
              tint="dark"
              intensity={30}
              style={StyleSheet.absoluteFill}
            />
          ),
          cardStyle: { backgroundColor: 'transparent' }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} 
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen name="Signup" component={SignupScreen}
         options={{
          headerShown: false
        }}
      />
        <Stack.Screen 
          name="MainApp" 
          component={TabNavigator} 
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen name="Story" component={StoryScreen} 
         options={{
          headerShown: false
        }}
      />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} 
         options={{
          headerShown: false
        }}
      />
        <Stack.Screen name="CreatorsNook" component={CreatorsNookScreen} 
         options={{
          headerShown: false
        }}
      />
      </Stack.Navigator>
  );
};

export default Navigation;