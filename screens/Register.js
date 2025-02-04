import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { createUserWithEmailAndPassword } from '@firebase/auth';
import { collection, doc, setDoc, serverTimestamp } from '@firebase/firestore';
import { auth, db } from "../firebaseconfig";
import { ScrollView } from 'react-native-web';

export default function Register({ navigation }) {
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
  const [institution, setInstitution] = useState('');
  const [open, setOpen] = useState(false);
  const [passwordError, setPasswordError] = useState('รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษและตัวเลขอย่างน้อย 1 ตัว');
  const [emailError, setEmailError] = useState(''); // State for email error message
  const [modalVisible, setModalVisible] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : "โปรดกรอกรูปแบบอีเมลล์ให้ถูกต้อง";
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
    }
    if (!/[a-zA-Z]/.test(password)) {
      return "รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษอย่างน้อย 1 ตัว";
    }
    if (!/\d/.test(password)) {
      return "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว";
    }
    return null;
  };

  const UserRegister = async () => {
    if (!thainame || !engname || !address || !tel || !email || !password || !confirmPassword) {
      alert("โปรดกรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (tel.length !== 10) {
      alert("โปรดกรอกเบอร์โทรให้ครบ");
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
      alert('รหัสผ่านไม่ตรงกัน');
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
        await setDoc(userDoc, { thainame, engname, address, institution, tel, email, role: "user", createdDate: serverTimestamp(), type, rank: selectedRank });
        alert('ลงทะเบียนสำเร็จ');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } else {
        throw new Error('User ID not found');
      }
    } catch (error) {
      alert('ลงทะเบียนล้มเหลว: ' + error.message);
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
    if (!agreementAccepted) {
      navigation.navigate('Login'); // Navigate to the Login page only if agreement is not accepted
    }
  };

  useEffect(() => openModal(), []);

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>ข้อกำหนด และเงื่อนไขในการให้บริการ</Text>
            <ScrollView style={styles.scrollView}>
              <Text style={styles.modalText}>
                ขอแจ้งให้ทราบเกี่ยวกับการจัดเก็บข้อมูลส่วนบุคคล ผ่านระบบออนไลน์
                สถาบันวิจัยและพัฒนา มหาวิทยาลัยเทคโนโลยีสุรนารี
              </Text>
              <Text style={styles.modalText}>
                เพื่อปกป้องความเป็นส่วนตัวของข้อมูลเจ้าของข้อมูลส่วนบุคคล ให้สอดคล้องกับ พรบ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ.2562 สถาบันวิจัยและพัฒนา มหาวิทยาลัยเทคโนโลยีสุรนารี ขอเรียนแจ้งแนวทางการจัดเก็บข้อมูลส่วนบุคคลของท่าน ดังนี้
              </Text>
              <Text style={styles.modalText}>
                วัตถุประสงค์
              </Text>
              <Text style={styles.modalText}>
                1.เพื่อให้บริการระบบค่าตอบแทนและค่าใช้จ่ายผลงานตีพิมพ์
              </Text>
              <Text style={styles.modalText}>
                2.เพื่อทำการคำนวณค่าตอบแทนและค่าใช้จ่ายผลงานตีพิมพ์ของนักวิจัย
              </Text>
              <Text style={styles.modalText}>
                3.เพื่อสร้างเอกสารบันทึกข้อความ
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
            </ScrollView>
            <View style={styles.radioGroup}>
                <RadioButton
                  label="ยอมรับเงื่อนไข"
                  value={true}
                  selectedValue={agreementAccepted}
                  onSelect={setAgreementAccepted}
                />
              </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  if (agreementAccepted) {
                    closeModal();
                  } else {
                    alert("กรุณายอมรับเงื่อนไขก่อนดำเนินการต่อ");
                  }
                }}
              >
                <Text style={styles.buttonText}>ตกลง</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()} // Call the function reference, not invoke it
              >
                <Text style={styles.buttonText}>ย้อนกลับ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Text style={styles.title}>สมัครสมาชิก</Text>
      <TextInput
        style={styles.input}
        placeholder="ชื่อสกุลภาษาไทย"
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
        placeholder="ชื่อสกุลภาษาอังกฤษ"
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
        placeholder="หน่วยงาน/สังกัด"
        onChangeText={setInstitution}
        value={institution}
      />
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
        }}
        value={email}
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="รหัสผ่าน"
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
  scrollView: {
    padding: 10
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'left',
    margin: 50, // Add margin to create space around the modal
    borderRadius: 10, // Optional: Add rounded corners
    backgroundColor: 'white', // Set a background color
    padding: 30, // Add padding inside the modal
    maxHeight: '80%', // Limit the height of the modal
    width: '70%', // Set a width for the modal
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    color: '#333',
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  confirmButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});