import React, { useEffect, useState } from "react";
import { View, SafeAreaView, Text, Button, Image, StyleSheet, ScrollView, Modal, Platform, TouchableOpacity } from 'react-native';
import { getStorage, ref, listAll, getDownloadURL, deleteObject, getMetadata } from '@firebase/storage';
import UploadBanner from './UploadBanner';
import { app } from "../../firebaseconfig";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

export default function BannerData({navigation}) {
    const [banners, setBanners] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    async function LoadMultiBanner() {
        try {
            const storage = getStorage(app);
            const storageRef = ref(storage, 'Banners/');

            const res = await listAll(storageRef);
            const bannerData = await Promise.all(res.items.map(async (item) => {
                const url = await getDownloadURL(item);
                const name = item.name.replace(/\.jpg$/, ''); // Remove .jpg extension
                
                // Get metadata to retrieve the creation date
                const metadata = await getMetadata(item);
                const timeCreated = metadata.timeCreated; // This will be in ISO format

                return { url, name, timeCreated }; // Include timeCreated in the banner object
            }));

            // Sort banners by timeCreated (newest first)
            bannerData.sort((a, b) => new Date(b.timeCreated) - new Date(a.timeCreated));

            setBanners(bannerData);
        } catch (error) {
            console.error("Failed to load banners: ", error);
        }
    }

    const DeleteBanner = async (name) => {
        try {
            const storage = getStorage(app);
            const itemRef = ref(storage, `Banners/${name}.jpg`); // Ensure the correct path and extension

            await deleteObject(itemRef);
            alert("ลบแบนเนอร์สำเร็จ");

            setBanners((prevBanners) => prevBanners.filter(banner => banner.name !== name));
        } catch (error) {
            console.error("Failed to delete banner: ", error);
            alert("ลบแบนเนอร์ล้มเหลว");
        }
    };

    useEffect(() => {
        LoadMultiBanner();
    }, []);

    const openModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedImage(null);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <ArrowBackIosIcon />
            </TouchableOpacity>
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                style={Platform.OS === 'web' ? styles.webScrollView : {}}
            >
                <View style={styles.container}>
                    <View style={styles.uploadContainer}>
                        <UploadBanner />
                    </View>
                    <View style={styles.table}>
                        {banners.map((banner, index) => (
                            <View key={index} style={styles.tableRow}>
                                <TouchableOpacity onPress={() => openModal(banner.url)}>
                                    <Image
                                        source={{ uri: banner.url }}
                                        style={styles.image}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.imageName}>{banner.name}</Text>
                                <Button
                                    title='ลบ'
                                    onPress={() => DeleteBanner(banner.name)}
                                    color="#FF4500" // Red-Orange
                                />
                            </View>
                        ))}
                    </View>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={closeModal}
                    >
                        <View style={styles.modalContainer}>
                            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity>
                            {selectedImage && (
                                <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
                            )}
                        </View>
                    </Modal>
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
    container: {
        flex: 1,
        alignItems: 'flex-start', // Align items to the left
        marginLeft: 200,
        marginRight: 200,
    },
    uploadContainer: {
        alignSelf: 'flex-start', // Align the upload button to the left
        marginTop: 20,
        marginLeft: 10, // Add some space below the button
    },
    uploadButton: {
        backgroundColor: '#3F3F3F',
    },
    table: {
        width: '100%',
        borderRadius: 5,
        overflow: 'hidden',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    image: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        marginRight: 20, // Increase margin to create space between image and name
    },
    imageName: {
        flex: 1,
        fontSize: 16,
        textAlign: 'left',
        marginLeft: 30, // Add margin to create space between image and name
    },
    deleteButton: {
        backgroundColor: '#ff4d4d',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 24,
    },
    fullImage: {
        width: '90%',
        height: '90%',
    },
});