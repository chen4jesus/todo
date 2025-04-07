import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Checkbox, Menu, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Task } from '../types';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { useTask } from '../hooks/useTask';

type TaskDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TaskDetail'>;

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const navigation = useNavigation<TaskDetailScreenNavigationProp>();
  const { toggleTaskCompletion, deleteTask } = useTask();
  const [menuVisible, setMenuVisible] = React.useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleCheckboxToggle = async () => {
    await toggleTaskCompletion(task.id, !task.completed);
  };

  const handleDelete = async () => {
    closeMenu();
    await deleteTask(task.id);
  };

  const handleEdit = () => {
    closeMenu();
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        task.completed && styles.completedTask,
      ]}
      onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
    >
      <View style={styles.leftSection}>
        <Checkbox
          status={task.completed ? 'checked' : 'unchecked'}
          onPress={handleCheckboxToggle}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.contentSection}>
        <Text
          style={[
            styles.title,
            task.completed && styles.completedText,
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        
        {task.dueDate && (
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons name="calendar" size={14} color={COLORS.grey5} />
            <Text style={styles.dateText}>
              {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </Text>
          </View>
        )}
        
        {task.category && (
          <View style={styles.categoryContainer}>
            <View
              style={[
                styles.categoryDot,
                { backgroundColor: COLORS.secondary }, // Replace with actual category color
              ]}
            />
            <Text style={styles.categoryText}>{task.category}</Text>
          </View>
        )}
      </View>

      <View style={styles.rightSection}>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={openMenu}
              color={COLORS.grey5}
            />
          }
        >
          <Menu.Item
            onPress={handleEdit}
            title="Edit"
            leadingIcon="pencil"
          />
          <Menu.Item
            onPress={handleDelete}
            title="Delete"
            leadingIcon="delete"
          />
          {task.symbol && (
            <Menu.Item
              onPress={closeMenu}
              title="Remove Symbol"
              leadingIcon="tag-remove"
            />
          )}
        </Menu>
        
        {task.symbol && (
          <MaterialCommunityIcons
            name={task.symbol}
            size={20}
            color={COLORS.accent}
            style={styles.symbolIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    padding: SIZES.base,
    ...SHADOWS.small,
  },
  completedTask: {
    backgroundColor: COLORS.grey1,
  },
  leftSection: {
    marginRight: SIZES.base,
  },
  contentSection: {
    flex: 1,
    marginRight: SIZES.base,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...FONTS.body1,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.grey5,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dateText: {
    ...FONTS.body3,
    color: COLORS.grey5,
    marginLeft: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  categoryText: {
    ...FONTS.body3,
    color: COLORS.grey6,
  },
  symbolIcon: {
    marginLeft: SIZES.base,
  },
});

export default TaskItem; 