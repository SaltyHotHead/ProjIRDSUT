import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword } from '@firebase/auth';
import { doc, getDoc } from '@firebase/firestore';
import { auth, db } from "../firebaseconfig";

export default function App({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function UserLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('ล็อคอินสำเร็จ');

      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists) {
        const userData = userDoc.data();
        const role = userData.role;

        if (role === "admin") {
          navigation.reset({ index: 0, routes: [{ name: 'HomeAdmin' }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'HomeUser' }] });
        }
      } else {
        alert('User data not found');
      }
    } catch (error) {
      alert('ล็อคอินล้มเหลว', error.message);
      console.log(error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>เข้าสู่ระบบ</Text>
      <TextInput
        style={styles.input}
        placeholder="E-Mail :"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Password :"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <Button title="เข้าสู่ระบบ" onPress={UserLogin} color="#007bff" />
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>ยังไม่มีบัญชีผู้ใช้โปรดสมัครสมาชิก</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Reset')}>
        <Text style={styles.link}>ลืมรหัสผ่านใช่หรือไม่? รีเซ็ตรหัสผ่าน</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8a398',
    padding: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '50%',
    height: 40,

    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 40,
    backgroundColor: '#e0e0e0',
  },
  link: {
    color: '#000000',
    marginTop: 10,
    textAlign: 'center',
  },
});