import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';

// Define the type for navigation route parameters
type ProfilePageRouteProp = RouteProp<
  { ProfilePage: { user: User } },
  'ProfilePage'
>;

interface ProfilePageProps {
  route: ProfilePageRouteProp;
}

// Define the User interface
interface User {
  username: string;
  avatar: any;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ route }) => {
  // Safely access route parameters
  const user = route?.params?.user || { username: 'Guest', avatar: null };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user.username}!</Text>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        {user.avatar ? (
          <Image source={user.avatar} style={styles.avatar} resizeMode="contain" />
        ) : (
          <Text style={styles.noAvatarText}>No Avatar Selected</Text>
        )}
        <Text style={styles.username}>{user.username}</Text>
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A2E83',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  noAvatarText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#4A2E83',
    padding: 12,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfilePage;
