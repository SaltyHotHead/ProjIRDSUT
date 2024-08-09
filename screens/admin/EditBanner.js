import { useEffect } from 'react';
import {
    View,
    SafeAreaView
  } from 'react-native';


export default function App() {

  function askPer(){
    const {status} = ImagePicker.requestMediaLibraryPermissionsAsync();
  }

  useEffect(() => {
    askPer();
  }, []);

    return (
      <View>
        <SafeAreaView>

        </SafeAreaView>
      </View>
    );
  }
