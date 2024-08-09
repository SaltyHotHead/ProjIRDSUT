import {
    View,
    SafeAreaView,
    Button
  } from 'react-native';


export default function App({ navigation }) {

    return (
      <View>
        <SafeAreaView>
          <Button 
          title='ข้อมูลผู้ใช้'
          onPress={() => {
            navigation.navigate('Users');
          }}
          />
          <Button title='แก้ไขแบนเนอร์'
          onPress={() => {
            navigation.navigate('EditBanner');
          }}
          />
          <Button title='การอบรม'
          onPress={() => {
            navigation.navigate('Training');
          }}
          />
        </SafeAreaView>
      </View>
    );
  }
