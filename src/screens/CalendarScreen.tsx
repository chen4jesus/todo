import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameDay } from 'date-fns';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { useTask } from '../hooks/useTask';
import { Task } from '../types';

type CalendarScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const CalendarScreen = () => {
  const navigation = useNavigation<CalendarScreenNavigationProp>();
  const { tasks, loading, fetchTasks } = useTask();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [tasksForSelectedDay, setTasksForSelectedDay] = useState<Task[]>([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Generate calendar days for the current month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Determine the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const startDay = getDay(monthStart);
    
    // Add empty days for the days before the 1st of the month
    const calendarDaysWithPadding = Array(startDay).fill(null);
    
    // Add the actual days of the month
    setCalendarDays([...calendarDaysWithPadding, ...daysInMonth]);
  }, [currentMonth]);

  useEffect(() => {
    // Filter tasks for the selected day
    const filteredTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), selectedDate);
    });
    
    setTasksForSelectedDay(filteredTasks);
  }, [selectedDate, tasks]);

  const previousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const nextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() +
 1);
    setCurrentMonth(nextMonth);
  };

  const selectDay = (day: Date | null) => {
    if (day) {
      setSelectedDate(day);
    }
  };

  const getDayWithTaskCount = (day: Date | null) => {
    if (!day) return null;

    const taskCount = tasks.filter((task) => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), day);
    }).length;

    return { day, taskCount };
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={previousMonth}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.grey8} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
          <TouchableOpacity onPress={nextMonth}>
            <MaterialCommunityIcons name="chevron-right" size={28} color={COLORS.grey8} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysContainer}>
          {weekDays.map((day, index) => (
            <Text key={index} style={styles.weekDayText}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.daysContainer}>
          {calendarDays.map((day, index) => {
            const dayWithTaskCount = getDayWithTaskCount(day);
            const isSelectedDay = day && isSameDay(day, selectedDate);
            const isCurrentDay = day && isToday(day);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  !day && styles.emptyDay,
                  isSelectedDay && styles.selectedDay,
                  isCurrentDay && styles.currentDay,
                ]}
                onPress={() => day && selectDay(day)}
                disabled={!day}
              >
                {day ? (
                  <View style={styles.dayContent}>
                    <Text
                      style={[
                        styles.dayText,
                        isSelectedDay && styles.selectedDayText,
                        isCurrentDay && styles.currentDayText,
                      ]}
                    >
                      {format(day, 'd')}
                    </Text>
                    {dayWithTaskCount && dayWithTaskCount.taskCount > 0 && (
                      <View style={styles.taskIndicator}>
                        <Text style={styles.taskCount}>
                          {dayWithTaskCount.taskCount}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.taskListContainer}>
        <View style={styles.selectedDateHeader}>
          <Text style={styles.selectedDateText}>
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </Text>
          <TouchableOpacity
            style={styles.addTaskButton}
            onPress={() => navigation.navigate('CreateTask')}
          >
            <MaterialCommunityIcons name="plus" size={20} color={COLORS.primary} />
            <Text style={styles.addTaskText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading tasks...</Text>
          </View>
        ) : (
          <ScrollView style={styles.taskList}>
            {tasksForSelectedDay.length > 0 ? (
              tasksForSelectedDay.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={[
                    styles.taskItem,
                    task.completed && styles.completedTask,
                  ]}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                >
                  <View style={styles.taskLeftSection}>
                    <MaterialCommunityIcons
                      name={task.completed ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                      size={24}
                      color={task.completed ? COLORS.success : COLORS.primary}
                    />
                  </View>
                  <View style={styles.taskContent}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.completed && styles.completedTaskText,
                      ]}
                      numberOfLines={1}
                    >
                      {task.title}
                    </Text>
                    {task.reminderTime && (
                      <View style={styles.taskTimeContainer}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.grey5} />
                        <Text style={styles.taskTime}>
                          {format(new Date(task.reminderTime), 'h:mm a')}
                        </Text>
                      </View>
                    )}
                  </View>
                  {task.category && (
                    <View
                      style={[
                        styles.categoryDot,
                        { backgroundColor: COLORS.secondary }, // Replace with actual category color
                      ]}
                    />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyTasksContainer}>
                <MaterialCommunityIcons
                  name="calendar-blank"
                  size={48}
                  color={COLORS.grey4}
                />
                <Text style={styles.emptyTasksText}>
                  No tasks scheduled for this day
                </Text>
                <Text style={styles.emptyTasksSubText}>
                  Tap the + button to add a task
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

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
  calendarContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    ...SHADOWS.small,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  monthTitle: {
    ...FONTS.h3,
    color: COLORS.grey8,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SIZES.base,
  },
  weekDayText: {
    ...FONTS.body3,
    color: COLORS.grey5,
    width: 40,
    textAlign: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.base,
  },
  emptyDay: {
    backgroundColor: 'transparent',
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  currentDay: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
  },
  dayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    ...FONTS.body2,
    color: COLORS.grey8,
  },
  selectedDayText: {
    color: COLORS.white,
  },
  currentDayText: {
    color: COLORS.primary,
  },
  taskIndicator: {
    backgroundColor: COLORS.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -4,
    right: -8,
  },
  taskCount: {
    ...FONTS.caption,
    fontSize: 10,
    color: COLORS.white,
  },
  taskListContainer: {
    flex: 1,
    padding: SIZES.padding,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  selectedDateText: {
    ...FONTS.h4,
    color: COLORS.grey8,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTaskText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 4,
  },
  taskList: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.base,
    ...SHADOWS.small,
  },
  completedTask: {
    backgroundColor: COLORS.grey1,
  },
  taskLeftSection: {
    marginRight: SIZES.base,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    ...FONTS.body1,
    marginBottom: 4,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: COLORS.grey5,
  },
  taskTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTime: {
    ...FONTS.body3,
    color: COLORS.grey5,
    marginLeft: 4,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: SIZES.base,
  },
  emptyTasksContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding * 2,
    marginTop: SIZES.padding,
  },
  emptyTasksText: {
    ...FONTS.h4,
    color: COLORS.grey6,
    marginTop: SIZES.base,
    textAlign: 'center',
  },
  emptyTasksSubText: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.body2,
    color: COLORS.grey6,
    marginTop: SIZES.base,
  },
});

export default CalendarScreen;