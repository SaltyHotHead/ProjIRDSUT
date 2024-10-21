import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, StyleSheet, TouchableOpacity, Button, Image, Modal } from 'react-native';
import { db } from "../../firebaseconfig";
import { collection, getDocs, doc, updateDoc } from '@firebase/firestore';
import { Dropdown } from 'react-native-element-dropdown';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import NavbarAdminV2 from '../../components/NavbarAdminV2';

export default function EnrolUser({ route, navigation }) {
  const { courseId } = route.params;
  const [enrolledUsers, setEnrolledUsers] = useState([]);
  const [status, setStatus] = useState([
    { label: 'ลงทะเบียน', value: 'ลงทะเบียน' },
    { label: 'ชำระเงิน', value: 'ชำระเงิน' },
    { label: 'รอการตรวจสอบ', value: 'รอการตรวจสอบ' },
    { label: 'เสร็จสิ้น', value: 'เสร็จสิ้น' },
  ]);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchEnrolledUsers = async () => {
      try {
        if (!courseId) {
          console.error("courseId is undefined");
          return;
        }
        const enrolUserCollectionRef = collection(db, "courses", courseId, "enroluser");
        const querySnapshot = await getDocs(enrolUserCollectionRef);
        const usersData = [];
        querySnapshot.forEach((doc) => {
          usersData.push({ id: doc.id, ...doc.data() });
        });
        setEnrolledUsers(usersData);
      } catch (error) {
        console.error("Error fetching enrolled users: ", error);
      }
    };
    fetchEnrolledUsers();
  }, [courseId]);

  const updateUserStatus = async (userId, newStatus) => {
    try {
      const userDocRef = doc(db, "courses", courseId, "enroluser", userId);
      await updateDoc(userDocRef, { status: newStatus });
      console.log(`User ${userId} status updated to ${newStatus}.`);
    } catch (error) {
      console.error("Error updating user status: ", error);
    }
  };

  const handleStatusChange = (userId, item) => {
    console.log(`Selected Status: ${item.value}, userId: ${userId}`);
    if (item && item.value && userId) {
      setSelectedStatus((prev) => ({ ...prev, [userId]: item.value }));
      updateUserStatus(userId, item.value);
    } else {
      console.error("Invalid status or userId");
    }
  };

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavbarAdminV2 courseId={courseId} />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowBackIosIcon />
      </TouchableOpacity>
      <FlatList
        data={enrolledUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return (
            <View style={styles.itemContainer2}>
              <Text style={styles.userName}>{item.thainame}</Text>
              <TouchableOpacity onPress={() => openModal(item.imageUrl)}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                data={status}
                labelField="label"
                valueField="value"
                placeholder="เลือกสถานะ"
                value={selectedStatus[item.id] || item.status}
                onChange={(selectedItem) => handleStatusChange(item.id, selectedItem)}
              />
              <Button title='ลบผู้ใช้' onPress={() => deleteUser(item.id)} />
            </View>
          );
        }}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
    zIndex: 10,
  },
  itemContainer2: {
    marginBottom: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
    zIndex: 1,
  },
  dropdown: {
    width: 200,
    height: 40,
    justifyContent: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  dropdownContainer: {
    width: 200,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  fullImage: {
    width: '90%',
    height: '90%',
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
});
