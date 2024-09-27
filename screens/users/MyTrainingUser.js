import { View, SafeAreaView, ScrollView } from 'react-native';
import Cosme from '../../components/Cosme';  

export default function App() {
  return (
    <View style={{ backgroundColor: '#BEE0FF', flex: 1 }}>
      <div style={{ flexGrow: 1, padding: 16, overflowY: 'auto', height: '100vh' }}>
      <SafeAreaView>
      
        <Cosme /> {/* Use the component with an uppercase letter */}
        
      </SafeAreaView>
      </div>
    </View>
  );
}