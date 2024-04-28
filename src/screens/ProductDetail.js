import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, ImageBackground, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
        const data = await response.json();

        const productWithImage = {
          ...data,
          image: data.image ? data.image : 'https://via.placeholder.com/200',
        };

        setProduct(productWithImage);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    fetchProduct();

    navigation.setOptions({
      headerShown: false,
    });

    return () => {
      navigation.setOptions({
        headerShown: true,
      });
    };
  }, [productId, navigation]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleAddToCart = async () => {
    if (product) {
      try {
        const storedCartItems = await AsyncStorage.getItem('cartItems');
        const cartItems = storedCartItems ? JSON.parse(storedCartItems) : [];

        const existingItem = cartItems.find(item => item.id === product.id);

        if (!existingItem) {
          const updatedCartItems = [
            ...cartItems,
            { ...product, quantity: 1 }
          ];

          await AsyncStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
          navigation.navigate('Shopping Cart');
        } else {
          const updatedCartItems = cartItems.map(item => {
            if (item.id === product.id) {
              return { ...item, quantity: item.quantity + 1 };
            }
            return item;
          });

          await AsyncStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
          navigation.navigate('Shopping Cart');
        }
      } catch (error) {
        console.error('Error adding item to cart:', error);
      }
    }
  };

  return (
    <ImageBackground
      source={require('../src/assets/background.jpeg')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Product Details</Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false} // Disable vertical scroll indicator
          scrollEnabled={!loading} // Disable scrolling while loading
          keyboardShouldPersistTaps="handled" // Allow tapping on components without dismissing keyboard
        >
          {loading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : product ? (
            <>
              {product.image && (
                <Image source={{ uri: product.image }} style={styles.productImage} />
              )}
              <Text style={styles.Producttitle}>{product.title}</Text>
              <View style={styles.shortContainer}>
                <Text style={styles.short}>Price: ${product.price.toFixed(2)}</Text>
                <Text style={styles.short}>Rating: {product.rating.rate}</Text>
                <Text style={styles.short}>Sold: {product.rating.count}</Text>
              </View>
              <ScrollView style={styles.descriptionScrollView}>
                <Text style={styles.descriptionText}>{product.description}</Text>
              </ScrollView>
            </>
          ) : (
            <Text style={styles.errorText}>Product not found</Text>
          )}
        </ScrollView>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={handleAddToCart}
        >
          <Text style={styles.backButtonText}>Add to Cart</Text>
        </TouchableOpacity>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgb(62,50,58)',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  Producttitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgb(62,50,58)',
    paddingHorizontal: 10
  },
  shortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 10,
    paddingHorizontal: 10
  },
  short: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: '#805D45',
    paddingVertical: 5,
    paddingHorizontal: 20,
    marginTop: 6,
    borderRadius: 10
  },
  descriptionScrollView: {
    maxHeight: 235,
    padding: 10,
    backgroundColor:'rgba(194, 166, 145, 0.41)'
  },
  descriptionText: {
    fontSize: 16,
    color: 'rgb(62,50,58)',
    textAlign: 'justify',
  },
  productImage: {
    width: '100%',
    height: 250,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 2,
    borderTopColor: '#805D45',
    backgroundColor: 'rgba(194, 166, 145, 0.41)'
  },
  backButton: {
    backgroundColor: '#805D45',
    padding: 12,
    margin:5,
    alignSelf: 'center',
    width: '40%',
    borderRadius:10
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});

export default ProductDetailScreen;
