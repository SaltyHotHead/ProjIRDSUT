import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { collection, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebaseconfig';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';

const Cosme = ({ onClick }) => {
    const [courses, setCourses] = useState([]);
    const navigation = useNavigation();
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        const fetchCourses = async () => {
            if (!user) {
                console.error("No user is logged in");
                return;
            }

            try {
                const userDocRef = doc(db, 'users', user.uid);
                const cosCollectionRef = collection(userDocRef, 'cos');
                const querySnapshot = await getDocs(cosCollectionRef);
                const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCourses(coursesData);
            } catch (error) {
                console.error("Error fetching courses: ", error);
            }
        };

        fetchCourses();
    }, [user]);

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleDateString();
    };

    return (
        <div onClick={onClick}>
        <View style={styles.container}>
            {courses.map(course => (
                <View key={course.id} style={styles.card}>
                    <Image
                        style={styles.image}
                        source={{ uri: course.imageUrl }}
                        resizeMode="cover"
                    />
                    <View style={styles.content}>
                        <Text style={styles.title}>{course.name}</Text>
                        <Text style={styles.description}>กำหนดการ: {formatDate(course.startdate)}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusText}>สถานะ</Text>
                        <View style={styles.status}>
                            <View style={styles.statusCircleActive} />
                            <View style={styles.statusCircleActive} />
                            <View style={styles.statusCircleActive} />
                            <View style={styles.statusCircleInactive} />
                        </View>
                    </View>
                </View>
            ))}
        </View>
        </div>
    );
};

// Inside the Cosme component
const styles = StyleSheet.create({
    container: {
        width: 1000,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 3,
        padding: 10,
        width: '90%', // Ensure consistent width
        maxWidth: 1000, // Optional: limit max width for larger screens
    },
    image: {
        width: 100,
        height: 100,
    },
    content: {
        flex: 1,
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: '#666',
    },
    statusContainer: {
        alignItems: 'center',
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    status: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    statusCircleActive: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'green',
        marginHorizontal: 5,
    },
    statusCircleInactive: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'lightgray',
        marginHorizontal: 5,
    },
});

export default Cosme;