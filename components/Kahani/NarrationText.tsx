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

    // Parse and transform alignment data to word-level timing
    let parsedAlignment =
      typeof data.alignment === 'string'
        ? JSON.parse(data.alignment)
        : data.alignment;

    // Clean up the text by replacing non-breaking spaces and trimming whitespace
    const cleanedText = text.replace(/\u00A0/g, ' ').trim();

    // Split the text into tokens (words and spaces)
    const tokens = cleanedText.match(/(\S+|\s+)/g) || [];

    // Extract alignment character data
    const {
      character_start_times_seconds,
      character_end_times_seconds,
      characters,
    } = parsedAlignment;

    const wordTimings = [];
    let characterIndex = 0;

    tokens.forEach((token, index) => {
      const isWord = /\S+/.test(token);
      if (isWord) {
        const wordLength = token.length;
        const startIndex = characterIndex;
        const endIndex = characterIndex + wordLength - 1;

        // Ensure indices are within bounds
        if (
          startIndex < character_start_times_seconds.length &&
          endIndex < character_end_times_seconds.length
        ) {
          const startTime =
            character_start_times_seconds[startIndex] * 1000; // Convert to milliseconds
          const endTime =
            character_end_times_seconds[endIndex] * 1000; // Convert to milliseconds

          wordTimings.push({
            word: token,
            startTime,
            endTime,
            tokenIndex: index, // Use index from tokens array
          });
        } else {
          console.warn(`Indices out of bounds for word "${token}"`);
        }

        characterIndex += wordLength;
      } else {
        // For non-word tokens (spaces, punctuation), increment characterIndex
        characterIndex += token.length;
      }
    });

    parsedAlignment = wordTimings;

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
  tokenIndex: number;
}

interface NarrationTextProps {
  currentPage: number;
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
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const audioRef = useRef<Audio.Sound | null>(null);

  // Fetch alignment and audio when text changes
  useEffect(() => {
    let isMounted = true;

    // Unload any existing audio
    if (audioRef.current) {
      audioRef.current
        .unloadAsync()
        .catch((error) => console.error('Error unloading audio:', error));
      audioRef.current = null;
    }
    setAudio(null);
    setIsPlaying(false);
    setHighlightedWordIndex(null);

    const updateAlignmentAndAudio = async () => {
      try {
        // Fetch alignment data and audio URI
        const { alignment, audioUri } = await fetchAudioAndAlignment(
          text,
          storyId,
          currentPage,
          'en'
        );

        if (isMounted) {
          setAlignment(alignment);
          setAudioUri(audioUri);
          setHighlightedWordIndex(null);
        }
      } catch (error) {
        Alert.alert('Error', `Failed to fetch alignment data: ${error.message}`);
      }
    };

    updateAlignmentAndAudio();

    return () => {
      isMounted = false;
    };
  }, [text]);

  const handlePlayAudio = async () => {
    try {
      if (audio) {
        // Audio is already loaded, resume playback
        await audio.playAsync();
      } else {
        // Load the audio
        if (!audioUri) {
          Alert.alert('Error', 'Audio file is not available');
          return;
        }

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
            sound.unloadAsync();
            audioRef.current = null;
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
    let highlightedWord = null;

    // Adjusted time comparisons for minor discrepancies
    const tolerance = 50; // milliseconds

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const { startTime, endTime } = alignment[mid];

      if (
        positionMillis + tolerance >= startTime &&
        positionMillis - tolerance <= endTime
      ) {
        highlightedWord = alignment[mid];
        break;
      } else if (positionMillis < startTime) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    if (highlightedWord !== null) {
      setHighlightedWordIndex(highlightedWord.tokenIndex);
    } else {
      setHighlightedWordIndex(null);
    }
  };

  const renderText = (): JSX.Element[] => {
    const tokens = text.match(/(\S+|\s+)/g) || [];

    return tokens.map((token, index) => {
      const isWord = /\S+/.test(token);
      const isHighlighted = isWord && index === highlightedWordIndex;

      return (
        <Text
          key={index}
          style={
            isHighlighted
              ? [styles.word, styles.highlightedWord]
              : styles.word
          }
        >
          {token}
        </Text>
      );
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current
          .unloadAsync()
          .catch((error) => console.error('Error unloading audio:', error));
        audioRef.current = null;
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
    padding: 20,
    width: '100%',
    height: '100%',
  },
  narrationText: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  word: {
    color: '#000',
    fontSize: 19,
    fontWeight: '500',
  },
  highlightedWord: {
    backgroundColor: 'yellow',
  },
});

export default NarrationText;
