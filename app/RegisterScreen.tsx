import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
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

      console.log('User registered successfully!');
      // Navigate to another screen after successful registration
      navigation.navigate('index');
    } catch (error) {
      console.error('Registration error:', error.message);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#999"
              value={firstName}
              onChangeText={setFirstName}
            />
            {showErrors && !firstName && <Text style={styles.errorText}>First Name is required.</Text>}

            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#999"
              value={lastName}
              onChangeText={setLastName}
            />
            {showErrors && !lastName && <Text style={styles.errorText}>Last Name is required.</Text>}

            <TextInput
              style={styles.input}
              placeholder="Age"
              placeholderTextColor="#999"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
            {showErrors && !age && <Text style={styles.errorText}>Age is required.</Text>}
          </>
        );
      case 2:
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            {showErrors && !email && <Text style={styles.errorText}>Email is required.</Text>}

            <TextInput
              style={styles.input}
              placeholder="Enter Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {showErrors && !password && <Text style={styles.errorText}>Password is required.</Text>}

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
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
      <Image source={require('../assets/images/icon.png')} style={styles.logo} />
      <Text style={styles.title}>Create an Account</Text>

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

      <TouchableOpacity onPress={() => navigation.navigate('index')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFECB3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6F00',
    marginBottom: 30,
  },
  input: {
    width: '80%',
    height: 50,
    backgroundColor: '#FFF8E1',
    borderRadius: 25,
    paddingLeft: 20,
    marginVertical: 10,
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  navButton: {
    width: 100,
    padding: 10,
    marginHorizontal: 10,
    backgroundColor: '#FF6F00',
    borderRadius: 25,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    width: '80%',
    backgroundColor: '#FF6F00',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#FF6F00',
    marginTop: 20,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 5,
  },
});

export default RegisterScreen;
