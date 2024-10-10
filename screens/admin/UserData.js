import React, { useEffect, useState } from 'react';
import { View, FlatList, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { auth, db } from "../../firebaseconfig";
import { collection, getDocs, orderBy, updateDoc, doc, deleteDoc } from '@firebase/firestore';
import { Button, DataTable } from 'react-native-paper';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

export default function UserData({ navigation }) {
  const [users, setUsersList] = useState([]);

  async function fetchFirestoreData() {
    try {
      const querySnapshot = await getDocs(collection(db, "users"), orderBy("createdDate", "asc"));
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      return data;
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }

  useEffect(() => {
    async function fetchData() {
      const data = await fetchFirestoreData();
      setUsersList(data);
    }
    fetchData();
  }, []);

  async function addAdmin(userId) {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { role: "admin" });
      alert('เพิ่มเป็นแอดมินสำเร็จ')
      console.log(`User ${userId} role updated to admin.`);
      const updatedData = await fetchFirestoreData();
      setUsersList(updatedData);
    } catch (error) {
      alert(error)
      console.error("Error updating user role: ", error);
    }
  }

  async function removeAdmin(userId) {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { role: "user" });
      alert('ลบแอดมินสำเร็จ')
      console.log(`Admin ${userId} role updated to user.`);
      const updatedData = await fetchFirestoreData();
      setUsersList(updatedData);
    } catch (error) {
      alert(error)
      console.error("Error updating admin role: ", error);
    }
  }

  async function deleteUser(userId) {
    try {
      const userDocRef = doc(db, "users", userId);
      await deleteDoc(userDocRef);
      alert('ลบผู้ใช้สำเร็จ')
      console.log(`User ${userId} deleted.`);
      const updatedData = await fetchFirestoreData();
      setUsersList(updatedData);
    } catch (error) {
      alert(error)
      console.error("Error deleting user: ", error);
    }
  }

  return (
    <View>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowBackIosIcon />
      </TouchableOpacity>
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        style={Platform.OS === 'web' ? styles.webScrollView : {}}
      >
        <View style={styles.container}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>ชื่อผู้ใช้ภาษาไทย</DataTable.Title>
              <DataTable.Title>ชื่อผู้ใช้ภาษาอังกฤษ</DataTable.Title>
              <DataTable.Title>ประเภท</DataTable.Title>
              <DataTable.Title>ตำแหน่ง</DataTable.Title>
              <DataTable.Title>ที่อยู่</DataTable.Title>
              <DataTable.Title>เบอร์โทรติดต่อ</DataTable.Title>
              <DataTable.Title>อีเมลล์</DataTable.Title>
              <DataTable.Title>Actions</DataTable.Title>
            </DataTable.Header>
            <FlatList
              data={users}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <DataTable.Row>
                  <DataTable.Cell>{item.thainame}</DataTable.Cell>
                  <DataTable.Cell>{item.engname}</DataTable.Cell>
                  <DataTable.Cell>{item.type}</DataTable.Cell>
                  <DataTable.Cell>{item.rank}</DataTable.Cell>
                  <DataTable.Cell>{item.address}</DataTable.Cell>
                  <DataTable.Cell>{item.tel}</DataTable.Cell>
                  <DataTable.Cell>{item.email}</DataTable.Cell>
                  <DataTable.Cell>
                    <View style={styles.actionButtons}>
                      {item.role === 'user' ? (
                        <Button onPress={() => addAdmin(item.id)}>เพิ่มเป็นแอดมิน</Button>
                      ) : (
                        <Button onPress={() => removeAdmin(item.id)}>ลบแอดมิน</Button>
                      )}
                      <Button onPress={() => deleteUser(item.id)}>ลบผู้ใช้</Button>
                    </View>
                  </DataTable.Cell>
                </DataTable.Row>
              )}
            />
          </DataTable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    padding: 16,
  },
  webScrollView: {
    height: '100vh', // Ensure it takes full height on web
    overflow: 'auto', // Enable scrolling
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  itemContainer: {
    marginBottom: 20,
    alignItems: 'center',
    flexDirection: 'row'
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  title: {
    color: '#001BFF'
  },
  actionButtons: {
    flexDirection: 'column', // Stack buttons vertically
    alignItems: 'flex-start', // Align buttons to the start of the column
  },
});