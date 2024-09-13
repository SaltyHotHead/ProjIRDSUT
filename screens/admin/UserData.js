import React, { useEffect, useState } from 'react';
import { View, FlatList, ScrollView,  StyleSheet } from 'react-native';
import { auth, db } from "../../firebaseconfig";
import { collection, getDocs, orderBy } from '@firebase/firestore';
import { DataTable } from 'react-native-paper';

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

  return (
    <ScrollView>
      <View style={styles.container}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>ชื่อผู้ใช้ภาษาไทย</DataTable.Title>
            <DataTable.Title>ชื่อผู้ใช้ภาษาอังกฤษ</DataTable.Title>
            <DataTable.Title>ประเภท</DataTable.Title>
            <DataTable.Title>ที่อยู่</DataTable.Title>
            <DataTable.Title>เบอร์โทรติดต่อ</DataTable.Title>
            <DataTable.Title>อีเมลล์</DataTable.Title>
          </DataTable.Header>
          <FlatList
            data={users}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <DataTable.Row>
                <DataTable.Cell>{item.thainame}</DataTable.Cell>
                <DataTable.Cell>{item.engname}</DataTable.Cell>
                <DataTable.Cell>{item.type}</DataTable.Cell>
                <DataTable.Cell>{item.address}</DataTable.Cell>
                <DataTable.Cell>{item.tel}</DataTable.Cell>
                <DataTable.Cell>{item.email}</DataTable.Cell>
              </DataTable.Row>
            )}
          />
        </DataTable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  }
});