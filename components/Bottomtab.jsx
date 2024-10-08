import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AvailableShifts from './AvailableShifts';
import MyShifts from './MyShifts';

const Tab = createBottomTabNavigator();

const Bottomtab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarLabel: ({ focused }) => {
          let label;
          if (route.name === 'MyShifts') {
            label = 'My Shifts';
          } else if (route.name === 'AvailableShifts') {
            label = 'Available Shifts';
          }
          return (
            <Text style={{ color: focused ? '#004fb4' : '#a4b8d3', textAlign: 'center' }}>{label}</Text>
          );
        },
        tabBarIcon: () => null,  
        tabBarStyle: styles.tabBar,  
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown:false  
      })}
    >
      <Tab.Screen name="MyShifts" component={MyShifts} />
      <Tab.Screen name="AvailableShifts" component={AvailableShifts} />
    </Tab.Navigator>
  );
};

export default Bottomtab;

const styles = StyleSheet.create({
  tabBar: {
    height: '8%',
    backgroundColor: '#f1f4f8',
    borderTopWidth: 1,
    borderTopColor: '#a4b8d3',
    justifyContent: 'center', 
    alignItems: 'center',     
    paddingBottom: '5%',
  },
  tabBarLabel: {
    fontSize: 14,   
    textAlign: 'center',
    alignSelf:'center',
    
  },
});
