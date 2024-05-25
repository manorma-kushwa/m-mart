// Import necessary modules
import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, StatusBar, ImageBackground } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { API_BASE_URL } from '@env';
import { storeApiData } from '../../redux/cartSlice';

const SignIn = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    const handleClear = () => {
        setEmail('');
        setPassword('');
    };

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        try {
            const response = await axios.post(`${API_BASE_URL + 'users/signin'}`, {
                email,
                password,
            });

            if (response.data.status != 'error') {
                Alert.alert('Success', 'Signed In successfully');
                await AsyncStorage.setItem('email', response.data.email);
                await AsyncStorage.setItem('name', response.data.name);
                await AsyncStorage.setItem('token', response.data.token);
                fetchImpData(response.data.token);
                dispatch({ type: 'SET_TOKEN', payload: response.data.token });
                navigation.navigate('CategoryScreen');
            } else {
                Alert.alert('Error', response.data.message);
            }
        } catch (error) {
            console.log(error)
            Alert.alert('Error', 'Something went wrong');
        }
    };

    const fetchImpData = async (Token) => {
        try {
            const response = await axios.get(`${API_BASE_URL + 'cart'}`, {
                headers: {
                    Authorization: `Bearer ${Token}`,
                },
            });
            const { items } = response.data;
            dispatch(storeApiData(items));
        } catch (error) {
            console.error('Error fetching cart data:', error);
        }
        try {
            const response = await axios.get(`${API_BASE_URL + 'orders/all'}`, {
                headers: {
                    Authorization: `Bearer ${Token}`,
                },
            });
            const data = await response.data;
            const parsedOrders = data.orders.map(order => ({
                ...order,
                order_items: JSON.parse(order.order_items)
            }));
            const newOrders = parsedOrders.filter(order => order.is_paid === 0 && order.is_delivered === 0);
            dispatch({ type: 'SET_ORDER_COUNT', payload: newOrders.length });
        } catch (error) {
            console.error('Error fetching order', error);
        }
    };

    const navigateToSignUp = () => {
        navigation.navigate('SignUp');
    };

    return (
        <ImageBackground
            source={require('../../assets/background.jpeg')}
            style={styles.backgroundImage}
        >
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Sign in with your email and password</Text>
                </View>
                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry={true}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                            <Text style={styles.buttonText}>Sign In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={handleClear}>
                            <Text style={styles.buttonText}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={navigateToSignUp}>
                        <Text style={styles.switchText}>Switch to: Sign Up a new user</Text>
                    </TouchableOpacity>
                </View>
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
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'rgb(62,50,58)',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    formContainer: {
        backgroundColor: '#F0F0F0',
        padding: 20,
        borderRadius: 10,
    },
    input: {
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        backgroundColor: '#805D45',
        padding: 10,
        borderRadius: 5,
        width: '45%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    switchText: {
        marginTop: 10,
        textAlign: 'center',
        color: '#805D45',
        textDecorationLine: 'underline',
    },
});

export default SignIn;
