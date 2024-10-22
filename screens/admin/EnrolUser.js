import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, StyleSheet, TouchableOpacity, Button, Image, Modal } from 'react-native';
import { db } from "../../firebaseconfig";
import { doc, getDoc, updateDoc } from '@firebase/firestore';
import { Dropdown } from 'react-native-element-dropdown';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import NavbarAdminV2 from '../../components/NavbarAdminV2';

export default function EnrolUser({ route, navigation }) {
  const { courseId } = route.params;
  const [enrolledUsers, setEnrolledUsers] = useState([]);
  const [status, setStatus] = useState([
    { label: 'รอการชำระเงิน', value: 'รอการชำระเงิน' },
    { label: 'รอการตรวจสอบ', value: 'รอการตรวจสอบ' },
    { label: 'เสร็จสิ้น', value: 'เสร็จสิ้น' },
  ]);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch enrolled users from the courses document
  const fetchEnrolledUsers = async () => {
    try {
      if (!courseId) {
        alert("Course ID is undefined");
        return;
      }
      const courseDocRef = doc(db, "courses", courseId);
      const courseSnapshot = await getDoc(courseDocRef);
      if (courseSnapshot.exists()) {
        const courseData = courseSnapshot.data();
        setEnrolledUsers(courseData.enrolledUsers || []);
      } else {
        alert("No such course document!");
      }
    } catch (error) {
      alert("Error fetching enrolled users: " + error.message);
    }
  };

  useEffect(() => {
    fetchEnrolledUsers();
  }, [courseId]);

  const updateUserStatus = async (userId, newStatus) => {
    try {
      const courseDocRef = doc(db, "courses", courseId);
      const courseSnapshot = await getDoc(courseDocRef);
      if (courseSnapshot.exists()) {
        const courseData = courseSnapshot.data();
        if (Array.isArray(courseData.enrolledUsers)) {
          const updatedUsers = courseData.enrolledUsers.map(user => {
            if (user.id === userId) {
              return { ...user, status: newStatus };
            }
            return user;
          });
          await updateDoc(courseDocRef, { enrolledUsers: updatedUsers });
          console.log(`User ${userId} status updated to ${newStatus}.`);
  
          const userDocRef = doc(db, "users", userId);
          const userSnapshot = await getDoc(userDocRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            console.log("UserData:", userData);  // Log user data for debugging
            if (Array.isArray(userData.enrolledCourses)) {
              const updatedCourses = userData.enrolledCourses.map(course => {
                if (course && course.id === courseId) {
                  return { ...course, status: newStatus };
                }
                return course;
              });
              await updateDoc(userDocRef, { enrolledCourses: updatedCourses });
              console.log(`User ${userId} status updated to ${newStatus}.`);
              setEnrolledUsers(updatedUsers);
            } else {
              console.error("userData.enrolledUsers is not an array or is undefined");
              alert("Error: User enrolled courses data is not available.");
            }
          } else {
            console.error("User document does not exist.");
            alert("Error: User document does not exist.");
          }
        } else {
          console.error("courseData.enrolledUsers is not an array or is undefined");
          alert("Error: Enrolled users data is not available.");
        }
      } else {
        console.error("Course document does not exist.");
        alert("Error: Course document does not exist.");
      }
    } catch (error) {
      alert("Error updating user status: " + error.message);
    }
  };
  
  

  const handleStatusChange = (userId, item) => {
    if (item && item.value && userId) {
      setSelectedStatus((prev) => ({ ...prev, [userId]: item.value }));
      updateUserStatus(userId, item.value);
    } else {
      alert("Invalid status or userId");
    }
  };

  const deleteUser = async (userId) => {
    try {
      const courseDocRef = doc(db, "courses", courseId);
      const courseSnapshot = await getDoc(courseDocRef);
      if (courseSnapshot.exists()) {
        const courseData = courseSnapshot.data();
        const updatedUsers = courseData.enrolledUsers.filter(user => user.id !== userId);

        await updateDoc(courseDocRef, { enrolledUsers: updatedUsers });
        alert('User deleted successfully');
        setEnrolledUsers(updatedUsers);
      }
    } catch (error) {
      alert("Error deleting user: " + error.message);
    }
  };

  const openModal = (receipt) => {
    setSelectedImage(receipt);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavbarAdminV2 courseId={courseId} />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowBackIosIcon />
      </TouchableOpacity>
      <FlatList
        data={enrolledUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.userName}>{item.thainame}</Text>
            <TouchableOpacity onPress={() => openModal(item.receipt)}>
              <Image
                source={{ uri: item.receipt }}
                style={styles.image}
                resizeMode="cover"
                onError={(error) => console.error("Image loading error:", error.nativeEvent.error)}
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
            <Button title='ลบผู้ใช้' onPress={() => deleteUser(item.id)} color={"red"} />
          </View>
        )}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  backButton: {
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 10,
    marginLeft: 150,
    marginRight: 150,
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
    marginRight: 10,
  },
  dropdown: {
    width: 200,
    height: 40,
    justifyContent: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginHorizontal: 30,
  },
  dropdownContainer: {
    width: 200,
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
    top: 40,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
  },
});