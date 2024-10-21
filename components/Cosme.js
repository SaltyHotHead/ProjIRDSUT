import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Button, Modal, TextInput, SafeAreaView } from 'react-native';
import { collection, getDocs, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseconfig';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
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

    const handleCourseClick = (course) => {
        navigation.navigate('cosss', { id: course.id });
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
            if (imageBlob && imageName.trim() !== '') {
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

    const handleEnroll = async () => {
        if (!currentCourseId) {
            console.error('Course data is missing');
            alert('Course data is missing');
            return;
        }

        const colRef = collection(db, 'users', user.uid, 'cos');
        const courseColRef = collection(db, 'courses', currentCourseId, 'enroluser');

        // Call uploadImage to get the image URL
        const imageUrl = await uploadImage(currentCourseId); // Pass the currentCourseId to uploadImage

        try {
            await addDoc(colRef, {
                enrolledAt: new Date().toISOString(),
                imageUrl: imageUrl, // Add the image URL to the document
            });
            await addDoc(courseColRef, {
                enrolledAt: new Date().toISOString(),
                imageUrl: imageUrl, // Add the image URL to the document
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
                            {selectedImage && (
                                <Image
                                    source={{ uri: selectedImage }}
                                    style={styles.imagePreview}
                                />
                            )}
                            <TextInput
                                placeholder="กรอกชื่อรูปภาพ"
                                value={imageName}
                                onChangeText={setImageName}
                                style={styles.textInput}
                            />
                            <Button title="เลือกรูปภาพ" onPress={pickImage} />
                            <Button title="อัปโหลดรูปภาพ" onPress={() => uploadImage(currentCourseId)} />
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
                            <Button title="อัปโหลดสลิปโอนเงิน" onPress={() => openModal(course.id)} color="#F89E6C" />
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
});

export default Cosme;