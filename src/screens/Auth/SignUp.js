import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, StatusBar, ImageBackground } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { useDispatch } from 'react-redux';

const SignUp = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    const handleClear = () => {
        setName('');
        setEmail('');
        setPassword('');
    };

    const handleSignUp = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        try {
            const response = await axios.post(`${API_BASE_URL + 'users/signup'}`, {
                name,
                email,
                password,
            });
            if (response.status != 'error') {
                Alert.alert('Success', 'Signed up successfully');
                await AsyncStorage.setItem('email', response.data.email);
                await AsyncStorage.setItem('name', response.data.name);
                await AsyncStorage.setItem('token', response.data.token);
                dispatch({ type: 'SET_TOKEN', payload: response.data.token });
                navigation.navigate('CategoryScreen');
            } else {
                Alert.alert('Error', response.data.message);
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to sign up.');
        }
    };

    const navigateToSignIn = () => {
        navigation.navigate('SignIn');
    };

    return (
        <ImageBackground
            source={require('../../assets/background.jpeg')}
            style={styles.backgroundImage}
        >
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Sign up a new user</Text>
                </View>
                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        value={name}
                        onChangeText={setName}
                    />
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
                        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                            <Text style={styles.buttonText}>Sign Up</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={handleClear}>
                            <Text style={styles.buttonText}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={navigateToSignIn}>
                        <Text style={styles.switchText}>Switch to: Sign In</Text>
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

export default SignUp;
