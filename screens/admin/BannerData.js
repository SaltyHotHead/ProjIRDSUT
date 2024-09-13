import React, { useEffect, useState } from "react";
import { View, SafeAreaView, Text, Image, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { getStorage, ref, listAll, getDownloadURL, deleteObject } from '@firebase/storage';
import UploadBanner from './UploadBanner';
import { Button } from "react-native-web";
import { app } from "../../firebaseconfig";


export default function BannerData() {
    const [banners, setBanners] = useState([]);

    async function LoadMultiBanner() {
        try {
            const storage = getStorage(app);
            const storageRef = ref(storage, 'Banners/');

            const res = await listAll(storageRef);
            const bannerData = await Promise.all(res.items.map(async (item) => {
                const url = await getDownloadURL(item);
                const name = item.name;
                return { url, name };
            }));

            setBanners(bannerData);
        } catch (error) {
            console.error("Failed to load banners: ", error);
        }
    }

    const DeleteBanner = async (name) => {
        try {
            const storage = getStorage(app);
            const itemRef = ref(storage, `Banners/${name}`);

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

    return (
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            contentContainerStyle={styles.scrollViewContent}
            style={Platform.OS === 'web' ? styles.webScrollView : {}}
          >
            <View style={styles.container}>
                <UploadBanner />
                {banners.map((banner, index) => (
                    <View key={index} style={styles.bannerContainer}>
                        <Image 
                            source={{ uri: banner.url }} 
                            style={styles.image} 
                        />
                        <Text style={styles.imageName}>{banner.name}</Text>
                        <Button title='ลบ' onPress={() => DeleteBanner(banner.name)} />
                    </View>
                ))}
            </View>
          </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scrollViewContent: {
        padding: 16,
    },
    webScrollView: {
        height: '100vh', // Ensure it takes full height on web
        overflow: 'auto', // Enable scrolling
    },
    container: {
        flex: 1,
        alignItems: 'center',
    },
    bannerContainer: {
        marginBottom: 20,
        alignItems: 'center',
        flexDirection: 'row'
    },
    image: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    imageName: {
        marginTop: 5,
        fontSize: 16,
        textAlign: 'left',
    }
});