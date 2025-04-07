import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, FAB, Searchbar, Menu, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { useTask } from '../hooks/useTask';
import TaskItem from '../components/TaskItem';
import { Task } from '../types';

type TasksScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const TasksScreen = () => {
  const navigation = useNavigation<TasksScreenNavigationProp>();
  const { tasks, categories, loading, fetchTasks } = useTask();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'alphabetical' | 'createdAt'>('dueDate');
  const [filterCompleted, setFilterCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    let result = [...tasks];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply completed filter
    if (filterCompleted !== null) {
      result = result.filter(task => task.completed === filterCompleted);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          // Sort by due date (null dates at the end)
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        
        case 'priority':
          // Sort by priority (high → medium → low → undefined)
          const priorityOrder = { high: 0, medium: 1, low: 2, undefined: 3 };
          const aPriority = a.priority || 'undefined';
          const bPriority = b.priority || 'undefined';
          return priorityOrder[aPriority] - priorityOrder[bPriority];
        
        case 'alphabetical':
          // Sort alphabetically by title
          return a.title.localeCompare(b.title);
        
        case 'createdAt':
          // Sort by creation date (newest first)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        
        default:
          return 0;
      }
    });

    setFilteredTasks(result);
  }, [tasks, searchQuery, sortBy, filterCompleted]);

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleSort = (type: 'dueDate' | 'priority' | 'alphabetical' | 'createdAt') => {
    setSortBy(type);
    closeMenu();
  };

  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyText}>Loading tasks...</Text>
        </View>
      );
    }

    if (searchQuery) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="magnify-close" size={48} color={COLORS.grey4} />
          <Text style={styles.emptyText}>No tasks matching "{searchQuery}"</Text>
        </View>
      );
    }

    if (filterCompleted === true) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={48} color={COLORS.grey4} />
          <Text style={styles.emptyText}>No completed tasks yet</Text>
        </View>
      );
    }

    if (filterCompleted === false) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={48} color={COLORS.grey4} />
          <Text style={styles.emptyText}>No pending tasks</Text>
          <Text style={styles.emptySubText}>Tap the + button to create a new task</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={COLORS.grey4} />
        <Text style={styles.emptyText}>No tasks yet</Text>
        <Text style={styles.emptySubText}>Tap the + button to create a new task</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search tasks..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
        />

        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
              <MaterialCommunityIcons name="filter-variant" size={24} color={COLORS.grey8} />
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => setFilterCompleted(null)}
            title="All Tasks"
            leadingIcon={filterCompleted === null ? 'check' : 'checkbox-blank-outline'}
          />
          <Menu.Item
            onPress={() => setFilterCompleted(false)}
            title="Pending Tasks"
            leadingIcon={filterCompleted === false ? 'check' : 'checkbox-blank-outline'}
          />
          <Menu.Item
            onPress={() => setFilterCompleted(true)}
            title="Completed Tasks"
            leadingIcon={filterCompleted === true ? 'check' : 'checkbox-blank-outline'}
          />
          
          <Divider />
          <Menu.Item title="Sort by" disabled />
          
          <Menu.Item
            onPress={() => handleSort('dueDate')}
            title="Due Date"
            leadingIcon={sortBy === 'dueDate' ? 'check' : 'calendar'}
          />
          <Menu.Item
            onPress={() => handleSort('priority')}
            title="Priority"
            leadingIcon={sortBy === 'priority' ? 'check' : 'flag'}
          />
          <Menu.Item
            onPress={() => handleSort('alphabetical')}
            title="Alphabetical"
            leadingIcon={sortBy === 'alphabetical' ? 'check' : 'sort-alphabetical-ascending'}
          />
          <Menu.Item
            onPress={() => handleSort('createdAt')}
            title="Creation Date"
            leadingIcon={sortBy === 'createdAt' ? 'check' : 'clock-outline'}
          />
        </Menu>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskItem task={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateTask')}
        color={COLORS.white}
      />
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
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  searchBar: {
    flex: 1,
    marginRight: SIZES.base,
    backgroundColor: COLORS.grey1,
    elevation: 0,
  },
  menuButton: {
    padding: SIZES.base,
  },
  listContent: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 4, // Extra padding for FAB
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding * 2,
    marginTop: SIZES.padding * 2,
  },
  emptyText: {
    ...FONTS.h4,
    color: COLORS.grey6,
    marginTop: SIZES.base,
    textAlign: 'center',
  },
  emptySubText: {
    ...FONTS.body3,
    color: COLORS.grey5,
    marginTop: SIZES.base / 2,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: SIZES.padding,
    bottom: SIZES.padding,
    backgroundColor: COLORS.primary,
  },
});

export default TasksScreen; 