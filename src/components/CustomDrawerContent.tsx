import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Text, Divider } from 'react-native-paper';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const CustomDrawerContent = (props: any) => {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
    >
      <View style={styles.profileContainer}>
        <Avatar.Image
          source={{ uri: 'https://i.pravatar.cc/300' }}
          size={80}
          style={styles.avatar}
        />
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>johndoe@example.com</Text>
      </View>

      <Divider style={styles.divider} />
      
      <DrawerItemList {...props} />
      
      <Divider style={styles.divider} />
      
      <DrawerItem
        label="Settings"
        icon={({ color, size }) => (
          <MaterialCommunityIcons name="cog" color={color} size={size} />
        )}
        onPress={() => {
          // Navigate to settings screen
        }}
        activeTintColor={COLORS.primary}
        inactiveTintColor={COLORS.grey6}
      />
      
      <DrawerItem
        label="Logout"
        icon={({ color, size }) => (
          <MaterialCommunityIcons name="logout" color={color} size={size} />
        )}
        onPress={() => {
          // Handle logout
        }}
        activeTintColor={COLORS.primary}
        inactiveTintColor={COLORS.grey6}
      />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileContainer: {
    padding: SIZES.padding,
    alignItems: 'center',
    marginTop: SIZES.base,
  },
  avatar: {
    marginBottom: SIZES.base,
  },
  name: {
    ...FONTS.h4,
    marginBottom: SIZES.base / 2,
  },
  email: {
    ...FONTS.body3,
    color: COLORS.grey5,
  },
  divider: {
    marginVertical: SIZES.base,
  },
});

export default CustomDrawerContent; 