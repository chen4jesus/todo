import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Menu } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { useTask } from '../hooks/useTask';

type CreateCategoryNavigationProp = StackNavigationProp<RootStackParamList>;

const colorOptions = [
  { name: 'Blue', value: COLORS.primary },
  { name: 'Green', value: COLORS.secondary },
  { name: 'Pink', value: COLORS.tertiary },
  { name: 'Orange', value: COLORS.accent },
  { name: 'Red', value: COLORS.error },
  { name: 'Purple', value: '#9c88ff' },
  { name: 'Teal', value: '#00cec9' },
  { name: 'Yellow', value: '#ffeaa7' },
];

const iconOptions = [
  'home', 'briefcase', 'school', 'food', 'shopping', 'cart', 'gift', 
  'heart', 'run', 'dumbbell', 'airplane', 'car', 'bus', 'train', 
  'bank', 'cash', 'credit-card', 'book', 'music', 'movie', 'gamepad', 
  'baby', 'dog', 'cat', 'beach', 'phone', 'email', 'calendar', 'clock',
];

const CreateCategoryScreen = () => {
  const navigation = useNavigation<CreateCategoryNavigationProp>();
  const { addCategory } = useTask();

  const [name, setName] = useState('');
  const [color, setColor] = useState(colorOptions[0].value);
  const [icon, setIcon] = useState('tag');
  
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showIconMenu, setShowIconMenu] = useState(false);

  const handleSaveCategory = async () => {
    if (!name.trim()) {
      // Show error for empty name
      return;
    }

    try {
      const newCategory = {
        name,
        color,
        icon,
      };

      await addCategory(newCategory);
      navigation.goBack();
    } catch (error) {
      console.error('Error creating category:', error);
      // Show error message
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <TextInput
          label="Category Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
          outlineColor={COLORS.grey3}
          activeOutlineColor={COLORS.primary}
        />

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Category Color</Text>
          
          <View style={styles.colorContainer}>
            <View style={[styles.colorPreview, { backgroundColor: color }]} />
            
            <Menu
              visible={showColorMenu}
              onDismiss={() => setShowColorMenu(false)}
              anchor={
                <TouchableOpacity
                  style={styles.colorSelector}
                  onPress={() => setShowColorMenu(true)}
                >
                  <Text style={styles.colorSelectorText}>
                    {colorOptions.find(c => c.value === color)?.name || 'Select Color'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={24} color={COLORS.grey6} />
                </TouchableOpacity>
              }
            >
              {colorOptions.map(colorOption => (
                <Menu.Item
                  key={colorOption.name}
                  onPress={() => {
                    setColor(colorOption.value);
                    setShowColorMenu(false);
                  }}
                  title={colorOption.name}
                  style={{ backgroundColor: colorOption.value }}
                  titleStyle={{ color: COLORS.white }}
                  leadingIcon={() => (
                    <MaterialCommunityIcons
                      name={color === colorOption.value ? 'check' : 'palette'}
                      size={24}
                      color={COLORS.white}
                    />
                  )}
                />
              ))}
            </Menu>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Category Icon</Text>
          
          <View style={styles.iconContainer}>
            <View style={[styles.iconPreview, { backgroundColor: color }]}>
              <MaterialCommunityIcons name={icon} size={32} color={COLORS.white} />
            </View>
            
            <Menu
              visible={showIconMenu}
              onDismiss={() => setShowIconMenu(false)}
              anchor={
                <TouchableOpacity
                  style={styles.iconSelector}
                  onPress={() => setShowIconMenu(true)}
                >
                  <Text style={styles.iconSelectorText}>
                    Change Icon
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={24} color={COLORS.grey6} />
                </TouchableOpacity>
              }
            >
              <View style={styles.iconGrid}>
                {iconOptions.map(iconName => (
                  <TouchableOpacity
                    key={iconName}
                    style={[
                      styles.iconOption,
                      icon === iconName && { backgroundColor: color }
                    ]}
                    onPress={() => {
                      setIcon(iconName);
                      setShowIconMenu(false);
                    }}
                  >
                    <MaterialCommunityIcons
                      name={iconName}
                      size={28}
                      color={icon === iconName ? COLORS.white : COLORS.grey6}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </Menu>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleSaveCategory}
          style={[styles.saveButton, { backgroundColor: color }]}
          labelStyle={styles.saveButtonLabel}
        >
          Save Category
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grey0,
  },
  formContainer: {
    padding: SIZES.padding,
  },
  input: {
    backgroundColor: COLORS.white,
    marginBottom: SIZES.base * 2,
  },
  sectionContainer: {
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.grey8,
    marginBottom: SIZES.base,
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.small,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SIZES.base,
  },
  colorSelector: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorSelectorText: {
    ...FONTS.body2,
    color: COLORS.grey8,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.small,
  },
  iconPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.base,
  },
  iconSelector: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconSelectorText: {
    ...FONTS.body2,
    color: COLORS.grey8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    padding: SIZES.base,
  },
  iconOption: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderRadius: 24,
  },
  saveButton: {
    marginTop: SIZES.padding,
    marginBottom: SIZES.padding * 2,
    borderRadius: SIZES.radius,
    paddingVertical: 6,
  },
  saveButtonLabel: {
    ...FONTS.button,
    color: COLORS.white,
  },
});

export default CreateCategoryScreen; 