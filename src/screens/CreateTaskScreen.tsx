import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, TextInput, Button, Chip, Menu, Switch, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { useTask } from '../hooks/useTask';

type CreateTaskNavigationProp = StackNavigationProp<RootStackParamList>;

const priorityOptions = [
  { value: 'low', label: 'Low', icon: 'flag-outline', color: COLORS.grey4 },
  { value: 'medium', label: 'Medium', icon: 'flag-variant', color: COLORS.warning },
  { value: 'high', label: 'High', icon: 'flag', color: COLORS.error },
];

const CreateTaskScreen = () => {
  const navigation = useNavigation<CreateTaskNavigationProp>();
  const { addTask, categories } = useTask();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [reminderTime, setReminderTime] = useState<Date | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | null>(null);
  const [repeat, setRepeat] = useState<{
    type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | null;
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
  }>({ type: null, interval: 1 });
  const [notes, setNotes] = useState('');
  const [symbol, setSymbol] = useState<string | null>(null);
  
  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showRepeatMenu, setShowRepeatMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showSymbolMenu, setShowSymbolMenu] = useState(false);
  const [dateType, setDateType] = useState<'dueDate' | 'reminderTime' | 'repeatEndDate'>('dueDate');
  
  const handleSaveTask = async () => {
    if (!title.trim()) {
      // Show error for empty title
      return;
    }

    try {
      const newTask = {
        title,
        description,
        completed: false,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        reminderTime: reminderTime ? new Date(reminderTime) : undefined,
        category: categoryId || undefined,
        priority: priority || undefined,
        notes: notes || undefined,
        symbol: symbol || undefined,
        repeat: repeat.type 
          ? {
              type: repeat.type,
              interval: repeat.interval,
              endDate: repeat.endDate,
              daysOfWeek: repeat.daysOfWeek,
            }
          : undefined,
      };

      await addTask(newTask);
      navigation.goBack();
    } catch (error) {
      console.error('Error creating task:', error);
      // Show error message
    }
  };

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || (dateType === 'dueDate' ? dueDate : dateType === 'reminderTime' ? reminderTime : repeat.endDate);
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
    
    if (currentDate) {
      if (dateType === 'dueDate') {
        setDueDate(currentDate);
      } else if (dateType === 'reminderTime') {
        setReminderTime(currentDate);
      } else if (dateType === 'repeatEndDate') {
        setRepeat({ ...repeat, endDate: currentDate });
      }
    }
  };

  const showDatePickerModal = (type: 'dueDate' | 'reminderTime' | 'repeatEndDate') => {
    setDateType(type);
    if (type === 'reminderTime') {
      setShowTimePicker(true);
    } else {
      setShowDatePicker(true);
    }
  };

  const renderCategoryChip = () => {
    if (!categoryId) return null;
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) return null;
    
    return (
      <Chip
        style={[styles.chip, { backgroundColor: category.color }]}
        textStyle={{ color: COLORS.white }}
        onClose={() => setCategoryId(null)}
      >
        {category.name}
      </Chip>
    );
  };

  const renderPriorityChip = () => {
    if (!priority) return null;
    
    const priorityOption = priorityOptions.find(p => p.value === priority);
    if (!priorityOption) return null;
    
    return (
      <Chip
        style={[styles.chip, { backgroundColor: priorityOption.color }]}
        textStyle={{ color: COLORS.white }}
        onClose={() => setPriority(null)}
      >
        {priorityOption.label} Priority
      </Chip>
    );
  };

  const renderRepeatChip = () => {
    if (!repeat.type) return null;
    
    let repeatText = '';
    switch (repeat.type) {
      case 'daily':
        repeatText = `Every day`;
        break;
      case 'weekly':
        repeatText = `Every week`;
        break;
      case 'monthly':
        repeatText = `Every month`;
        break;
      case 'yearly':
        repeatText = `Every year`;
        break;
      case 'custom':
        repeatText = `Custom`;
        break;
    }
    
    if (repeat.interval > 1) {
      switch (repeat.type) {
        case 'daily':
          repeatText = `Every ${repeat.interval} days`;
          break;
        case 'weekly':
          repeatText = `Every ${repeat.interval} weeks`;
          break;
        case 'monthly':
          repeatText = `Every ${repeat.interval} months`;
          break;
        case 'yearly':
          repeatText = `Every ${repeat.interval} years`;
          break;
      }
    }
    
    return (
      <Chip
        style={styles.chip}
        onClose={() => setRepeat({ type: null, interval: 1 })}
      >
        {repeatText}
      </Chip>
    );
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.formContainer}>
        <TextInput
          label="Task Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          mode="outlined"
          outlineColor={COLORS.grey3}
          activeOutlineColor={COLORS.primary}
        />

        <TextInput
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          mode="outlined"
          outlineColor={COLORS.grey3}
          activeOutlineColor={COLORS.primary}
          multiline
          numberOfLines={3}
        />

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Due Date & Time</Text>
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => showDatePickerModal('dueDate')}
            >
              <MaterialCommunityIcons name="calendar" size={24} color={COLORS.primary} />
              <Text style={styles.optionText}>
                {dueDate ? format(dueDate, 'MMM d, yyyy') : 'Add due date'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => showDatePickerModal('reminderTime')}
            >
              <MaterialCommunityIcons name="clock-outline" size={24} color={COLORS.primary} />
              <Text style={styles.optionText}>
                {reminderTime ? format(reminderTime, 'h:mm a') : 'Add time'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Category & Priority</Text>
          
          <View style={styles.chipsContainer}>
            {renderCategoryChip()}
            {renderPriorityChip()}
          </View>
          
          <View style={styles.optionsContainer}>
            <Menu
              visible={showCategoryMenu}
              onDismiss={() => setShowCategoryMenu(false)}
              anchor={
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => setShowCategoryMenu(true)}
                >
                  <MaterialCommunityIcons name="tag-outline" size={24} color={COLORS.primary} />
                  <Text style={styles.optionText}>
                    {categoryId ? 'Change category' : 'Add category'}
                  </Text>
                </TouchableOpacity>
              }
            >
              {categories.map(category => (
                <Menu.Item
                  key={category.id}
                  onPress={() => {
                    setCategoryId(category.id);
                    setShowCategoryMenu(false);
                  }}
                  title={category.name}
                  leadingIcon={category.icon || 'tag'}
                />
              ))}
              <Divider />
              <Menu.Item
                onPress={() => {
                  setShowCategoryMenu(false);
                  navigation.navigate('CreateCategory');
                }}
                title="Create new category"
                leadingIcon="plus"
              />
            </Menu>

            <Menu
              visible={showPriorityMenu}
              onDismiss={() => setShowPriorityMenu(false)}
              anchor={
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => setShowPriorityMenu(true)}
                >
                  <MaterialCommunityIcons name="flag-outline" size={24} color={COLORS.primary} />
                  <Text style={styles.optionText}>
                    {priority ? 'Change priority' : 'Add priority'}
                  </Text>
                </TouchableOpacity>
              }
            >
              {priorityOptions.map(option => (
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    setPriority(option.value as 'low' | 'medium' | 'high');
                    setShowPriorityMenu(false);
                  }}
                  title={option.label}
                  leadingIcon={option.icon}
                />
              ))}
            </Menu>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Repeat</Text>
          
          <View style={styles.chipsContainer}>
            {renderRepeatChip()}
          </View>
          
          <Menu
            visible={showRepeatMenu}
            onDismiss={() => setShowRepeatMenu(false)}
            anchor={
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => setShowRepeatMenu(true)}
              >
                <MaterialCommunityIcons name="repeat" size={24} color={COLORS.primary} />
                <Text style={styles.optionText}>
                  {repeat.type ? 'Change repeat' : 'Add repeat'}
                </Text>
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                setRepeat({ ...repeat, type: 'daily', interval: 1 });
                setShowRepeatMenu(false);
              }}
              title="Daily"
              leadingIcon="calendar-today"
            />
            <Menu.Item
              onPress={() => {
                setRepeat({ ...repeat, type: 'weekly', interval: 1 });
                setShowRepeatMenu(false);
              }}
              title="Weekly"
              leadingIcon="calendar-week"
            />
            <Menu.Item
              onPress={() => {
                setRepeat({ ...repeat, type: 'monthly', interval: 1 });
                setShowRepeatMenu(false);
              }}
              title="Monthly"
              leadingIcon="calendar-month"
            />
            <Menu.Item
              onPress={() => {
                setRepeat({ ...repeat, type: 'yearly', interval: 1 });
                setShowRepeatMenu(false);
              }}
              title="Yearly"
              leadingIcon="calendar"
            />
            <Menu.Item
              onPress={() => {
                setRepeat({ ...repeat, type: 'custom', interval: 1 });
                setShowRepeatMenu(false);
              }}
              title="Custom"
              leadingIcon="calendar-clock"
            />
          </Menu>
          
          {repeat.type && (
            <View style={styles.repeatOptionsContainer}>
              <TouchableOpacity
                style={styles.repeatOptionItem}
                onPress={() => showDatePickerModal('repeatEndDate')}
              >
                <Text style={styles.repeatOptionLabel}>End date:</Text>
                <Text style={styles.repeatOptionValue}>
                  {repeat.endDate ? format(repeat.endDate, 'MMM d, yyyy') : 'Never'}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.repeatOptionItem}>
                <Text style={styles.repeatOptionLabel}>Interval:</Text>
                <View style={styles.repeatIntervalContainer}>
                  <TouchableOpacity
                    style={styles.repeatIntervalButton}
                    onPress={() => setRepeat({ ...repeat, interval: Math.max(1, repeat.interval - 1) })}
                  >
                    <MaterialCommunityIcons name="minus" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.repeatIntervalValue}>{repeat.interval}</Text>
                  <TouchableOpacity
                    style={styles.repeatIntervalButton}
                    onPress={() => setRepeat({ ...repeat, interval: repeat.interval + 1 })}
                  >
                    <MaterialCommunityIcons name="plus" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            style={styles.input}
            mode="outlined"
            outlineColor={COLORS.grey3}
            activeOutlineColor={COLORS.primary}
            multiline
            numberOfLines={4}
            placeholder="Add notes for this task"
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Symbol (Optional)</Text>
          <Menu
            visible={showSymbolMenu}
            onDismiss={() => setShowSymbolMenu(false)}
            anchor={
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => setShowSymbolMenu(true)}
              >
                <MaterialCommunityIcons 
                  name={symbol || "emoticon-outline"} 
                  size={24} 
                  color={COLORS.primary} 
                />
                <Text style={styles.optionText}>
                  {symbol ? 'Change symbol' : 'Add symbol'}
                </Text>
              </TouchableOpacity>
            }
          >
            <View style={styles.symbolsContainer}>
              {['star', 'heart', 'check', 'alert', 'information', 'help-circle', 'emoticon', 'trophy'].map(iconName => (
                <TouchableOpacity
                  key={iconName}
                  style={styles.symbolItem}
                  onPress={() => {
                    setSymbol(iconName);
                    setShowSymbolMenu(false);
                  }}
                >
                  <MaterialCommunityIcons
                    name={iconName}
                    size={28}
                    color={symbol === iconName ? COLORS.primary : COLORS.grey6}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </Menu>
        </View>

        <Button
          mode="contained"
          onPress={handleSaveTask}
          style={styles.saveButton}
          labelStyle={styles.saveButtonLabel}
          buttonColor={COLORS.primary}
        >
          Save Task
        </Button>
      </View>

      {(showDatePicker || showTimePicker) && (
        <DateTimePicker
          value={
            dateType === 'dueDate' 
              ? (dueDate || new Date())
              : dateType === 'reminderTime'
                ? (reminderTime || new Date())
                : (repeat.endDate || new Date())
          }
          mode={showTimePicker ? 'time' : 'date'}
          is24Hour={false}
          display="default"
          onChange={onDateChange}
        />
      )}
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
  optionsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey2,
  },
  optionText: {
    ...FONTS.body2,
    color: COLORS.grey8,
    marginLeft: SIZES.base,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SIZES.base,
  },
  chip: {
    margin: 4,
  },
  repeatOptionsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginTop: SIZES.base,
    padding: SIZES.padding,
    ...SHADOWS.small,
  },
  repeatOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  repeatOptionLabel: {
    ...FONTS.body2,
    color: COLORS.grey7,
  },
  repeatOptionValue: {
    ...FONTS.body2,
    color: COLORS.primary,
  },
  repeatIntervalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  repeatIntervalButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.grey1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatIntervalValue: {
    ...FONTS.body1,
    color: COLORS.grey8,
    marginHorizontal: SIZES.base,
    minWidth: 30,
    textAlign: 'center',
  },
  symbolsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SIZES.base,
    maxWidth: 240,
  },
  symbolItem: {
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

export default CreateTaskScreen; 