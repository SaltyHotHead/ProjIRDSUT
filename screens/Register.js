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
  const [selectedRank, setSelectedRank] = useState(null); // Separate state for selected value
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

  // RadioButton Component
  const RadioButton = ({ label, value, selectedValue, onSelect }) => (
    <TouchableOpacity style={styles.radioButtonContainer} onPress={() => onSelect(value)}>
      <View style={styles.radioButton}>
        {selectedValue === value && <View style={styles.radioButtonSelected} />}
      </View>
      <Text style={styles.radioButtonLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View>
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
        placeholder="Thainame"
        onChangeText={setThaiName}
        value={thainame}
      />
      <TextInput
        placeholder="Engname"
        onChangeText={setEngName}
        value={engname}
      />
      <TextInput
        placeholder="Address"
        onChangeText={setAddress}
        value={address}
      />
      <TextInput
        placeholder="Tel"
        inputMode='numeric'
        maxLength={10}
        onChangeText={setTel}
        value={tel}
      />
      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <TextInput
        placeholder="Confirm Password"
        onChangeText={setConfirmPassword}
        value={confirmPassword}
        secureTextEntry
      />
      <Button title="Register" onPress={UserRegister} />
      <Button
        title="Back"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
});