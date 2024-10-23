import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Button, Modal, TextInput, SafeAreaView } from 'react-native';
import { collection, getDocs, doc, addDoc, updateDoc, setDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebaseconfig';
import { useNavigation } from '@react-navigation/native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseconfig';

const Cosme = () => {
    const [courses, setCourses] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [imageName, setImageName] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageBlob, setImageBlob] = useState(null);
    const [currentCourseId, setCurrentCourseId] = useState(null);
    const navigation = useNavigation();
    const auth = getAuth();
    const [user, setUser] = useState({});
    const [userData, setUserData] = useState({});

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

        const fetchUserData = async (uid) => {
            try {
                const userDocRef = doc(db, "users", uid);
                const userSnapshot = await getDoc(userDocRef);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    console.log("User data fetched:", userData);
                    setUserData(userData);

                    // Fetch enrolled courses
                    const enrolledCourses = userData.enrolledCourses || [];
                    const coursePromises = enrolledCourses.map(async (course) => {
                        const courseDocRef = doc(db, "courses", course.id);
                        const courseSnapshot = await getDoc(courseDocRef);
                        if (courseSnapshot.exists()) {
                            const courseData = courseSnapshot.data();
                            // Access the status from the enrolledCourses array
                            const status = course.status || 'Unknown'; // Default to 'Unknown' if status is not found
                            return { id: course.id, ...courseData, status }; // Include the status
                        }
                        return null;
                    });

                    const coursesData = await Promise.all(coursePromises);
                    setCourses(coursesData.filter(course => course !== null)); // Filter out null values
                } else {
                    console.error("No such document!");
                    alert("User not found.");
                }
            } catch (error) {
                console.error("Error fetching user data: ", error);
                alert("Failed to fetch user data.");
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (cur) => {
            setUser(cur);
            if (!cur) {
                // If the user is not logged in, navigate to the Login screen
                navigation.navigate('Login');
            } else {
                fetchCourses(cur.uid); // Fetch courses for the logged-in user
                fetchUserData(cur.uid); // Fetch user data
            }
        });

        return () => {
            unsubscribe();
        };
    }, [auth]);

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate(); // Assuming timestamp is a Firestore Timestamp
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleCourseClick = (course) => {
        navigation.navigate('cosss', { courseId: course.id });
    };

    async function pickImage() {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
                let response = await fetch(result.assets[0].uri);
                let blob = await response.blob();
                setImageBlob(blob);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            alert(error.message);
        }
    }

    async function uploadImage(documentId) {
        try {
            if (imageBlob !== '') {
                const storageRef = ref(storage, `UserReceipt/${documentId}.jpg`);

                try {
                    await uploadBytes(storageRef, imageBlob);
                    const downloadURL = await getDownloadURL(storageRef); // Get the download URL
                    alert('อัปโหลดสำเร็จ');
                    setModalVisible(false);
                    setSelectedImage(null);
                    setImageBlob(null);
                    setCurrentCourseId(null); // Reset the current course ID
                    return downloadURL; // Return the download URL
                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert('Error uploading image: ' + error.message);
                }
            } else {
                alert('Please select an image and enter a file name.');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert(error.message);
        }
        return null; // Return null if upload fails
    }

    const openModal = (courseId) => {
        setCurrentCourseId(courseId);
        setModalVisible(true);
    };

    const updateReceipt = async () => {
        if (!currentCourseId) {
            console.error('Course data is missing');
            alert('Course data is missing');
            return;
        }

        const userCourseRef = doc(db, 'users', user.uid);
        const courseColRef = doc(db, 'courses', currentCourseId);
        const imageUrl = await uploadImage(userData.thainame + '_' + courses.find(course => course.id === currentCourseId)?.name);

        console.log(userCourseRef);
        console.log(courseColRef);

        if (!imageUrl) {
            console.error('Image upload failed, cannot proceed with enrollment');
            alert('Image upload failed, please try again.');
            return;
        }

        try {
            // Fetch the current enrolledCourses array
            const userSnapshot = await getDoc(userCourseRef);
            const userData = userSnapshot.data();
            const enrolledCourses = userData.enrolledCourses || [];

            // Modify the existing entries to include the new receipt field
            const updatedCourses = enrolledCourses.map(course => {
                if (course.id === currentCourseId) {
                    return {
                        ...course,
                        receipt: imageUrl,
                        status: "รอการตรวจสอบ",
                        paidAt: new Date().toISOString(),
                    };
                }
                return course;
            });

            // Update user course document with the modified array
            await updateDoc(userCourseRef, {
                enrolledCourses: updatedCourses
            });

            // Fetch the current enrolledUsers array
            const courseSnapshot = await getDoc(courseColRef);
            const courseData = courseSnapshot.data();
            const enrolledUsers = courseData.enrolledUsers || [];

            console.log("courseSnapshot: ", courseSnapshot);
            console.log("courseData: ", courseData);
            console.log("enrolledUsers: ", enrolledUsers);

            // Modify the existing entries to include the new receipt field
            const updatedUsers = enrolledUsers.map(user => {
                console.log("user.uid: ", user.uid);
                console.log("user.id: ", user.id);
                if (user.id !== null) {
                    return {
                        ...user,
                        receipt: imageUrl,
                        status: "รอการตรวจสอบ",
                        paidAt: new Date().toISOString(),
                    };
                }
                return user;
            });

            console.log("updatedUsers: ", updatedUsers);

            // Update user course document with the modified array
            await updateDoc(courseColRef, {
                enrolledUsers: updatedUsers
            });

            alert('Enrolled successfully!');
        } catch (error) {
            console.error('Error enrolling in course: ', error);
            alert('Failed to enroll. Please try again.');
        }
    };

    return (
        <SafeAreaView>
            <View style={styles.container}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalView}>
                            <View style={styles.row}>
                                <View style={styles.imageBox}>
                                    <Image source={require('./scb.jpg')} style={styles.bankImage} />
                                </View>
                                <View style={styles.imageBox}>
                                    <Image source={require('./ktb.jpg')} style={styles.bankImage} />
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={styles.textBox}>
                                    <Text style={styles.bankName}>ชื่อธนาคาร: ไทยพานิชย์</Text>
                                    <Text style={styles.accountNumber}>เลขที่บัญชี: 123-456-7890</Text>
                                    <Text style={styles.accountName}>ชื่อบัญชี: ชื่อบัญชี</Text>
                                </View>
                                <View style={styles.textBox}>
                                    <Text style={styles.bankName}>ชื่อธนาคาร: กรุงไทย</Text>
                                    <Text style={styles.accountNumber}>เลขที่บัญชี: 123-456-7890</Text>
                                    <Text style={styles.accountName}>ชื่อบัญชี: ชื่อบัญชี</Text>
                                </View>
                            </View>

                            {selectedImage && (
                                <Image
                                    source={{ uri: selectedImage }}
                                    style={styles.imagePreview}
                                />
                            )}

                            <Button title="เลือกรูปภาพ" onPress={pickImage} />
                            <Button title="อัปโหลดรูปภาพ" onPress={() => updateReceipt(currentCourseId)} />
                            <TouchableOpacity onPress={() => {
                                setModalVisible(false);
                                setSelectedImage(null);
                                setImageName('');
                            }}>
                                <Text style={styles.closeButton}>ปิด</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {courses.map(course => (
                    <TouchableOpacity key={course.id} onPress={() => handleCourseClick(course)}>
                        <View style={styles.card}>
                            <Image
                                style={styles.image}
                                source={{ uri: course.imageUrl }}
                                resizeMode="cover"
                            />
                            <View style={styles.content}>
                                <Text style={styles.title}>{course.name}</Text>
                                <Text style={styles.description}>กำหนดการ: {formatDate(course.startdate)}</Text>
                            </View>
                            {course.status === "รอการชำระเงิน" && (
                                <Button title="อัปโหลดสลิปโอนเงิน" onPress={() => openModal(course.id)} color="#F89E6C" />
                            )}
                            <View style={styles.statusContainer}>
                                <Text style={styles.statusText}>สถานะ: {course.status}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        width: '100%',
    },
    image: {
        width: 100,
        height: 100,
        marginRight: 50,
    },
    content: {
        flex: 1,
        flexDirection: 'column',
        paddingHorizontal: 10,
        marginRight: 200,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    description: {
        fontSize: 14,
        color: '#666',
    },
    statusContainer: {
        alignItems: 'center',
        paddingHorizontal: 50,
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    imagePreview: {
        width: 100,
        height: 100,
        marginBottom: 10,
    },
    textInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        width: '100%',
        paddingHorizontal: 10,
    },
    closeButton: {
        color: 'blue',
        marginTop: 10,
    },
    bankImage: {
        width: 400,
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
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    imageBox: {
        marginHorizontal: 40
    },
    textBox: {
        marginHorizontal: 160,
        justifyContent: 'center',
        alignItems: 'center'
    },
});

export default Cosme;