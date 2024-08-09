import {
    View,
    SafeAreaView
  } from 'react-native';
import Banner from '../../components/banner';


export default function App() {

    return (
      <View>
        <SafeAreaView>
          <Banner />
        </SafeAreaView>
      </View>
    );
  }
