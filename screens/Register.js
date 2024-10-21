import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
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
    { label: 'อื่นๆ', value: 'อื่นๆ' },
  ]);
  const [selectedRank, setSelectedRank] = useState(null);
  const [address, setAddress] = useState('');
  const [tel, setTel] = useState('');
  const [open, setOpen] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState(''); // State for email error message
  const [modalVisible, setModalVisible] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : "Invalid email format.";
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[a-zA-Z]/.test(password)) {
      return "Password must contain at least one letter.";
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least one number.";
    }
    return null;
  };

  const UserRegister = async () => {
    if (!thainame || !engname || !address || !tel || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    const emailValidationResult = validateEmail(email);
    if (emailValidationResult) {
      setEmailError(emailValidationResult);
      alert(emailValidationResult);
      return;
    }

    const passwordValidationResult = validatePassword(password);
    if (passwordValidationResult) {
      setPasswordError(passwordValidationResult);
      alert(passwordValidationResult);
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setPasswordError('');
    setEmailError('');

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

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  useEffect(() => openModal(), []);

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Text style={styles.modalText}>
            ขอแจ้งให้ทราบเกี่ยวกับการจัดเก็บข้อมูลส่วนบุคคล ผ่านระบบออนไลน์
            สถาบันวิจัยและพัฒนา มหาวิทยาลัยเทคโนโลยีสุรนารี
            </Text>
            <Text style={styles.modalText}>
            เพื่อปกป้องความเป็นส่วนตัวของข้อมูลเจ้าของข้อมูลส่วนบุคคล ให้สอดคล้องกับ พรบ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ.2562 สถาบันวิจัยและพัฒนา มหาวิทยาลัยเทคโนโลยีสุรนารี ขอเรียนแจ้งแนวทางการจัดเก็บข้อมูลส่วนบุคคลของท่าน ดังนี้
            </Text>
            <Text style={styles.modalText}>
            1.วัตถุประสงค์
            </Text>
            <Text style={styles.modalText}>
            1.เพื่อให้บริการระบบค่าตอบแทนและค่าใช้จ่ายผลงานตีพิมพ์
            </Text>
            <Text style={styles.modalText}>
            เพื่อทำการคำนวณค่าตอบแทนและค่าใช้จ่ายผลงานตีพิมพ์ของนักวิจัย
            เพื่อสร้างเอกสารบันทึกข้อความ
            </Text>
            <Text style={styles.modalText}>

            ข้อมูลส่วนบุคคลที่จัดเก็บ
            ชื่อ, นามสกุล, รหัสพนักงาน, ที่อยู่ , อีเมล, เบอร์โทรศัพท์ภายใน, เบอร์โทรศัพท์มือถือ , สำนักวิชา, สาขาวิชา, เลขที่บัญชีธนาคาร, ชื่อบัญชี, ชื่อธนาคาร, ชื่อสาขาธนาคาร, IP Addess
            โดยข้อมูลจะถูกจัดเก็บในระบบฐานข้อมูลที่มีความปลอดภัยตามมาตรการรักษาความมั่นคงปลอดภัยข้อมูลส่วนบุคคลของมหาวิทยาลัยฯ
            </Text>
            <Text style={styles.modalText}>


            ท่านสามารถอ่านนโยบายการคุ้มครองข้อมูลส่วนบุคคลของมหาวิทยาลัยฯ ได้ที่ https://pdpa.sut.ac.th/ และหากมีเหตุเกี่ยวกับข้อมูลส่วนบุคคลของหน่วยงานโปรดติดต่อ
            นางสาวภัทราภรณ์ รัตนา หัวหน้าฝ่ายสารสนเทศและเผยแพร่ผลงานวิจัย สถาบันวิจัยและพัฒนา โทรศัพท์ : 044-224752
            Email : patra_ratta@g.sut.ac.th
          </Text>
        </View>
      </Modal>
      <Text style={styles.title}>สมัครสมาชิก</Text>
      <TextInput
        style={styles.input}
        placeholder="ชื่อภาษาไทย"
        onChangeText={(text) => {
          const thaiRegex = /^[ก-๙\s]*$/;
          if (thaiRegex.test(text)) {
            setThaiName(text);
          }
        }}
        value={thainame}
      />
      <TextInput
        style={styles.input}
        placeholder="ชื่อภาษาอังกฤษ"
        onChangeText={(text) => {
          const engRegex = /^[a-zA-Z\s]*$/;
          if (engRegex.test(text)) {
            setEngName(text);
          }
        }}
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
        onChangeText={(text) => {
          setEmail(text);
          setEmailError(validateEmail(text)); // Validate on every change
        }}
        value={email}
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="รหัสผ่าน (รหัสผ่านต้องประกอบไปด้วยตัวอักษรภาษาอังกฤษและตัวเลขอย่างน้อย 1 ตัว)"
        onChangeText={(text) => {
          setPassword(text);
          setPasswordError(validatePassword(text)); // Validate on every change
        }}
        value={password}
        secureTextEntry
      />
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="ยืนยันรหัสผ่าน"
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
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 30,
    right: 30,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Roboto', // Or another suitable font
    lineHeight: 24, // Adjust line spacing as needed
    textAlign: 'left', // Left-align the text
    color: '#333',
    padding: 20,
  },
});