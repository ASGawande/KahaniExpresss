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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import PlayButton from './PlayButton';


const fetchAudioAndAlignment = async (
  text: string,
  storyId: string,
  page_no: number,
  language: string
) => {
  const url = 'https://kahanijsondata.azurewebsites.net';
  const New_URL = `${url}/fetchAudioAndAlignment`;
  
  try {
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

    if (!data.alignment || !data.audioBase64) {
      throw new Error('Invalid data received from server');
    }

    const base64Audio = data.audioBase64;
    const fileUri = `${FileSystem.cacheDirectory}audio.mp3`;
    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error('Failed to save audio file');
    }

    let parsedAlignment =
      typeof data.alignment === 'string'
        ? JSON.parse(data.alignment)
        : data.alignment;

    const cleanedText = text.replace(/\u00A0/g, ' ').trim();
    const tokens = cleanedText.match(/(\S+|\s+)/g) || [];

    const {
      character_start_times_seconds,
      character_end_times_seconds,
    } = parsedAlignment;

    const wordTimings = [];
    let characterIndex = 0;

    tokens.forEach((token, index) => {
      const isWord = /\S+/.test(token);
      if (isWord) {
        const wordLength = token.length;
        const startIndex = characterIndex;
        const endIndex = characterIndex + wordLength - 1;

        if (
          startIndex < character_start_times_seconds.length &&
          endIndex < character_end_times_seconds.length
        ) {
          const startTime =
            character_start_times_seconds[startIndex] * 1000;
          const endTime =
            character_end_times_seconds[endIndex] * 1000;

          wordTimings.push({
            word: token,
            startTime,
            endTime,
            tokenIndex: index,
          });
        } else {
          console.warn(`Indices out of bounds for word "${token}"`);
        }

        characterIndex += wordLength;
      } else {
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

  const scrollViewRef = useRef<ScrollView>(null);
  const wordRefs = useRef<{ [key: number]: Text | null }>({});

  useEffect(() => {
    let isMounted = true;

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
          wordRefs.current = {};
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
        await audio.playAsync();
      } else {
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

    const tolerance = 50;

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
              y: y - 50,
              animated: true,
            });
          }
        );
      }
    }
  };
  

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
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
    
      <View  style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <PlayButton  isPlaying={isPlaying} onTogglePlay={isPlaying ? handlePauseAudio : handlePlayAudio} />
    </View>
    
    {/* Slow Button with Tortoise Emoji */}
    <TouchableOpacity
      style={styles.speedButton}
      onPress={() => handleSetPlaybackRate('slow')}
    >
      <Text style={styles.emojiIcon}>🐢</Text>
    </TouchableOpacity>

    <Text style={styles.playbackRateValue}>
      {playbackRate.toFixed(2)}x
    </Text>

    {/* Fast Button with Rabbit Emoji */}
    <TouchableOpacity
      style={styles.speedButton}
      onPress={() => handleSetPlaybackRate('fast')}
    >
      <Text style={styles.emojiIcon}>🐇</Text>
    </TouchableOpacity>
  </View>
</View>


    </View>
  );
};

const styles = StyleSheet.create({
  narrationContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  narrationText: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  word: {
    color: '#1e1e1e',
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
  },
  highlightedWord: {
    borderBottomWidth: 1,          // Adds an underline
  borderStyle: 'dotted',         // Makes the underline dotted
  borderBottomColor: 'black',  // Sets the underline color (yellow)
  },
  controls: {
    marginTop: 15,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
  },
 
  playbackButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '600',
  },
  speedButton: {
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  playbackRateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e1e1e',
    marginHorizontal: 8,
  },
  speedButton: {
    backgroundColor: '#fff', // White background
    padding: 10,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  emojiIcon: {
    fontSize: 32, // Large emoji size
    color: '#4a90e2', // Optional: Change emoji color to match theme
    textAlign: 'center',
  },
  playButton: {
    backgroundColor: '#ffcc00', // Bright Yellow Background
    width: 70,
    height: 70,
    borderRadius: 35, // Circular Shape
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ff9900', // Orange Border
    elevation: 3, // Android Shadow
    shadowColor: '#000', // iOS Shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  playIcon: {
    fontSize: 36, // Large Play/Pause Icon
    color: '#ffffff', // White Icon Color
    textShadowColor: 'rgba(0, 0, 0, 0.3)', // Slight Shadow for Depth
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
});


export default NarrationText;
