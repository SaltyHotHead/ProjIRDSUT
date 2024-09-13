import { View, SafeAreaView, ScrollView } from 'react-native';
import Cardcourse from '../../components/Cardcourse';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import Banner from '../../components/banner.js'; // ตรวจสอบเส้นทางให้ถูกต้อง

export default function App() {
  return (
    <>

      <View style={{ backgroundColor: '#F8F5E4', flex: 1 }}>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Banner />
          <SafeAreaView>
            
              <Cardcourse />
            
          </SafeAreaView>
        </ScrollView>
      </View>
    </>
  );
}
