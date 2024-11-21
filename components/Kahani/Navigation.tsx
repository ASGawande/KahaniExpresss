import React from 'react';
import { View, Button, Alert, ViewStyle, StyleSheet } from 'react-native';


// Define the shape of the 'page' prop
interface Page {
  parent_narration_audio?: string;
  // Add other properties of the page object as needed
}

// Define the props for the Navigation component
interface NavigationProps {
  page: Page;
  currentPage: number;
  totalPages: number;
  nextPage: () => void;
  prevPage: () => void;
  pRef: React.RefObject<{ getContent: () => string }>;
}

const Navigation: React.FC<NavigationProps> = ({
  page,
  currentPage,
  totalPages,
  nextPage,
  prevPage,
  pRef,
}) => {
  const speak = () => {
    const speakContent = pRef.current ? pRef.current.getContent() : '';
    if (speakContent.trim() !== '') {
      
    } else {
      Alert.alert('No content to speak');
    }
  };

  return (
    <View style={styles.navigation}>
      <Button
        title="Previous"
        onPress={prevPage}
        disabled={currentPage === 0}
      />
      {!page.parent_narration_audio && (
        <Button title="Speak" onPress={speak} />
      )}
      
      <Button
        title="Next"
        onPress={nextPage}
        disabled={currentPage === totalPages - 1}
      />
    </View>
  );
};

interface Styles {
  navigation: ViewStyle;
  navButton: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  navButton: {
    marginHorizontal: 5,
  },
});

export default Navigation;