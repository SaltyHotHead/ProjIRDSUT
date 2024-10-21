import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, ActivityIndicator, View, TouchableOpacity, Platform } from 'react-native';
import PieChartComponent from '../../components/PieChartComponent';
import { db } from '../../firebaseconfig';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

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
            { name: `Online ${onlineCount} คน`, population: onlineCount, color: 'red', legendFontColor: '#7F7F7F', legendFontSize: 15 },
            { name: `Onsite ${onsiteCount} คน`, population: onsiteCount, color: 'green', legendFontColor: '#7F7F7F', legendFontSize: 15 },
            { name: `Online&Onsite ${duoTypeCount} คน`, population: duoTypeCount, color: 'blue', legendFontColor: '#7F7F7F', legendFontSize: 15 },
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
            { name: `บุคลากรภายใน ${internalCount} คน`, population: internalCount, color: 'rgba(0, 255, 0, 1)', legendFontColor: '#7F7F7F', legendFontSize: 15 },
            { name: `บุคลากรภายนอก ${externalCount} คน`, population: externalCount, color: '#FF6347', legendFontColor: '#7F7F7F', legendFontSize: 15 },
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
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowBackIosIcon />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        style={Platform.OS === 'web' ? styles.webScrollView : {}}
      >
        <View style={styles.chartRow}>
          <View style={styles.chartContainer}>
            <PieChartComponent data={courseData} title="ประเภทการอบรมในระบบ" />
          </View>
          <View style={styles.chartContainer}>
            <PieChartComponent data={userData} title="ประเภทผู้ใช้ในระบบ" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5DC', // Light beige background
  },
  backButton: {
    marginBottom: 10,
  },
  scrollViewContent: {
    padding: 16,
  },
  webScrollView: {
    height: '80vh', // Ensure it takes full height on web
    overflow: 'auto', // Enable scrolling
  },
  chartRow: {
    flexDirection: 'row', // Align charts in a row
    justifyContent: 'center', // Center the charts horizontally
    alignItems: 'center', // Center align vertically
    marginBottom: 20, // Add space below the charts
  },
  chartContainer: {
    width: '45%', // Adjust width to fit side by side
    alignItems: 'center',
  },
});