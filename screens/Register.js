import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { createUserWithEmailAndPassword } from '@firebase/auth';
import { collection, doc, setDoc, serverTimestamp } from '@firebase/firestore';
import { auth, db } from "../firebaseconfig";

export default function App({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [thainame, setThaiName] = useState('');
  const [engname, setEngName] = useState('');
  const [type, setType] = useState('บุคลากรภายนอก');
  const [rank, setRank] = useState([
    { label: 'ศ. ดร.', value: 'ศ. ดร.' },
    { label: 'ศ.', value: 'ศ.' },
    { label: 'รศ. ดร.', value: 'รศ. ดร.' },
    { label: 'รศ.', value: 'รศ.' },
    { label: 'ผศ. ดร.', value: 'ผศ. ดร.' },
    { label: 'ผศ.', value: 'ผศ.' },
    { label: 'อ. ดร.', value: 'อ. ดร.' },
    { label: 'อ.', value: 'อ.' },
  ]);
  const [selectedRank, setSelectedRank] = useState(null);
  const [address, setAddress] = useState('');
  const [tel, setTel] = useState('');
  const [open, setOpen] = useState(false);

  const UserRegister = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user && user.uid) {
        const usersCollection = collection(db, 'users');
        const userDoc = doc(usersCollection, user.uid);
        await setDoc(userDoc, { thainame, engname, address, tel, email, role: "user", createdDate: serverTimestamp(), type, rank: selectedRank });
        alert('Registration successful');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } else {
        throw new Error('User ID not found');
      }
    } catch (error) {
      alert('Registration Failed: ' + error.message);
      console.log(error);
    }
  };

  const RadioButton = ({ label, value, selectedValue, onSelect }) => (
    <TouchableOpacity style={styles.radioButtonContainer} onPress={() => onSelect(value)}>
      <View style={styles.radioButton}>
        {selectedValue === value && <View style={styles.radioButtonSelected} />}
      </View>
      <Text style={styles.radioButtonLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>สมัครสมาชิก</Text>
      <TextInput
        style={styles.input}
        placeholder="ชื่อภาษาไทย"
        onChangeText={setThaiName}
        value={thainame}
      />
      <TextInput
        style={styles.input}
        placeholder="ชื่อภาษาอังกฤษ"
        onChangeText={setEngName}
        value={engname}
      />
      <View style={styles.radioGroup}>
        <RadioButton
          label="บุคลากรภายนอก"
          value="บุคลากรภายนอก"
          selectedValue={type}
          onSelect={setType}
        />
        <RadioButton
          label="บุคลากรภายใน"
          value="บุคลากรภายใน"
          selectedValue={type}
          onSelect={setType}
        />
      </View>
      {type === 'บุคลากรภายใน' && (
        <DropDownPicker
          open={open}
          value={selectedRank}
          items={rank}
          setOpen={setOpen}
          setValue={setSelectedRank}
          setItems={setRank}
          style={styles.dropdown}
          containerStyle={{ width: '100%' }}
          placeholder="เลือกตำแหน่ง"
          zIndex={1000}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="ที่อยู่"
        onChangeText={setAddress}
        value={address}
      />
      <TextInput
        style={styles.input}
        placeholder="เบอร์โทรติดต่อ"
        inputMode='numeric'
        maxLength={10}
        onChangeText={setTel}
        value={tel}
      />
      <TextInput
        style={styles.input}
        placeholder="อีเมล์"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="รหัสผ่าน"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="ยืนยัน รหัสผ่าน"
        onChangeText={setConfirmPassword}
        value={confirmPassword}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>ยกเลิก</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerButton} onPress={UserRegister}>
          <Text style={styles.buttonText}>ลงทะเบียน</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8c1c1',
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  dropdown: {
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  radioButtonSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: 'blue',
  },
  radioButtonLabel: {
    marginRight: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  registerButton: {
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});