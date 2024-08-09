import React, { useState, useEffect } from 'react';
import { View, TextInput, Button } from 'react-native';
import { initializeApp } from '@firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from '@firebase/auth';
import { getFirestore } from '@firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBhHaFudvmY2WZgM46vqPwuYsC0e-sEX2o",
  authDomain: "project-ird-sut.firebaseapp.com",
  projectId: "project-ird-sut",
  storageBucket: "project-ird-sut.appspot.com",
  messagingSenderId: "645453459112",
  appId: "1:645453459112:web:9cc81b4776eb578819dc9d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

