import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';

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
  const navigation = useNavigation(); // Access navigation object

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
          <Image source={user.avatar} style={styles.avatar} resizeMode="cover" />
        ) : (
          <Text style={styles.noAvatarText}>No Avatar Selected</Text>
        )}
      </View>

      {/* Profile Details Section */}
      <View style={styles.detailsSection}>
        <Text style={styles.detailLabel}>Username:</Text>
        <Text style={styles.detailValue}>{user.username}</Text>
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.navigate('LoginScreen')} // Navigate to LoginScreen
      >
        <Text style={styles.logoutButtonText}>🚪 Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A2E83',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 10,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    backgroundColor: '#5C3EBE',
    padding: 15,
    borderRadius: 12,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#FFD700',
    marginBottom: 10,
  },
  noAvatarText: {
    fontSize: 18,
    color: '#FFD700',
    marginTop: 20,
  },
  detailsSection: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A2E83',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  editButtonText: {
    color: '#4A2E83',
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProfilePage;
