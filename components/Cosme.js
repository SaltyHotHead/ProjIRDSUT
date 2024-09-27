import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseconfig';
import { useNavigation } from '@react-navigation/native';

const Cosme = () => {

    
    const [courses, setCourses] = useState([]);

    const navigation = useNavigation();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'courses'));
                const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCourses(coursesData);
            } catch (error) {
                console.error("Error fetching courses: ", error);
            }
        };

        fetchCourses();
    }, []);

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleDateString(); // You can customize the format here
      };


    return (
        <View style={styles.container}>
            {courses.map(course => (
                <View key={course.id} style={styles.card}>
                    <Image
                        style={styles.image}
                        source={{ uri: course.imageUrl }}
                        resizeMode="cover"
                    />

                    <Text style={styles.title}>           {course.name}</Text>
                    <Text style={styles.description}>           วันที่อบรม :  {formatDate(course.startdate)}</Text>
                    <Text style={styles.description}>           สถานะการอบรม :  {formatDate(course.startdate)}</Text>

                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        flexWrap: 'wrap',
        backgroundColor: '#BEE0FF',
         width: '100%',
       
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 3,
        // for shadow effect on Android
    },
    image: {
        width: 100,
        height: 100,
    },
    content: {
        flex: 1,
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: '#666',
    },
});

export default Cosme;