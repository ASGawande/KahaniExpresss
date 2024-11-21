import React, { useState } from 'react';
import {
  Text,
  Button,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  TextStyle,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

// Helper function for fetching audio and alignment
const fetchAudioAndAlignment = async (text: string, storyId: string, page_no: number, language: string) => {
  const url = 'https://kahanijsondata.azurewebsites.net';
  const New_URL = `${url}/fetchAudioAndAlignment`;
alert(page_no);
  try {
    // Fetch audio and alignment data from the server
    const response = await fetch(New_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, storyId, page_no, language }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server Error: ${errorText}`);
    }

    const data = await response.json();

    // Validate alignment and audio data
    if (!data.alignment || !data.audioBase64) {
      throw new Error('Invalid data received from server');
    }

    // Decode Base64 audio and save to file
    const base64Audio = data.audioBase64;
    const fileUri = `${FileSystem.cacheDirectory}audio.mp3`;
    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Verify file existence
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error('Failed to save audio file');
    }

    console.log('Audio file saved at:', fileUri);

    return { alignment: data.alignment, audioUri: fileUri };
  } catch (error) {
    console.error('Error fetching audio and alignment:', error);
    throw error;
  }
};

interface NarrationTextProps {
  currentPage: number;
  totalPages: number;
  text: string;
  backgroundMusicUrl: string;
}

const NarrationText: React.FC<NarrationTextProps> = ({ text, backgroundMusicUrl }) => {
  const [audio, setAudio] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);


  
  const handlePlayAudio = async () => {
    try {
      const { audioUri } = await fetchAudioAndAlignment(text, '12345', 3, 'en'); // Replace '12345' with actual storyId

      // Load and play the audio
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: true });
      setAudio(sound);
      setIsPlaying(true);

      // Handle audio playback finish
      sound.setOnPlaybackStatusUpdate((status) => {
        if ('didJustFinish' in status && status.didJustFinish) {
          sound.unloadAsync(); // Release resources
          setAudio(null);
          setIsPlaying(false);
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to play the audio');
    }
  };

  const handlePauseAudio = async () => {
    if (audio) {
      await audio.pauseAsync();
      setIsPlaying(false);
    }
  };

  const renderText = (): JSX.Element[] =>
    text.split(' ').map((word, index) => (
      <TouchableOpacity key={index}>
        <Text style={styles.clickableWord}>{word} </Text>
      </TouchableOpacity>
    ));

  return (
    <View style={styles.narrationContainer}>
      <ScrollView>
        <View style={styles.narrationText}>{renderText()}</View>
      </ScrollView>

      <Button
        title={isPlaying ? 'Pause Audio' : 'Play Audio'}
        onPress={isPlaying ? handlePauseAudio : handlePlayAudio}
      />
    </View>
  );
};

interface Styles {
  narrationContainer: ViewStyle;
  narrationText: TextStyle;
  clickableWord: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  narrationContainer: {
    flex: 1,
    padding: 50,
    width: '100%',
    height: '100%',
  },
  narrationText: {
    fontSize: 16,
    color: '#333',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  clickableWord: {
    color: '#007AFF',
    fontSize: 19,
    fontWeight: '500',
  },
});

export default NarrationText;
