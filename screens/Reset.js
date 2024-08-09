import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { initializeApp } from '@firebase/app';
import { getAuth, sendPasswordResetEmail } from '@firebase/auth';
import { getFirestore, } from '@firebase/firestore';

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

export default function Forget({ navigation }) {

  const [email, setEmail] = useState('');

  async function ResetPassword() {
    await sendPasswordResetEmail(auth, email)
      .then((user) => {
        alert('ส่งอีเมลล์เรียบร้อยแล้ว');
      })
      .catch((error) => {
        alert(error.message);
      });
  }

  return (
    <View>
      <TextInput 
      placeholder="Email"
      onChangeText={setEmail} />
      <Button
        title="Reset password"
        onPress={() => ResetPassword()}
      />
      <Button
        title="Back"
        onPress={() => {
          navigation.goBack();
        }}
      />
    </View>
  );
}
