import React, { useRef } from 'react';
import { View, Image, ScrollView, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import NarrationText from '../Kahani/NarrationText'; // Assuming this is adapted for React Native as well

interface Page {
  image_path?: string;
  parent_narration_text: string;
  // Add other properties of the page object as needed
}

interface StoryPageProps {
  page: Page;
  currentPage: number;
  children: (ref: React.RefObject<ScrollView>) => React.ReactNode;
  backgroundMusicUrl: string;
}

const StoryPage: React.FC<StoryPageProps> = ({ page, currentPage, children, backgroundMusicUrl }) => {
  const pRef = useRef<ScrollView>(null);

  return (
    <View style={styles.storyPage}>
      <View style={styles.imageContainer}>
        {page.image_path && (
          <Image
            source={{ uri: page.image_path }}
            style={styles.storyImage}
            alt={`Page ${currentPage}`}
          />
        )}
      </View>
      {/* <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollablePanel} ref={pRef}>
          <NarrationText
            text={page.parent_narration_text}
            backgroundMusicUrl={backgroundMusicUrl}
          />
        </ScrollView>
      </View> */}
      {children(pRef)}
    </View>
  );
};

interface Styles {
  storyPage: ViewStyle;
  imageContainer: ViewStyle;
  storyImage: ImageStyle;
  contentContainer: ViewStyle;
  scrollablePanel: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  storyPage: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    flex: 2,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  contentContainer: {
    flex: 3,
    padding: 10,
  },
  scrollablePanel: {
    flex: 1,
  },
});

export default StoryPage;