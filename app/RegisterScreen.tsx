import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, firestore } from './firebaseConfig'; // Import Firebase auth and firestore
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const RegisterScreen = () => {
  const navigation = useNavigation();

  const [step, setStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isStepOneValid = firstName && lastName && age;
  const isStepTwoValid = email && password && confirmPassword && password === confirmPassword;

  const handleNext = () => {
    if (!isStepOneValid) {
      setShowErrors(true);
    } else {
      setShowErrors(false);
      setStep(step + 1);
    }
  };

  const handleRegister = async () => {
    if (!isStepOneValid || !isStepTwoValid) {
      setShowErrors(true);
      return;
    }

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user information in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        firstName,
        lastName,
        age: parseInt(age, 10),
        email,
      });

      Alert.alert('Registration Successful', 'Your account has been created successfully.');
      navigation.navigate('index'); // Navigate to login or home screen
    } catch (error) {
      Alert.alert('Registration Error', error.message);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#ccc"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            {showErrors && !firstName && <Text style={styles.errorText}>First Name is required.</Text>}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#ccc"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
            {showErrors && !lastName && <Text style={styles.errorText}>Last Name is required.</Text>}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor="#ccc"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>
            {showErrors && !age && <Text style={styles.errorText}>Age is required.</Text>}
          </>
        );
      case 2:
        return (
          <>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#ccc"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {showErrors && !email && <Text style={styles.errorText}>Email is required.</Text>}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#ccc"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
            {showErrors && !password && <Text style={styles.errorText}>Password is required.</Text>}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#ccc"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
            {showErrors && !confirmPassword && <Text style={styles.errorText}>Confirm Password is required.</Text>}
            {showErrors && password !== confirmPassword && confirmPassword && (
              <Text style={styles.errorText}>Passwords do not match.</Text>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/Kahani_Express_tran.png')} style={styles.logo} />

      {renderStep()}

      <View style={styles.buttonContainer}>
        {step > 1 && (
          <TouchableOpacity style={styles.navButton} onPress={() => setStep(step - 1)}>
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        {step < 2 && (
          <TouchableOpacity
            style={[styles.navButton, { opacity: isStepOneValid ? 1 : 0.5 }]}
            onPress={handleNext}
          >
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>

      {step === 2 && (
        <TouchableOpacity
          style={[styles.button, { opacity: isStepTwoValid ? 1 : 0.5 }]}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
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
    paddingHorizontal: 20,
  },
  logo: {
    width: 1200,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 60,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingLeft: 20,
    fontSize: 16,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'center',
  },
  navButton: {
    backgroundColor: '#00AEEF',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  navButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    width: '100%',
    backgroundColor: '#00AEEF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  linkText: {
    color: '#FFF',
    marginTop: 20,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  errorText: {
    width: '100%',
    color: 'red',
    fontSize: 14,
    marginBottom: 5,
    paddingLeft: 5,
  },
});

export default RegisterScreen;
