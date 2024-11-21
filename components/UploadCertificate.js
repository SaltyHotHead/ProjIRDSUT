import React, { useState, useEffect } from 'react'
import { View, SafeAreaView, Button, TextInput, StyleSheet, TouchableOpacity, Text, Image, Platform, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL, deleteObject } from '@firebase/storage';
import { doc, getDoc, updateDoc } from '@firebase/firestore';
import { auth, db, storage } from "../firebaseconfig";

export default function UploadCertificate({courseId}) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageBlob, setImageBlob] = useState(null);
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [hasCertificate, setHasCertificate] = useState(false);

    async function checkExistingCertificate() {
        try {
            const courseRef = doc(db, 'courses', courseId);
            const courseSnap = await getDoc(courseRef);
            
            if (courseSnap.exists()) {
                const courseData = courseSnap.data();
                setHasCertificate(!!courseData.certificateUrl);
                if (courseData.certificateUrl) {
                    setSelectedImage(courseData.certificateUrl);
                }
            }
        } catch (error) {
            console.error('Error checking certificate:', error);
        }
    }

    useEffect(() => {
        askPer();
        checkExistingCertificate();
    }, []);

    async function askPer() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('ยังไม่ได้รับการอนุญาตจากผู้ใช้');
        }
    }

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

    async function uploadCert() {
        try {
            if (imageBlob) {
                const coursesDocRef = doc(db, 'courses', courseId);
                const storageRef = ref(storage, `certificates/${courseId}.jpg`);

                try {
                    await uploadBytes(storageRef, imageBlob);
                    const imageUrl = await getDownloadURL(storageRef);

                    await updateDoc(coursesDocRef, {
                        certificateUrl: imageUrl,
                    });

                    setHasCertificate(true);
                    alert('อัปโหลดใบประกาศสำเร็จ');
                    setIsInputVisible(false); // Hide the upload section after successful upload
                } catch (error) {
                    console.error('Error uploading image or saving data:', error.code, error.message);
                    alert('Error: ' + error.message);
                }
            } else {
                alert('โปรดเลือกรูปภาพ');
            }
        } catch (error) {
            console.error('Error uploading certificate:', error.code, error.message);
            alert(error.message);
        }
    }

    async function deleteCertificate() {
        try {
            // Show confirmation alert
            const confirmDelete = window.confirm('คุณแน่ใจหรือไม่ที่จะลบใบประกาศนี้?');
            if (!confirmDelete) return;

            const coursesDocRef = doc(db, 'courses', courseId);
            const storageRef = ref(storage, `certificates/${courseId}.jpg`);

            // Delete from Storage
            try {
                await deleteObject(storageRef);
            } catch (error) {
                console.error('Error deleting from storage:', error);
                // Continue with Firestore update even if storage deletion fails
            }

            // Update Firestore document
            await updateDoc(coursesDocRef, {
                certificateUrl: null,
            });

            // Reset states
            setHasCertificate(false);
            setSelectedImage(null);
            setImageBlob(null);
            setIsInputVisible(false);
            alert('ลบใบประกาศสำเร็จ');
        } catch (error) {
            console.error('Error deleting certificate:', error);
            alert('เกิดข้อผิดพลาดในการลบใบประกาศ: ' + error.message);
        }
    }

    return (
        <View>
            <View style={styles.buttonContainer}>
                <Button 
                    title={hasCertificate ? "แก้ไขใบประกาศ" : "อัปโหลดใบประกาศ"}
                    onPress={() => setIsInputVisible(!isInputVisible)}
                />
                {hasCertificate && (
                    <Button
                        title="ลบใบประกาศ"
                        onPress={deleteCertificate}
                        color="red"
                    />
                )}
            </View>
            
            {isInputVisible && (
                <View>
                    {selectedImage && (
                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.imagePreview}
                        />
                    )}
                    <Button title="เลือกรูปภาพ" onPress={pickImage} />
                    <Button title={hasCertificate ? "อัปเดต" : "อัปโหลด"} onPress={uploadCert} />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    imagePreview: {
        width: '100%',
        height: 500,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        gap: 10,
    },
})