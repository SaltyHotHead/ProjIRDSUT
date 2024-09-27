import { View, SafeAreaView, ScrollView } from 'react-native';
import Cosme from '../../components/Cosme';  

export default function App() {
  return (
    <View style={{ backgroundColor: '#BEE0FF', flex: 1 }}>
      <ScrollView>
      <SafeAreaView>
      
        <Cosme /> {/* Use the component with an uppercase letter */}
        
      </SafeAreaView>
      </ScrollView>
    </View>
  );
}