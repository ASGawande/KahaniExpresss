import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, ViewStyle, TextStyle } from 'react-native';

interface NarrationTextProps {
  text: string;
  backgroundMusicUrl: string;
}

const NarrationText: React.FC<NarrationTextProps> = ({ text, backgroundMusicUrl }) => {
  const handleWordClick = (word: string): void => {

  };

  const renderText = (): JSX.Element[] => {
    return text.split(' ').map((word, index) => (
      <TouchableOpacity key={index} onPress={() => handleWordClick(word)}>
        <Text style={styles.clickableWord}>
          {word}{' '}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.narrationContainer}>
      <ScrollView>
        <View style={styles.narrationText}>
          {renderText()}
        </View>
      </ScrollView>
      {/* <BackgroundMusic /> */}
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
    color: '#007AFF', // iOS blue color, you can change this
    fontSize: 19,
    fontWeight: '500', // Semi-bold
  },
});

export default NarrationText;