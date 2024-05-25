import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet, FlatList, ImageBackground, StatusBar } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '@env';
import { useDispatch } from 'react-redux';

const Order = ({ navigation }) => {
    const [orders, setOrders] = useState([]);
    const [newOrders, setNewOrders] = useState([]);
    const [paidOrders, setPaidOrders] = useState([]);
    const [deliveredOrders, setDeliveredOrders] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [index, setIndex] = useState(0);
    const dispatch = useDispatch();

    const [routes] = useState([
        { key: 'newOrders', title: 'New Orders' },
        { key: 'paidOrders', title: 'Paid Orders' },
        { key: 'deliveredOrders', title: 'Delivered Orders' },
    ]);



    const loadOrders = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await axios.get(`${API_BASE_URL + 'orders/all'}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.data;
            const parsedOrders = data.orders.map(order => ({
                ...order,
                order_items: JSON.parse(order.order_items)
            }));
            setOrders(parsedOrders);
            categorizeOrders(parsedOrders);
            setLoading(false);
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to load orders. Please try again later.');
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadOrders();
        }, [])
    );

    useEffect(() => {
        loadOrders();
    }, []);


    const categorizeOrders = (orders) => {
        const newOrders = orders.filter(order => order.is_paid === 0 && order.is_delivered === 0);
        const paidOrders = orders.filter(order => order.is_paid === 1 && order.is_delivered === 0);
        const deliveredOrders = orders.filter(order => order.is_delivered === 1);
        dispatch({ type: 'SET_ORDER_COUNT', payload: newOrders.length });
        setNewOrders(newOrders);
        setPaidOrders(paidOrders);
        setDeliveredOrders(deliveredOrders);
    };

    function formatNumber(number) {
        const numberString = number.toString();
        const length = numberString.length;
        return numberString.slice(0, length - 2) + '.' + numberString.slice(length - 2);
    }

    const handlePayOrder = async (orderId) => {
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await axios.post(`${API_BASE_URL + 'orders/updateorder'}`, {
                "orderID": orderId,
                "isPaid": 1,
                "isDelivered": 0
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                Alert.alert('Success', 'Your order is paid.');
                loadOrders();
            } else {
                throw new Error('Failed to pay order');
            }
        } catch (error) {
            console.error('Error paying order:', error);
            Alert.alert('Error', 'Failed to pay order. Please try again later.');
        }
    };

    const handleReceiveOrder = async (orderId) => {
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await axios.post(`${API_BASE_URL + 'orders/updateorder'}`, {
                "orderID": orderId,
                "isPaid": 1,
                "isDelivered": 1
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                Alert.alert('Success', 'Your order is delivered.');
                loadOrders();
            } else {
                throw new Error('Failed to receive order');
            }
        } catch (error) {
            console.error('Error receiving order:', error);
            Alert.alert('Error', 'Failed to receive order. Please try again later.');
        }
    };

    const renderOrderItem = ({ item }) => (
        <View style={styles.orderContainer}>
            <TouchableOpacity
                style={styles.orderHeader}
                onPress={() => toggleOrderExpanded(item.id)}
            >
                <Text style={styles.orderHeaderText}>Order ID: {item.id}</Text>
                <Text style={styles.orderHeaderText}>Items: {item.order_items.length}</Text>
                <Text style={styles.orderHeaderText}>Total Price: ${formatNumber(item.total_price)}</Text>
                <TouchableOpacity
                    style={styles.caretButton}
                    onPress={() => toggleOrderExpanded(item.id)}
                >
                    <Text>{expandedOrderId === item.id ? '▼' : '▶'}</Text>
                </TouchableOpacity>
            </TouchableOpacity>
            {expandedOrderId === item.id && (
                <View style={styles.orderDetails}>
                    {item.order_items.map((product, index) => (
                        <View key={index} style={styles.productItem}>
                            <Image
                                source={{ uri: product.image }}
                                style={styles.productImage}
                            />
                            <View style={styles.productInfo}>
                                <Text style={styles.productInfoText}>{product.title}</Text>
                                <View style={styles.orderPrice}>
                                    <Text>Price: ${product.price.toFixed(2)}</Text>
                                    <Text>Quantity: {product.quantity}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                    {item.is_paid === 0 && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handlePayOrder(item.id)}
                        >
                            <Text style={styles.actionButtonText}>Pay</Text>
                        </TouchableOpacity>
                    )}
                    {item.is_paid === 1 && item.is_delivered === 0 && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleReceiveOrder(item.id)}
                        >
                            <Text style={styles.actionButtonText}>Receive</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );

    const toggleOrderExpanded = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    if (loading) {
        return (
            <ImageBackground
                source={require('../assets/background.jpeg')}
                style={styles.backgroundImage}
            >
                <View style={styles.loadingContainer}>
                    <Text>Loading...</Text>
                </View>
            </ImageBackground>
        );
    }

    const NewOrdersRoute = () => (
        <FlatList
            data={newOrders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderOrderItem}
            contentContainerStyle={styles.categoryList}
        />
    );

    const PaidOrdersRoute = () => (
        <FlatList
            data={paidOrders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderOrderItem}
            contentContainerStyle={styles.categoryList}
        />
    );

    const DeliveredOrdersRoute = () => (
        <FlatList
            data={deliveredOrders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderOrderItem}
            contentContainerStyle={styles.categoryList}
        />
    );

    const renderScene = SceneMap({
        newOrders: NewOrdersRoute,
        paidOrders: PaidOrdersRoute,
        deliveredOrders: DeliveredOrdersRoute,
    });

    return (
        <ImageBackground
            source={require('../assets/background.jpeg')}
            style={styles.backgroundImage}
        >
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>My Orders</Text>
                </View>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: '100%' }}
                    renderTabBar={props => (
                        <TabBar
                            {...props}
                            indicatorStyle={styles.tabIndicator}
                            style={styles.tabBar}
                            labelStyle={styles.tabLabel}
                        />
                    )}
                />
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
        padding: 20,
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
    categoryList: {
        flexGrow: 1,
        paddingVertical: 10,
    },
    orderContainer: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 10,
        padding: 10,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderPrice: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        fontSize: 12,
    },
    orderHeaderText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    caretButton: {
        padding: 5,
    },

    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomColor: '#805D45',
        borderBottomWidth: 2,
        padding: 10
    },
    productImage: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        marginRight: 10,
    },
    productInfo: {
        flex: 1,
    },
    productInfoText: {
        fontSize: 14,
    },
    actionButton: {
        backgroundColor: '#805D45',
        padding: 10,
        alignSelf: 'center',
        width: '50%',
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabIndicator: {
        backgroundColor: '#805D45',
        height: 3
    },
    tabBar: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        marginTop: 10
    },
    tabLabel: {
        fontWeight: 'bold',
        color: 'rgb(62,50,58)',
    },
});

export default Order;
