import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  Button,
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

// Helper function for fetching audio and alignment
const fetchAudioAndAlignment = async (
  text: string,
  storyId: string,
  page_no: number,
  language: string
) => {
  const url = 'https://kahanijsondata.azurewebsites.net';
  const New_URL = `${url}/fetchAudioAndAlignment`;

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

    // Parse and transform alignment data to word-level timing
    let parsedAlignment = typeof data.alignment === 'string' ? JSON.parse(data.alignment) : data.alignment;

    const words = text.split(/\s+/);
const { character_start_times_seconds, character_end_times_seconds, characters } = parsedAlignment;
const wordTimings = [];
let characterIndex = 0;

words.forEach((word) => {
  const wordLength = word.length;
  if (characterIndex + wordLength - 1 < character_start_times_seconds.length) {
    const startTime = character_start_times_seconds[characterIndex] * 1000; // Convert to milliseconds
    const endTime = character_end_times_seconds[characterIndex + wordLength - 1] * 1000; // Convert to milliseconds


    wordTimings.push({
      word,
      startTime,
      endTime,
    });
  }
  characterIndex += wordLength;

  // Skip spaces in the character alignment
  while (characters[characterIndex] === ' ') {
    characterIndex += 1;
  }
});

parsedAlignment = wordTimings;
console.log('Parsed Alignment', JSON.stringify(parsedAlignment));

    return { alignment: parsedAlignment, audioUri: fileUri };
  } catch (error) {
    console.error('Error fetching audio and alignment:', error);
    throw error;
  }
};

interface AlignmentData {
  word: string;
  startTime: number;
  endTime: number;
}

interface NarrationTextProps {
  currentPage: number;
  totalPages: number;
  text: string;
  backgroundMusicUrl: string;
  storyId: string;
}

const NarrationText: React.FC<NarrationTextProps> = ({
  text,
  backgroundMusicUrl,
  storyId,
  currentPage,
}) => {
  const [audio, setAudio] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [alignment, setAlignment] = useState<AlignmentData[]>([]);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number | null>(null);
  const audioRef = useRef<Audio.Sound | null>(null);

  const handlePlayAudio = async () => {
    try {
      if (audio) {
        // Audio is already loaded, resume playback
        await audio.playAsync();
      } else {
        // Load the audio for the first time
        const { audioUri, alignment } = await fetchAudioAndAlignment(text, storyId, currentPage, 'en');
        
        setAlignment(alignment);

        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        setAudio(sound);
        audioRef.current = sound;

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isPlaying && status.positionMillis !== undefined) {
            updateHighlightedWord(status.positionMillis);
          }
          if (status.didJustFinish) {
            sound.unloadAsync(); // Release resources
            setAudio(null);
            setIsPlaying(false);
            setHighlightedWordIndex(null);
          }
        });
      }
      setIsPlaying(true);
    } catch (error) {
      Alert.alert('Error', `Failed to play the audio: ${error.message}`);
    }
  };

  const handlePauseAudio = async () => {
    if (audio) {
      await audio.pauseAsync();
      setIsPlaying(false);
    }
  };

  const updateHighlightedWord = (positionMillis: number) => {
    if (!alignment.length) return;

  let left = 0;
  let right = alignment.length - 1;
  let found = false;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const { startTime, endTime } = alignment[mid];

    if (positionMillis >= startTime && positionMillis < endTime) {
      setHighlightedWordIndex(mid);
      found = true;
      break;
    } else if (positionMillis < startTime) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  if (!found) {
    setHighlightedWordIndex(null);
  }
  };

  const renderText = (): JSX.Element[] =>
    text.split(' ').map((word, index) => (
      <Text
        key={index}
        style={
          index === highlightedWordIndex
            ? [styles.clickableWord, styles.highlightedWord]
            : styles.clickableWord
        }
      >
        {word}{' '}
      </Text>
    ));

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.unloadAsync().catch((error) => console.error('Error unloading audio:', error));
      }
    };
  }, []);

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

const styles = StyleSheet.create({
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
  highlightedWord: {
    backgroundColor: 'yellow',
  },
});

export default NarrationText;
