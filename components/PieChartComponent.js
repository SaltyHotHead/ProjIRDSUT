import React from 'react';
import { PieChart } from 'react-native-chart-kit';
import { Text, View } from 'react-native';

const PieChartComponent = ({ data, title }) => {
    return (
        <View>
            <Text style={{ textAlign: 'center', fontSize: 20 }}>{title}</Text>
            <PieChart
                data={data}
                width={500}
                height={220}
                chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                        borderRadius: 16,
                    },
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute // Show absolute values
            />
        </View>
    );
};

export default PieChartComponent;