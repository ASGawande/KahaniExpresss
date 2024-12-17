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
import Icon from 'react-native-vector-icons/MaterialIcons';

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
  const [autoplay, setAutoplay] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('english');

  const handleMusicToggle = () => {
    setMusicOn((prev) => !prev);
  };

  const handleAutoplayToggle = () => {
    setAutoplay((prev) => !prev);
  };

  const handleContinue = () => {
    onContinue();
  };

  const storyteller = story.author || 'Kahani Express';

  // Prepare the dropdown options
  const languageOptions = Object.entries({
    english: 'English',
    hindi: 'Hindi',
    spanish: 'Spanish',
    tamil: 'Tamil',
  }).map(([key, value]) => ({
    label: value,
    value: key,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Image source={{ uri: image }} style={styles.image} />

        <View style={styles.content}>
          {/* Controls Row */}
          <View style={styles.controlsRow}>
            <View style={styles.controlItem}>
              <View style={styles.iconLabel}>
                <Icon name="language" size={20} color="#333" style={styles.icon} />
                <Text style={styles.label}>Language</Text>
              </View>
              <RNPickerSelect
                onValueChange={(value) => setLanguage(value)}
                items={languageOptions}
                value={language}
                placeholder={{}}
                style={pickerSelectStyles}
                useNativeAndroidPickerStyle={false}
              />
            </View>

            <View style={styles.controlItem}>
              <View style={styles.iconLabel}>
                <Icon name="music-note" size={20} color="#333" style={styles.icon} />
                <Text style={styles.label}>Music</Text>
              </View>
              <Switch value={musicOn} onValueChange={handleMusicToggle} />
            </View>

            <View style={styles.controlItem}>
              <View style={styles.iconLabel}>
                <Icon name="play-arrow" size={20} color="#333" style={styles.icon} />
                <Text style={styles.label}>Autoplay</Text>
              </View>
              <Switch value={autoplay} onValueChange={handleAutoplayToggle} />
            </View>
          </View>

          {/* Start Reading Button before Title */}
          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>START READING</Text>
          </TouchableOpacity>

          {/* Heading after Start Reading button */}
          <Text style={styles.title}>{story.title}</Text>

          <Text style={styles.description}>
            <Text style={styles.boldText}>Description: </Text>
            {story.description}
          </Text>

          <Text style={styles.description}>
            <Text style={styles.boldText}>Storyteller: </Text>
            {storyteller}
          </Text>
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
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  controlItem: {
    alignItems: 'center',
    width: '30%',
    minWidth: 100,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    justifyContent: 'center',
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    marginBottom: 24,
    backgroundColor: '#7B61FF',
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'justify',
    color: '#444',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#333',
    backgroundColor: '#fff',
    width: '100%',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#333',
    backgroundColor: '#fff',
    width: '100%',
  },
  placeholder: {
    color: '#999',
    fontSize: 16,
  },
});
