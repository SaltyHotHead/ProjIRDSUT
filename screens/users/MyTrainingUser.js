import React from 'react';
import { View, SafeAreaView, ScrollView } from 'react-native';
import Cosme from '../../components/Cosme';

export default function App() {
  return (
    <View style={{ backgroundColor: '#FFD7D0', flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <div style={{ flexGrow: 1, padding: 1, overflowY: 'auto', height: '100vh', justifyContent: 'center', alignItems: 'center', paddingBottom: '100px', paddingLeft: 320 }}>
          <Cosme />
        </div>
      </SafeAreaView>
    </View>
  );
}