import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from '@firebase/auth';
import { auth, db } from '../firebaseconfig'

export default function Forget({ navigation }) {
  const [email, setEmail] = useState('');

  async function ResetPassword() {
    try {
      const signInMethods = fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length === 0) {
        // Email is not registered
        alert('This email is not registered.');
      } else {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent!');
      }
    } catch (error) {
      alert('Error', error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>รีเซ็ตรหัสผ่าน</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>E-Mail :</Text>
        <TextInput
          style={styles.input}
          placeholder="E-Mail :"
          onChangeText={setEmail}
        />
      </View>
      <TouchableOpacity style={styles.resetButton} onPress={ResetPassword}>
        <Text style={styles.resetButtonText}>ตกลง</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>ยกเลิก</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8a398',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    width: 200,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
  },
  resetButton: {
    backgroundColor: '#b19cd9',
    paddingVertical: 10,
    paddingHorizontal: 80,
    borderRadius: 5,
    marginBottom: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 10,
    paddingHorizontal: 80,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});