import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, FAB, Divider, Menu, Dialog, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { useTask } from '../hooks/useTask';

type CategoriesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const CategoriesScreen = () => {
  const navigation = useNavigation<CategoriesScreenNavigationProp>();
  const { categories, loading, fetchCategories, deleteCategory, getTasksByCategory } = useTask();
  const [menuVisible, setMenuVisible] = React.useState<{[key: string]: boolean}>({});
  const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);
  const [tasksInCategory, setTasksInCategory] = React.useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  const openMenu = (categoryId: string) => {
    setMenuVisible({ ...menuVisible, [categoryId]: true });
  };

  const closeMenu = (categoryId: string) => {
    setMenuVisible({ ...menuVisible, [categoryId]: false });
  };

  const showDeleteDialog = async (categoryId: string) => {
    closeMenu(categoryId);
    setSelectedCategoryId(categoryId);
    
    // Check if category has tasks
    const tasks = await getTasksByCategory(categoryId);
    setTasksInCategory(tasks.length);
    
    setDeleteDialogVisible(true);
  };

  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
    setSelectedCategoryId(null);
  };

  const handleDeleteCategory = async () => {
    if (selectedCategoryId) {
      await deleteCategory(selectedCategoryId);
      hideDeleteDialog();
    }
  };

  const navigateToEditCategory = (categoryId: string) => {
    closeMenu(categoryId);
    // For now, we'll just navigate to the create screen
    navigation.navigate('CreateCategory');
  };

  const renderCategoryItem = ({ item }) => {
    const taskCount = item.taskCount || 0;
    
    return (
      <View style={styles.categoryItem}>
        <View style={styles.categoryContent}>
          <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
            <MaterialCommunityIcons name={item.icon || 'tag'} size={24} color={COLORS.white} />
          </View>
          <View style={styles.categoryDetails}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text style={styles.taskCount}>{taskCount} tasks</Text>
          </View>
        </View>
        
        <Menu
          visible={menuVisible[item.id] || false}
          onDismiss={() => closeMenu(item.id)}
          anchor={
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => openMenu(item.id)}
            >
              <MaterialCommunityIcons name="dots-vertical" size={24} color={COLORS.grey6} />
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => navigateToEditCategory(item.id)}
            title="Edit"
            leadingIcon="pencil"
          />
          <Menu.Item
            onPress={() => showDeleteDialog(item.id)}
            title="Delete"
            leadingIcon="delete"
          />
        </Menu>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyText}>Loading categories...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="tag-outline" size={48} color={COLORS.grey4} />
        <Text style={styles.emptyText}>No categories yet</Text>
        <Text style={styles.emptySubText}>
          Create categories to organize your tasks
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        ListEmptyComponent={renderEmptyState}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateCategory')}
        color={COLORS.white}
      />

      <Dialog visible={deleteDialogVisible} onDismiss={hideDeleteDialog}>
        <Dialog.Title>Delete Category</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            {tasksInCategory > 0
              ? `This category contains ${tasksInCategory} tasks. Deleting it will not delete the tasks, but they will no longer be associated with this category.`
              : `Are you sure you want to delete this category?`}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideDeleteDialog}>Cancel</Button>
          <Button onPress={handleDeleteCategory} textColor={COLORS.error}>Delete</Button>
        </Dialog.Actions>
      </Dialog>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grey0,
  },
  header: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.grey8,
  },
  listContent: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 4, // Extra padding for FAB
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.padding,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.base,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    ...FONTS.h4,
    color: COLORS.grey8,
  },
  taskCount: {
    ...FONTS.body3,
    color: COLORS.grey5,
  },
  divider: {
    backgroundColor: COLORS.grey2,
  },
  menuButton: {
    padding: SIZES.base,
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

export default CategoriesScreen; 