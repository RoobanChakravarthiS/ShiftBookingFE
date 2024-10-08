import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Bottomtab from './components/Bottomtab';
const Stack = createNativeStackNavigator(); 

const App = () => {
  return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="bottomTab" component={Bottomtab} options={{headerShown:false}}/>

        </Stack.Navigator>
      </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({})