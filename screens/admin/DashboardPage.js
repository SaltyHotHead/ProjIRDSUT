// DashboardPage.js
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, ActivityIndicator, View } from 'react-native';
import PieChartComponent from '../../components/PieChartComponent';
import { db } from '../../firebaseconfig';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';

export default function Dashboard() {
  const [courseData, setCourseData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getCourseCounts() {
    try {
      const onlineQuery = query(collection(db, 'courses'), where('type', '==', 'online'));
      const onsiteQuery = query(collection(db, 'courses'), where('type', '==', 'onsite'));
      const duoTypeQuery = query(collection(db, 'courses'), where('type', '==', 'online&onsite'));

      const onlineCountSnapshot = await getCountFromServer(onlineQuery);
      const onsiteCountSnapshot = await getCountFromServer(onsiteQuery);
      const duoTypeCountSnapshot = await getCountFromServer(duoTypeQuery);

      const onlineCount = onlineCountSnapshot.data().count;
      const onsiteCount = onsiteCountSnapshot.data().count;
      const duoTypeCount = duoTypeCountSnapshot.data().count;

      return [
        { name: 'Online', population: onlineCount, color: 'red', legendFontColor: '#7F7F7F', legendFontSize: 15 },
        { name: 'Onsite', population: onsiteCount, color: 'green', legendFontColor: '#7F7F7F', legendFontSize: 15 },
        { name: 'Online&Onsite', population: duoTypeCount, color: 'blue', legendFontColor: '#7F7F7F', legendFontSize: 15 },
      ];
    } catch (error) {
      console.error("Error fetching course counts: ", error);
      return [];
    }
  }

  async function getUserCounts() {
    try {
      const internalQuery = query(collection(db, 'users'), where('type', '==', 'บุคลากรภายใน'));
      const externalQuery = query(collection(db, 'users'), where('type', '==', 'บุคลากรภายนอก'));

      const internalCountSnapshot = await getCountFromServer(internalQuery);
      const externalCountSnapshot = await getCountFromServer(externalQuery);

      const internalCount = internalCountSnapshot.data().count;
      const externalCount = externalCountSnapshot.data().count;

      return [
        { name: 'บุคลากรภายใน', population: internalCount, color: 'rgba(0, 255, 0, 1)', legendFontColor: '#7F7F7F', legendFontSize: 15 },
        { name: 'บุคลากรภายนอก', population: externalCount, color: '#FF6347', legendFontColor: '#7F7F7F', legendFontSize: 15 },
      ];
    } catch (error) {
      console.error("Error fetching user counts: ", error);
      return [];
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const courses = await getCourseCounts();
      const users = await getUserCounts();
      setCourseData(courses);
      setUserData(users);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.chartContainer}>
          <PieChartComponent data={courseData} title="Course Types" />
        </View>
        <View style={styles.chartContainer}>
          <PieChartComponent data={userData} title="User Types" />
        </View>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  chartContainer: {
    marginBottom: 20, // Add space between charts
    width: '90%', // Adjust width as needed
    alignItems: 'center',
  },
});