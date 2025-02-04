import React, { useEffect, useState } from 'react';
import { View, FlatList, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { auth, db } from "../../firebaseconfig";
import { collection, getDocs, orderBy, updateDoc, doc, deleteDoc, query, getDoc, setDoc } from '@firebase/firestore';
import { Button, DataTable } from 'react-native-paper';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import * as ExcelJS from 'exceljs';

export default function UserData({ navigation }) {
  const [users, setUsersList] = useState([]);
  const [enrolledUsers, setEnrolledUsers] = useState([]);

  async function fetchFirestoreData() {
    try {
      const q = query(collection(db, "users"), orderBy("createdDate", "desc"));
      const querySnapshot = await getDocs(q); // Use the query here
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
      alert(`เพิ่ม ${userId} เป็นแอดมินสำเร็จ`)
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
      alert(`ลบผู้ใช้ ${userId} จากการเป็นแอดมินสำเร็จ`)
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
      // Step 1: Fetch enrolled courses for the user
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      console.log(userDocRef);
      console.log(userDoc);
      console.log("user Document: ", userDoc.data());
      const enrolledCourses = userDoc.data()?.enrolledCourses || []; // Ensure correct casing
  
      // Step 2: Delete each user's enrolled user
      const updatePromises = enrolledCourses.map(async (course) => {
        const courseDocRef = doc(db, "courses", course.id);
        const courseDoc = await getDoc(courseDocRef);
        console.log("courseDocRef: ", courseDocRef);
        console.log("courseDoc: ", courseDoc.data());
        
        if (!courseDoc.exists()) {
          alert('ไม่พบการอบรม')
          console.error(`Course document not found for ID: ${course.id}`);
          return; // Skip this user if the document does not exist
        }
  
        const enrolledUsers = courseDoc.data()?.enrolledUsers || [];
        console.log("enrolledUsers: ", enrolledUsers);
        
        // Filter out the user being deleted
        const updatedEnrolledUsers = enrolledUsers.filter(user => user.id !== userId);
        console.log("updatedEnrolledUsers: ", updatedEnrolledUsers);
        
        // Update the user's enrolled users with merge option
        try {
          await setDoc(courseDocRef, { enrolledUsers: updatedEnrolledUsers }, { merge: true });
          console.log(`Successfully updated enrolled users for course ID: ${course.id}`);
        } catch (updateError) {
          console.error(`Failed to update enrolled users for course ID: ${course.id}`, updateError);
        }
      });
  
      console.log("updatePromises: ", updatePromises);
    
      // Wait for all updates to complete
      await Promise.all(updatePromises);
    
      // Step 3: Delete the user itself
      await deleteDoc(userDocRef);
      
      // Update local state
      setUsersList((prevUsers) => prevUsers.filter(user => user.id !== userId));
      console.log("user deleted successfully!");
      alert("ลบผู้ใช้สำเร็จแล้ว!");
    } catch (error) {
      console.error("Failed to delete user: ", error);
      alert("ลบผู้ใช้ล้มเหลว");
    }
  }

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('UserData');

    // Add headers to the worksheet
    worksheet.columns = [
      { header: 'ชื่อสกุลผู้ใช้ภาษาไทย', key: 'thainame', width: 30 },
      { header: 'ชื่อสกุลผู้ใช้ภาษาอังกฤษ', key: 'engname', width: 30 },
      { header: 'ประเภท', key: 'type', width: 15 },
      { header: 'ตำแหน่ง', key: 'rank' },
      { header: 'หน่วยงาน/สังกัด', key: 'institution', width: 30 },
      { header: 'ที่อยู่', key: 'address', width: 30 },
      { header: 'เบอร์โทรติดต่อ', key: 'tel', width: 15 },
      { header: 'อีเมลล์', key: 'email', width: 20 },
    ];

    // Add data to the worksheet
    users.forEach(item => {
      worksheet.addRow({
        thainame: item.thainame,
        engname: item.engname,
        type: item.type,
        rank: item.rank,
        institution: item.institution,
        address: item.address,
        tel: item.tel,
        email: item.email,
      });
    });

    // Generate the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Create a Blob from the buffer
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'UserData.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <View style={{ backgroundColor: '#F8F5E4', flex: 1 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowBackIosIcon />
      </TouchableOpacity>
      <Button onPress={exportToExcel}>Export to Excel</Button>
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
              <DataTable.Title>หน่วยงาน/สังกัด</DataTable.Title>
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
                  <DataTable.Cell>{item.institution}</DataTable.Cell>
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
    height: '80vh', // Ensure it takes full height on web
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