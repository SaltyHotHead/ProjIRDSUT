import React, { useState, useEffect } from 'react';
import { View, TextInput, Button } from 'react-native';
import { signInWithEmailAndPassword, onAuthStateChanged } from '@firebase/auth';
import { app, auth } from "../firebaseconfig";

export default function App({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function UserLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('ล็อคอินสำเร็จ');
      /*let colRef = firestore.collection('users');

      await colRef.get().then()*/
      //if ( role = "admin" ) {
        navigation.reset({ index: 0, routes: [{ name: 'HomeAdmin' }] });
      /*} else {
        navigation.reset({ index: 0, routes: [{ name: 'HomeUser' }] });
      }*/
    } catch (error) {
      alert('ล็อคอินล้มเหลว')
      alert(error.message);
    }
  }
/*
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }
    });
    return () => unsubscribe();
  }, [navigation]);
*/
  return (
    <View>
      <TextInput
        placeholder="Email"
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={() => UserLogin()} />
      <Button
        title="Register"
        onPress={() => {
          navigation.navigate('Register');
        }}
      />
      <Button
        title="Reset Password"
        onPress={() => {
          navigation.navigate('Reset');
        }}
      />
    </View>
  );
}