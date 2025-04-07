import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, IconButton, Divider, Menu, Checkbox, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import { RootStackParamList } from '../navigation/AppNavigator.tsx';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme.ts';
import { useTask } from '../hooks/useTask.ts';
import { Task, Category } from '../types.ts';

type TaskDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const TaskDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<TaskDetailScreenNavigationProp>();
  const { taskId } = route.params as { taskId: string };
  const { getTaskById, updateTask, deleteTask, toggleTaskCompletion, categories } = useTask();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  
  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);
        const fetchedTask = await getTaskById(taskId);
        setTask(fetchedTask);
      } catch (error) {
        console.error('Error loading task:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTask();
  }, [taskId]);

  const handleToggleComplete = async () => {
    if (task) {
      const updatedTask = await toggleTaskCompletion(task.id, !task.completed);
      setTask(updatedTask);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTask(taskId);
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = () => {
    navigation.navigate('EditTaskScreen', { taskId: taskId });
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'No category';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown category';
  };

  const getCategoryColor = (categoryId?: string) => {
    if (!categoryId) return COLORS.grey4;
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : COLORS.grey4;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading task details...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>Task not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Checkbox
            status={task.completed ? 'checked' : 'unchecked'}
            onPress={handleToggleComplete}
            color={COLORS.primary}
          />
          <Text 
            style={[
              styles.taskTitle,
              task.completed && styles.completedText
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
        </View>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() => setMenuVisible(true)}
              iconColor={COLORS.grey7}
            />
          }
        >
          <Menu.Item onPress={handleEditTask} title="Edit" leadingIcon="pencil" />
          <Menu.Item onPress={handleDeleteTask} title="Delete" leadingIcon="delete" />
          <Menu.Item 
            onPress={() => setMenuVisible(false)} 
            title={task.completed ? "Mark as incomplete" : "Mark as complete"} 
            leadingIcon={task.completed ? "checkbox-blank-outline" : "checkbox-marked"} 
          />
        </Menu>
      </View>

      <ScrollView style={styles.content}>
        {/* Description */}
        {task.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{task.description}</Text>
          </View>
        )}

        <Divider style={styles.divider} />

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="calendar" size={20} color={COLORS.grey6} />
            <Text style={styles.detailLabel}>Due Date:</Text>
            <Text style={styles.detailValue}>
              {task.dueDate ? format(new Date(task.dueDate), 'EEEE, MMMM d, yyyy') : 'No due date'}
            </Text>
          </View>

          {task.reminderTime && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.grey6} />
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>
                {format(new Date(task.reminderTime), 'h:mm a')}
              </Text>
            </View>
          )}

          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="tag-outline" size={20} color={COLORS.grey6} />
            <Text style={styles.detailLabel}>Category:</Text>
            <View 
              style={[
                styles.categoryTag, 
                { backgroundColor: getCategoryColor(task.category) }
              ]}
            >
              <Text style={styles.categoryText}>{getCategoryName(task.category)}</Text>
            </View>
          </View>

          {task.priority && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons 
                name="flag" 
                size={20} 
                color={
                  task.priority === 'high' ? COLORS.error :
                  task.priority === 'medium' ? COLORS.warning :
                  COLORS.grey4
                } 
              />
              <Text style={styles.detailLabel}>Priority:</Text>
              <Text 
                style={[
                  styles.priorityText,
                  {
                    color: task.priority === 'high' ? COLORS.error :
                    task.priority === 'medium' ? COLORS.warning :
                    COLORS.grey6
                  }
                ]}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Text>
            </View>
          )}

          {task.repeat && task.repeat.type && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="repeat" size={20} color={COLORS.grey6} />
              <Text style={styles.detailLabel}>Repeat:</Text>
              <Text style={styles.detailValue}>
                {`Every ${task.repeat.interval > 1 ? task.repeat.interval : ''} ${task.repeat.type}${task.repeat.interval > 1 ? 's' : ''}`}
                {task.repeat.endDate ? ` until ${format(new Date(task.repeat.endDate), 'MMM d, yyyy')}` : ''}
              </Text>
            </View>
          )}

          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="calendar-check" size={20} color={COLORS.grey6} />
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailValue}>
              {format(new Date(task.createdAt), 'MMM d, yyyy')}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="update" size={20} color={COLORS.grey6} />
            <Text style={styles.detailLabel}>Updated:</Text>
            <Text style={styles.detailValue}>
              {format(new Date(task.updatedAt), 'MMM d, yyyy')}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {task.notes && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notes}>{task.notes}</Text>
            </View>
          </>
        )}

        {/* Symbol */}
        {task.symbol && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.symbolSection}>
              <Text style={styles.sectionTitle}>Symbol</Text>
              <View style={styles.symbolContainer}>
                <MaterialCommunityIcons 
                  name={task.symbol as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={48}
                  color={COLORS.primary}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grey0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskTitle: {
    ...FONTS.h3,
    color: COLORS.grey8,
    marginLeft: SIZES.base,
    flex: 1,
    fontWeight: '600',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.grey5,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  section: {
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.grey8,
    marginBottom: SIZES.base,
    fontWeight: '600',
  },
  description: {
    ...FONTS.body2,
    color: COLORS.grey7,
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
    fontWeight: '400',
  },
  divider: {
    backgroundColor: COLORS.grey3,
    marginVertical: SIZES.base,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    ...SHADOWS.small,
  },
  detailLabel: {
    ...FONTS.body2,
    color: COLORS.grey7,
    width: 80,
    marginLeft: SIZES.base,
    fontWeight: '600',
  },
  detailValue: {
    ...FONTS.body2,
    color: COLORS.grey8,
    flex: 1,
    fontWeight: '600',
  },
  categoryTag: {
    paddingHorizontal: SIZES.base,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
  priorityText: {
    ...FONTS.body2,
    fontWeight: '600',
  },
  notes: {
    ...FONTS.body2,
    color: COLORS.grey7,
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
    fontWeight: '400',
  },
  symbolSection: {
    marginBottom: SIZES.padding,
  },
  symbolContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.grey0,
  },
  loadingText: {
    ...FONTS.body2,
    color: COLORS.grey6,
    marginTop: SIZES.base,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.grey0,
    padding: SIZES.padding,
  },
  errorText: {
    ...FONTS.h4,
    color: COLORS.error,
    marginTop: SIZES.base,
    marginBottom: SIZES.padding,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  backButtonText: {
    ...FONTS.button,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default TaskDetailScreen; 