// LazyImageList.tsx
import React, { useState, useEffect } from 'react';
import { 
  FlatList, 
  Text, 
  View, 
  StyleSheet, 
  Image, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import axios from 'axios';

interface Story {
  create_date: string;
}

interface ImageItem {
  _id: string;
  title: string;
  poster_page: string;
  description: string;
}

// Define the navigation parameters
type RootStackParamList = {
  details: { storyId: string };
  // Add other screens as needed
};

type NavigationProps = NavigationProp<RootStackParamList>;

const LazyImageList: React.FC = () => {
  const [stories, setStories] = useState<ImageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const navigation = useNavigation<NavigationProps>();

  const handleSelectStory = (storyId: string) => {
    navigation.navigate('details', { storyId });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://kahanijsondata.azurewebsites.net/kahanijson');
        const parsedStories = response.data[0].stories.map((storyStr: string) => JSON.parse(storyStr));
        const sortedStories = parsedStories.sort((a: Story, b: Story) =>
          new Date(b.create_date).getTime() - new Date(a.create_date).getTime()
        );
        setStories(sortedStories);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filteredStories = stories.filter((item) => {
    const title = (item.title || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    return title.includes(search) || description.includes(search);
  });

  const renderItem = ({ item }: { item: ImageItem }) => (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardContainer}>
        <TouchableOpacity
          key={item._id}
          style={styles.storyCard}
          onPress={() => handleSelectStory(item._id)}
        >
          <Image
            style={styles.storyImageCard}
            source={{ uri: item.poster_page }}
            resizeMode="cover"
          />
          <Text style={styles.storyTitle}>{item.title}</Text>
        </TouchableOpacity>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </ScrollView>
  );

  const keyExtractor = (item: ImageItem) => item._id;

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image 
          source={require('../../assets/images/Kahani_Express_tran.png')} 
          style={styles.logoImage}
        />
        <View style={styles.headerRight}>
          <Text style={styles.username}>user</Text>
          <TouchableOpacity style={styles.userImageContainer}>
            <Image 
              source={require('../../assets/images/Default_User_Icon.png')} 
              style={styles.userImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Textbox */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search stories..."
          placeholderTextColor="#999"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <FlatList
        data={filteredStories}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={10}
        ListFooterComponent={
          <View style={styles.footer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#f8f8f8', // Classic neutral background for header
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    marginRight: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#333', // Subtle text color
  },
  logoImage: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
  },
  userImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd', // Subtle border for the avatar
  },
  userImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#f8f8f8',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  container: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    alignItems: 'center',
  },
  cardContainer: {
    width: '90%', // Uniform width for all cards
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3, // Subtle shadow on Android
    shadowColor: '#000', // Shadow for iOS
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  storyCard: {
    alignItems: 'center',
  },
  storyImageCard: {
    width: '100%',
    height: 200, // Fixed height for consistency
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
    color: '#333',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  description: {
    fontSize: 14,
    color: '#555',
    padding: 10,
    textAlign: 'justify',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
});


export default LazyImageList;
