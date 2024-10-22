import React, { useEffect, useState } from "react";
import { View, SafeAreaView, Text, Button, Image, StyleSheet, ScrollView, Modal, Platform, TouchableOpacity } from 'react-native';
import { getStorage, ref, listAll, getDownloadURL, deleteObject, getMetadata } from '@firebase/storage';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import UploadBanner from './UploadBanner';
import { app } from "../../firebaseconfig";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemType = 'BANNER';

const DraggableBanner = ({ banner, index, moveBanner, deleteBanner }) => {
    const [{ isDragging }, ref] = useDrag({
        type: ItemType,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: ItemType,
        hover(item) {
            if (item.index !== index) {
                moveBanner(item.index, index);
                item.index = index; // Update the index for the dragged item
            }
        },
    });

    return (
        <TouchableOpacity
            ref={node => ref(drop(node))}
            style={[styles.tableRow, isDragging && styles.draggingRow]} // Add dragging style
        >
            <Image
                source={{ uri: banner.url }}
                style={styles.image}
            />
            <Text style={styles.imageName}>{banner.name}</Text>
            <Button
                title='ลบ'
                onPress={() => deleteBanner(banner.name)}
                color="#FF4500" // Red-Orange
            />
        </TouchableOpacity>
    );
};

export default function BannerData({ navigation }) {
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
    
            // Load the saved order from Firestore
            const db = getFirestore(app);
            const orderDocRef = doc(db, 'bannerOrders', 'order');
            const orderDoc = await getDoc(orderDocRef);
    
            let orderedBanners = bannerData; // Default to the loaded banners
    
            if (orderDoc.exists()) {
                const savedOrder = orderDoc.data().order || [];
    
                // Sort banners based on saved order
                orderedBanners = savedOrder.map(order => 
                    bannerData.find(banner => banner.name === order.name)
                ).filter(Boolean); // Filter out any undefined values
            }
    
            setBanners(orderedBanners);
        } catch (error) {
            console.error("Failed to load banners: ", error);
        }
    }

    const deleteBanner = async (name) => {
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

    const moveBanner = (fromIndex, toIndex) => {
        const updatedBanners = [...banners];
        const [movedBanner] = updatedBanners.splice(fromIndex, 1);
        updatedBanners.splice(toIndex, 0, movedBanner);
        setBanners(updatedBanners);
        
        // Save the new order to Firebase
        saveBannerOrder(updatedBanners);
    };
    
    const saveBannerOrder = async (updatedBanners) => {
        try {
            const db = getFirestore(app);
            const orderDocRef = doc(db, 'bannerOrders', 'order'); // Create a document reference
    
            // Convert the updated banners to a format suitable for saving
            const orderData = updatedBanners.map(banner => ({
                name: banner.name,
                timeCreated: banner.timeCreated, // Include creation time
                url: banner.url // Include image URL
            }));
    
            // Save the order data
            await setDoc(orderDocRef, { order: orderData });
            console.log("Banner order saved successfully.");
        } catch (error) {
            console.error("Failed to save banner order: ", error);
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

    // Function to refresh banners
    const refreshBanners = () => {
        LoadMultiBanner();
    };

    return (
        <DndProvider backend={HTML5Backend}>
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
                            <UploadBanner onUploadSuccess={refreshBanners} /> {/* Pass refresh function */}
                        </View>
                        <View style={styles.table}>
                            {banners.map((banner, index) => (
                                <DraggableBanner
                                    key={banner.name}
                                    banner={banner}
                                    index={index}
                                    moveBanner={moveBanner}
                                    deleteBanner={deleteBanner}
                                />
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
        </DndProvider>
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
        marginHorizontal: 80,
    },
    uploadContainer: {
        alignSelf: 'flex-start', // Align the upload button to the left
        marginBottom: 20,
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
        backgroundColor: '#fff', // White background for items
        marginVertical: 10, // Space between rows
        borderRadius: 5, // Rounded corners
        elevation: 2, // Shadow effect for Android
        shadowColor: '#000', // Shadow effect for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
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
        marginLeft: 10, // Adjust margin for better spacing
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
    draggingRow: {
        backgroundColor: '#e0e0e0', // Light gray background when dragging
        borderColor: '#ccc', // Optional: Add a border
        borderWidth: 1,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Optional: Add shadow effect
    },
});