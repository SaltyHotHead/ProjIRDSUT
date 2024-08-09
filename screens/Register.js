import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { initializeApp } from '@firebase/app';
import { getAuth, createUserWithEmailAndPassword } from '@firebase/auth';
import { getFirestore, collection, doc, setDoc } from '@firebase/firestore';

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
  const [name, setName] = useState('');

  const   
 UserRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user   
 && user.uid) {
        const usersCollection = collection(db, 'users');
        const userDoc = doc(usersCollection, user.uid);
        await setDoc(userDoc, { name: name , role: "user"});
        alert('ลงทะเบียนสำเร็จ');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } else {
        throw new Error('User ID not found');
      }
    } catch (error) {
      alert('ลงทะเบียนล้มเหลว');
      alert(error.message)
      console.log(error);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Name"
        onChangeText={setName}
        value={name}
      />
      <TextInput
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <Button title="Register" onPress={UserRegister} />
      <Button
        title="Back"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
};
