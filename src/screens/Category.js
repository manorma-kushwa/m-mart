import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, StatusBar, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CategoryScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  const fetchCategoriesData = async () => {
    try {
      const response = await fetch('https://fakestoreapi.com/products/categories');
      const data = await response.json();
      setCategories(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('ProductListScreen', { category });
  };


  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleCategoryPress(item)}
      style={[
        styles.categoryItem,
        selectedCategory === item && styles.selectedCategoryItem
      ]}
      onPressIn={() => setSelectedCategory(item)}
      onPressOut={() => setSelectedCategory(null)}
    >
      <Text style={styles.categoryText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../src/assets/background.jpeg')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Categories</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#FFFFFF" />
        ) : (
          <FlatList
            data={categories}
            renderItem={renderItem}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoryList}
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    paddingTop: StatusBar.currentHeight,
  },
  container: {
    flex: 1,
  },
  titleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: 'rgb(62,50,58)',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  categoryList: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  categoryItem: {
    backgroundColor: '#ebd7b5',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderRadius: 10,
    borderLeftColor: '#805D45',
  },
  categoryText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgb(62,50,58)',
    textTransform: 'capitalize',
  },
  selectedCategoryItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});

export default CategoryScreen;
