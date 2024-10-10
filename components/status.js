import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TrainingStatusPage from './TrainingStatusPage';
import AdminTrainingPage from './AdminTrainingPage';
import CourseDetailPage from './CourseDetailPage';
import PaymentPage from './PaymentPage'; // นำเข้า PaymentPage

const Stack = createStackNavigator();

export default function App() {
  const [trainings, setTrainings] = useState([
    { id: 1, name: 'พัฒนากรอบความคิด', deadline: '04/06/2567', status: 'ลงทะเบียน', imageUrl: 'https://via.placeholder.com/80', description: 'รายละเอียดเกี่ยวกับคอร์สการพัฒนากรอบความคิด' },
    { id: 2, name: 'พัฒนาศักยภาพสมอง', deadline: '14/07/2567', status: 'ชำระเงิน', imageUrl: 'https://via.placeholder.com/80', description: 'รายละเอียดเกี่ยวกับคอร์สการพัฒนาศักยภาพสมอง' }
  ]);

  const [isAdmin, setIsAdmin] = useState(false); 

  const updateTrainingStatus = (id, newStatus) => {
    setTrainings((prevTrainings) =>
      prevTrainings.map(training =>
        training.id === id ? { ...training, status: newStatus } : training
      )
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* หน้าหลัก */}
        <Stack.Screen name="Home" options={{ title: 'Training List' }}>
          {() => (
            <View style={styles.container}>
              {isAdmin 
                ? <AdminTrainingPage trainings={trainings} updateTrainingStatus={updateTrainingStatus} />
                : <TrainingStatusPage trainings={trainings} />
              }
              <Button
                title={isAdmin ? "ไปที่หน้าผู้ใช้" : "ไปที่หน้าแอดมิน"}
                onPress={() => setIsAdmin(!isAdmin)}
              />
            </View>
          )}
        </Stack.Screen>
        
        {/* หน้ารายละเอียดของคอร์ส */}
        <Stack.Screen name="CourseDetail" component={CourseDetailPage} options={{ title: 'Course Details' }} />
        
        {/* หน้าชำระเงิน */}
        <Stack.Screen name="Payment" component={PaymentPage} options={{ title: 'Payment Details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});

AdminTrainingPage.js
import React from 'react';
import { View, Text, Picker, FlatList, StyleSheet } from 'react-native';

const AdminTrainingPage = ({ trainings, updateTrainingStatus }) => {

  const renderRegistrationItem = ({ item }) => (
    <View style={styles.registrationContainer}>
      <Text>{item.name}</Text>
      <Picker
        selectedValue={item.status}
        onValueChange={(value) => updateTrainingStatus(item.id, value)} // อัปเดตสถานะเมื่อมีการเลือกค่าใหม่
      >
        <Picker.Item label="ลงทะเบียน" value="ลงทะเบียน" />
        <Picker.Item label="ชำระเงิน" value="ชำระเงิน" />
        <Picker.Item label="รอการตรวจสอบ" value="รอการตรวจสอบ" />
        <Picker.Item label="เสร็จสิ้น" value="เสร็จสิ้น" />
      </Picker>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={trainings}
        renderItem={renderRegistrationItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
    padding: 10,
  },
  registrationContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
});

export default AdminTrainingPage;


TrainingStatusPage.js
import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // ใช้สำหรับการนำทาง

const TrainingStatusPage = ({ trainings }) => {
  const navigation = useNavigation();

  const getStatusColors = (status) => {
    switch (status) {
      case 'ลงทะเบียน':
        return [true, false, false, false];
      case 'ชำระเงิน':
        return [true, true, false, false];
      case 'รอการตรวจสอบ':
        return [true, true, true, false];
      case 'เสร็จสิ้น':
        return [true, true, true, true];
      default:
        return [false, false, false, false];
    }
  };

  const renderTrainingItem = ({ item }) => {
    const statusColors = getStatusColors(item.status);

    return (
      <TouchableOpacity 
        style={styles.trainingContainer} 
        onPress={() => {
          if (item.status === 'ชำระเงิน') {
            navigation.navigate('Payment', { training: item }); // นำทางไปยังหน้า Payment
          } else {
            navigation.navigate('CourseDetail', { course: item });
          }
        }}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.trainingImage} />
        <View style={styles.trainingInfo}>
          <Text style={styles.trainingName}>{item.name}</Text>
          <Text style={styles.deadline}>กำหนดการ: {item.deadline}</Text>
        </View>
        <View style={styles.statusContainer}>
          {statusColors.map((isActive, index) => (
            <View key={index} style={styles.statusColumn}>
              <View style={[styles.statusDot, isActive ? styles.activeDot : styles.inactiveDot]} />
              <Text style={styles.statusLabel}>
                {['ลงทะเบียน', 'ชำระเงิน', 'รอการตรวจสอบ', 'เสร็จสิ้น'][index]}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={trainings}
        renderItem={renderTrainingItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
    padding: 10,
  },
  trainingContainer: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trainingImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  trainingInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  trainingName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  deadline: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusColumn: {
    alignItems: 'center',
    marginRight: 15,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 2,
  },
  activeDot: {
    backgroundColor: 'green',
  },
  inactiveDot: {
    backgroundColor: 'lightgray',
  },
  statusLabel: {
    fontSize: 12,
    color: '#333',
  },
});

export default TrainingStatusPage;


Payment.js
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Button, Alert, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker'; // นำเข้าฟังก์ชันสำหรับเลือกภาพ

const PaymentPage = ({ route }) => {
  const { training } = route.params; // รับข้อมูลคอร์สที่ถูกส่งมา

  const [slipUri, setSlipUri] = useState('');

  const handleUploadSlip = () => {
    // ฟังก์ชันที่ใช้สำหรับอัปโหลดสลิป (จะต้องทำงานเพิ่มเติมในอนาคต)
    Alert.alert("อัปโหลดสลิป", "อัปโหลดสลิปเรียบร้อยแล้ว!");
  };

  const selectSlip = () => {
    const options = {
      mediaType: 'photo', // เลือกเฉพาะภาพถ่าย
      quality: 1, // คุณภาพสูงสุด
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        // ตั้งค่าที่อยู่ของสลิป
        setSlipUri(response.assets[0].uri);
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: training.imageUrl }} style={styles.bankImage} />
      <Text style={styles.bankName}>ชื่อธนาคาร: ชื่อธนาคาร</Text>
      <Text style={styles.accountNumber}>เลขที่บัญชี: 123-456-7890</Text>
      <Text style={styles.accountName}>ชื่อบัญชี: ชื่อบัญชี</Text>
      <Image source={{ uri: 'https://via.placeholder.com/200' }} style={styles.qrCode} />

      <Text style={styles.label}>อัปโหลดสลิป:</Text>
      <Button title="เลือกสลิป" onPress={selectSlip} /> {/* ปุ่มสำหรับเลือกสลิป */}
      
      {slipUri ? (
        <Image source={{ uri: slipUri }} style={styles.slipImage} /> // แสดงภาพสลิปที่เลือก
      ) : null}

      <Button title="อัปโหลดสลิป" onPress={handleUploadSlip} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // ใช้ flexGrow เพื่อให้ ScrollView สามารถเลื่อนได้
    padding: 20,
    backgroundColor: '#fff',
  },
  bankImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  bankName: {
    fontSize: 18,
    marginBottom: 5,
  },
  accountNumber: {
    fontSize: 16,
    marginBottom: 5,
  },
  accountName: {
    fontSize: 16,
    marginBottom: 15,
  },
  qrCode: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  slipImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 15,
  },
});

export default PaymentPage;
