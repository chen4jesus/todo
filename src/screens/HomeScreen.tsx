import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, FAB, Card, ProgressBar, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { useTask } from '../hooks/useTask';
import TaskItem from '../components/TaskItem';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { tasks, categories, loading, fetchTasks, fetchCategories } = useTask();
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchTasks(), fetchCategories()]);
    };
    loadData();
  }, []);

  useEffect(() => {
    // Filter tasks for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayFiltered = tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });

    // Filter upcoming tasks (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingFiltered = tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() > today.getTime() && taskDate.getTime() <= nextWeek.getTime();
    });

    setTodayTasks(todayFiltered);
    setUpcomingTasks(upcomingFiltered);
  }, [tasks]);

  // Calculate completed tasks percentage
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? completedTasks / totalTasks : 0;

  if (loading && tasks.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Hello, John!</Text>
        <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>

        {/* Progress Card */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <Text style={styles.progressTitle}>Task Progress</Text>
            <View style={styles.progressInfo}>
              <Text style={styles.progressPercentage}>{Math.round(completionPercentage * 100)}%</Text>
              <Text style={styles.progressStats}>
                {completedTasks} of {totalTasks} tasks completed
              </Text>
            </View>
            <ProgressBar
              progress={completionPercentage}
              color={COLORS.primary}
              style={styles.progressBar}
            />
          </Card.Content>
        </Card>

        {/* Today's Tasks */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {todayTasks.length > 0 ? (
            todayTasks.slice(0, 3).map(task => (
              <TaskItem key={task.id} task={task} />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={32}
                color={COLORS.grey4}
              />
              <Text style={styles.emptyText}>
                No tasks scheduled for today
              </Text>
            </View>
          )}
        </View>

        {/* Upcoming Tasks */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {upcomingTasks.length > 0 ? (
            upcomingTasks.slice(0, 3).map(task => (
              <TaskItem key={task.id} task={task} />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="calendar-outline"
                size={32}
                color={COLORS.grey4}
              />
              <Text style={styles.emptyText}>
                No upcoming tasks for the next 7 days
              </Text>
            </View>
          )}
        </View>

        {/* Categories */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScrollView}
          >
            {categories.length > 0 ? (
              categories.map(category => (
                <TouchableOpacity key={category.id} style={styles.categoryCard}>
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: category.color },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={category.icon || 'tag'}
                      size={24}
                      color={COLORS.white}
                    />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryCount}>
                    {tasks.filter(task => task.category === category.id).length} tasks
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyCategoriesContainer}>
                <MaterialCommunityIcons
                  name="tag-outline"
                  size={32}
                  color={COLORS.grey4}
                />
                <Text style={styles.emptyText}>No categories yet</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>

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
  scrollView: {
    flex: 1,
    padding: SIZES.padding,
  },
  greeting: {
    ...FONTS.h2,
    color: COLORS.grey8,
    marginTop: SIZES.base,
  },
  date: {
    ...FONTS.body2,
    color: COLORS.grey5,
    marginBottom: SIZES.padding,
  },
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    ...SHADOWS.medium,
  },
  progressTitle: {
    ...FONTS.h4,
    color: COLORS.grey8,
    marginBottom: SIZES.base,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: SIZES.base,
  },
  progressPercentage: {
    ...FONTS.h2,
    color: COLORS.primary,
  },
  progressStats: {
    ...FONTS.body3,
    color: COLORS.grey5,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  sectionContainer: {
    marginBottom: SIZES.padding,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.grey8,
  },
  seeAllText: {
    ...FONTS.body3,
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
  },
  emptyText: {
    ...FONTS.body2,
    color: COLORS.grey5,
    marginTop: SIZES.base,
    textAlign: 'center',
  },
  categoriesScrollView: {
    flexDirection: 'row',
    marginTop: SIZES.base,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginRight: SIZES.base,
    width: 140,
    ...SHADOWS.small,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  categoryName: {
    ...FONTS.h5,
    marginBottom: 4,
  },
  categoryCount: {
    ...FONTS.body3,
    color: COLORS.grey5,
  },
  emptyCategoriesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    width: 140,
    height: 120,
    ...SHADOWS.small,
  },
  fab: {
    position: 'absolute',
    right: SIZES.padding,
    bottom: SIZES.padding,
    backgroundColor: COLORS.primary,
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
  },
});

export default HomeScreen; 