import React, { useState, useEffect } from 'react';
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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
};

type NavigationProps = NavigationProp<RootStackParamList>;

const LazyImageList: React.FC = () => {
  const [stories, setStories] = useState<ImageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState<string>('Kahani'); // Default menu item

  const navigation = useNavigation<NavigationProps>();

  const handleSelectStory = (storyId: string) => {
    navigation.navigate('details', { storyId });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://kahanijsondata.azurewebsites.net/kahanijson'
        );
        const parsedStories = response.data[0].stories.map((storyStr: string) =>
          JSON.parse(storyStr)
        );
        const sortedStories = parsedStories.sort(
          (a: Story, b: Story) =>
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
  );

  // Define icons for menu items
  const menuItems = [
    { name: 'Kahani', icon: 'menu-book' },
    { name: 'Paint', icon: 'brush' },
    { name: 'Games', icon: 'sports-esports' },
    { name: 'Progress', icon: 'trending-up' },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/images/Kahani_Express_tran.png')}
          style={styles.logoImage}
        />
        <View style={styles.headerRight}>
          <Text style={styles.username}>User</Text>
          <TouchableOpacity style={styles.userImageContainer}>
            <Image
              source={require('../../assets/images/Default_User_Icon.png')}
              style={styles.userImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Conditional Rendering */}
      {activeMenu === 'Paint' ? (
        <View style={styles.gifContainer}>
          <Image
            source={require('../../assets/images/coming_soon_for_paint_feature_with_animated.jpeg')}
            style={styles.gifImage}
            resizeMode="contain"
          />
        </View>
      ) : activeMenu === 'Games' ? (
        <View style={styles.gifContainer}>
          <Image
            source={require('../../assets/images/coming_soon_for_gaming_feature_with_animated.png')}
            style={styles.gifImage}
            resizeMode="contain"
          />
        </View>
      ) : (
        <>
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

          {/* Main Content */}
          <FlatList
            data={filteredStories}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            ListFooterComponent={
              <View style={styles.footer}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            }
          />
        </>
      )}

      {/* Bottom Navigation Menu */}
      <View style={styles.bottomMenu}>
        {menuItems.map((menu) => (
          <TouchableOpacity
            key={menu.name}
            style={styles.menuItem}
            onPress={() => setActiveMenu(menu.name)}
          >
            <MaterialIcons
              name={menu.icon}
              size={28}
              style={[
                styles.menuIcon,
                activeMenu === menu.name ? styles.activeIcon : null,
              ]}
            />
            <Text
              style={[
                styles.menuText,
                activeMenu === menu.name ? styles.activeMenuText : null,
              ]}
            >
              {menu.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fff',
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
    color: '#333',
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
  },
  userImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  searchContainer: {
    padding: 10,
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
  gifContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
  gifImage: {
    width: '90%',
    height: 300,
  },
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  menuItem: {
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    color: '#aaa',
  },
  activeIcon: {
    color: '#007bff',
  },
  menuText: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 5,
  },
  activeMenuText: {
    color: '#007bff',
  },
  cardContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  storyCard: {
    alignItems: 'center',
  },
  storyImageCard: {
    width: '100%',
    height: 200,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 8,
    color: '#333',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#555',
    padding: 5,
    textAlign: 'justify',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default LazyImageList;
