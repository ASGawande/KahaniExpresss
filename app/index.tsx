import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const WelcomePage = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageBackground
          source={require('../assets/images/Kahani_Express_tran.png')}
          style={styles.background}
          resizeMode="contain"
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.logo}>Kahani Express</Text>

        <Text style={styles.title}>Hello!</Text>
        <Text style={styles.description}>
          Tap continue to access Kahani Express illustrated and read aloud library for kids
        </Text>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('RegisterScreen')}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.or}>—————— OR ——————</Text>

        <Text style={styles.loginPrompt}>Already have an account?</Text>

        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.loginText}>Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A2E83',
  },
  imageContainer: {
    marginTop: -20, // Move the image up
    width: '90%',
    height: '30%', // Adjust height based on the image size
  },
  background: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: '#00aaff',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  or: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
  },
  loginPrompt: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
  },
  loginText: {
    fontSize: 16,
    color: '#00aaff',
    fontWeight: 'bold',
  },
});

export default WelcomePage;
