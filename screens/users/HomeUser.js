import { View, SafeAreaView } from 'react-native';
import Banner from '../../components/banner';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import Navbar from '../../components/Navbar';  // นำเข้า component Navbar

export default function App() {
  return (
    <View style={{ backgroundColor: '#F8F5E4', flex: 1 }}>
      
      <Banner/>
      <SafeAreaView>
        {/* เนื้อหาที่ต้องการแสดง */}
      </SafeAreaView>
    </View>
  );
}



