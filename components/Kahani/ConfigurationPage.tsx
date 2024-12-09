import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

interface Story {
  title: string;
  description: string;
  author?: string;
  languages?: { [key: string]: string };
}

interface ConfigurationPageProps {
  image: string;
  onContinue: () => void;
  story: Story;
}

const ConfigurationPage: React.FC<ConfigurationPageProps> = ({
  image,
  onContinue,
  story,
}) => {
  const [musicOn, setMusicOn] = useState<boolean>(true);
  const [selfReading, setSelfReading] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('English');

  const handleMusicToggle = () => {
    setMusicOn((prev) => !prev);
  };

  const handleSelfReadingToggle = () => {
    setSelfReading((prev) => !prev);
  };

  const handleContinue = () => {
    onContinue();
  };

  const storyteller = story.author || 'Kahani Express';

  // Prepare the dropdown options
  const languageOptions = Object.entries(
     {
      english: 'English',
      hindi: 'Hindi',
      spanish: 'Spanish',
      tamil: 'Tamil',
    }
  ).map(([key, value]) => ({ 
    label: value, // Full name of the language (e.g., "English")
    value: key, // Language key (e.g., "english")
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title}>{story.title}</Text>

          {/* Language Dropdown */}
          <View style={styles.languageContainer}>
            <Text style={styles.label}>Language</Text>
            <RNPickerSelect
              onValueChange={(value) => setLanguage(value)}
              items={languageOptions}
              value={language}
              placeholder={{ label: 'Select a language', value: null }}
              style={pickerSelectStyles}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>{musicOn ? 'Music On' : 'Music Off'}</Text>
            <Switch value={musicOn} onValueChange={handleMusicToggle} />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>
              {selfReading ? 'Self-Reading On' : 'Self-Reading Off'}
            </Text>
            <Switch value={selfReading} onValueChange={handleSelfReadingToggle} />
          </View>

          <Text style={styles.description}>
            <Text style={styles.boldText}>Description: </Text>
            {story.description}
          </Text>

          <Text style={styles.description}>
            <Text style={styles.boldText}>Storyteller: </Text>
            {storyteller}
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Start Reading</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ConfigurationPage;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 250, // Adjusted height for better fit on mobile
    resizeMode: 'cover',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 22, // Reduced font size for better fit
  
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  label: {
    fontSize: 14, // Reduced font size
    marginBottom: 4,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14, // Reduced font size for better readability
    marginBottom: 8,
    textAlign: 'justify',
  },
  boldText: {
    fontWeight: 'bold',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#1976D2',
    paddingVertical: 12, // Reduced padding for compact fit
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16, // Reduced font size
    fontWeight: '600',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    color: 'black',
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    width: '100%', // Full width for mobile responsiveness
    marginBottom: 8, // Add spacing between elements
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    color: 'black',
    backgroundColor: '#f9f9f9',
    elevation: 3, // Adds shadow for Android
    width: '100%',
    marginBottom: 8,
  },
  placeholder: {
    color: '#999', // Placeholder text color
    fontSize: 16,
  },
});

