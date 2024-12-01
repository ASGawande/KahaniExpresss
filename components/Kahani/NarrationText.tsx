import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  UIManager,
  findNodeHandle,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons'; // Importing icons

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

const MIN_PLAYBACK_RATE = 0.5;
const MAX_PLAYBACK_RATE = 2.0;
const PLAYBACK_RATE_STEP = 0.25;

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
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const audioRef = useRef<Audio.Sound | null>(null);

  // Refs for scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  const wordRefs = useRef<{ [key: number]: Text | null }>({});

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
          wordRefs.current = {}; // Reset word refs
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
          { shouldPlay: true, rate: playbackRate, shouldCorrectPitch: true }
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

  const handleSetPlaybackRate = async (rateType: 'slow' | 'fast') => {
    let newRate = playbackRate;
    if (rateType === 'slow') {
      newRate = Math.max(playbackRate - PLAYBACK_RATE_STEP, MIN_PLAYBACK_RATE);
    } else if (rateType === 'fast') {
      newRate = Math.min(playbackRate + PLAYBACK_RATE_STEP, MAX_PLAYBACK_RATE);
    }
    setPlaybackRate(newRate);
    if (audio) {
      try {
        await audio.setRateAsync(newRate, true);
      } catch (error) {
        console.error('Error setting playback rate:', error);
      }
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
      scrollToWord(highlightedWord.tokenIndex);
    } else {
      setHighlightedWordIndex(null);
    }
  };

  const scrollToWord = (index: number) => {
    const wordRef = wordRefs.current[index];
    if (wordRef && scrollViewRef.current) {
      const scrollViewNodeHandle = findNodeHandle(scrollViewRef.current);
      const wordNodeHandle = findNodeHandle(wordRef);

      if (scrollViewNodeHandle && wordNodeHandle) {
        UIManager.measureLayout(
          wordNodeHandle,
          scrollViewNodeHandle,
          (error) => {
            console.error('Error measuring word layout:', error);
          },
          (x, y, width, height) => {
            scrollViewRef.current?.scrollTo({
              x: 0,
              y: y - 50, // Adjust 50 to control vertical offset
              animated: true,
            });
          }
        );
      }
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
          ref={(el) => {
            wordRefs.current[index] = el;
          }}
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
      <ScrollView ref={scrollViewRef} style={{ flex: 1 }}>
        <View style={styles.narrationText}>{renderText()}</View>
      </ScrollView>

      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.playbackButton}
            onPress={isPlaying ? handlePauseAudio : handlePlayAudio}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.playbackButtonText}>
              {isPlaying ? 'Pause Audio' : 'Start Reading'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => handleSetPlaybackRate('slow')}
          >
            <Ionicons name="remove" size={20} color="#fff" />
            <Text style={styles.rateButtonText}>Slow</Text>
          </TouchableOpacity>

          <Text style={styles.playbackRateValue}>
            {playbackRate.toFixed(2)}x
          </Text>

          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => handleSetPlaybackRate('fast')}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.rateButtonText}>Fast</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  narrationContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5', // Light background color
  },
  narrationText: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  word: {
    color: '#333',
    fontSize: 20,
    fontWeight: '400',
    lineHeight: 30,
  },
  highlightedWord: {
    backgroundColor: '#ffeb3b', // Yellow highlight
    borderRadius: 5,
    overflow: 'hidden',
  },
  controls: {
    marginTop: 10,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  playbackButton: {
    flexDirection: 'row',
    backgroundColor: '#6200ee', // Primary color
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 10,
    elevation: 3, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 }, // For iOS shadow
    shadowOpacity: 0.3, // For iOS shadow
    shadowRadius: 3, // For iOS shadow
  },
  playbackButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 5,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#03a9f4', // Secondary color
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginHorizontal: 5,
    marginBottom: 10,
    elevation: 2, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 1 }, // For iOS shadow
    shadowOpacity: 0.25, // For iOS shadow
    shadowRadius: 2, // For iOS shadow
  },
  rateButtonText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 5,
    fontWeight: '500',
  },
  playbackRateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 5,
  },
});

export default NarrationText;
