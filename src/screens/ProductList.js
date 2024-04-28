import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ImageBackground, Image, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProductListScreen = ({ route }) => {
    const { category } = route.params;
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`https://fakestoreapi.com/products/category/${category}`);
                const data = await response.json();
                setProducts(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProducts();

        navigation.setOptions({
            headerShown: false,
        });

        return () => {
            navigation.setOptions({
                headerShown: true,
            });
        };
    }, [category, navigation]);

    const handleProductPress = (productId) => {
        navigation.navigate('ProductDetailScreen', { productId });
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    const renderProductItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleProductPress(item.id)}
            style={styles.productItem}
        >
            <>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <View style={styles.productDetails}>
                    <Text style={styles.productTitle}>{item.title}</Text>
                    <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                </View>
            </>
        </TouchableOpacity>
    );

    return (
        <ImageBackground
            source={require('../src/assets/background.jpeg')}
            style={styles.backgroundImage}
        >
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{category}</Text>
                </View>
                {loading ? (
                    <ActivityIndicator size="large" color="#FFFFFF" />
                ) : (
                    <FlatList
                        data={products}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.productList}
                    />
                )}
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Back</Text>
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
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'rgb(62,50,58)',
        textTransform:'uppercase',
        textAlign: 'center',
    },
    productList: {
        paddingBottom: 20,
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f7e9d0', 
        borderRadius: 8,
        marginBottom: 12,
        padding: 12,
        borderBottomWidth:4,
        borderBottomColor:'#805D45'
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#FFFFFF', // White border
        marginRight: 12,
    },
    productDetails: {
        flex: 1,
    },
    productTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'rgb(62,50,58)',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        color: '#rgb(62,50,58)',
    },
    backButton: {
        marginTop:10,
        borderTopWidth:2,
        borderTopColor:'#805D45'
    },
    backButtonText: {
        backgroundColor: '#805D45',
        paddingVertical: 12,
        width: '100%',
        alignSelf:'center',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        textTransform: 'uppercase',
        textAlign:'center',
    },
});

export default ProductListScreen;
