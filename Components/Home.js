import { View, Text, SafeAreaView, StyleSheet, TextInput, ScrollView, Modal, TouchableOpacity, Pressable, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  const [todoList, setTodoList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [todo, setTodo] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTodoList, setFilteredTodoList] = useState([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedTodoIndex, setSelectedTodoIndex] = useState(null);

  const loadTodoList = async () => {
    try {
      const storedTodos = await AsyncStorage.getItem('todoList');
      if (storedTodos) {
        const parsedTodos = JSON.parse(storedTodos);
        setTodoList(parsedTodos);
        setFilteredTodoList(parsedTodos);
      }
    } catch {}
  };

  const saveTodoList = async (todos) => {
    try {
      await AsyncStorage.setItem('todoList', JSON.stringify(todos));
    } catch {}
  };

  const addTodo = () => {
    if (todo && description) {
      const newTodo = { todo, description };
      const updatedTodoList = [...todoList, newTodo];
      setTodoList(updatedTodoList);
      setFilteredTodoList(updatedTodoList);
      setModalVisible(false);
      setTodo('');
      setDescription('');
    }
  };

  const handleDelete = () => {
    const updatedTodoList = todoList.filter((_, index) => index !== selectedTodoIndex);
    setTodoList(updatedTodoList);
    setFilteredTodoList(updatedTodoList);
    setIsDeleteModalVisible(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === '') {
      setFilteredTodoList(todoList);
    } else {
      const filtered = todoList.filter((item) => item.todo.toLowerCase().includes(query.toLowerCase()));
      setFilteredTodoList(filtered);
    }
  };

  useEffect(() => {
    loadTodoList();
  }, []);

  useEffect(() => {
    saveTodoList(todoList);
  }, [todoList]);

  const renderTodoItem = ({ item, index }) => (
    <Pressable
      onLongPress={() => {
        setSelectedTodoIndex(index);
        setIsDeleteModalVisible(true);
      }}
      style={styles.itemContainer}
    >
      <Text style={styles.todoText}>{item.todo}</Text>
      <Text style={styles.descriptionText}>{item.description}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={styles.mainText}>Todo List</Text>
      <View style={styles.search}>
        <TextInput value={searchQuery} onChangeText={handleSearch} style={styles.searchInput} placeholder="Search" />
      </View>

      {filteredTodoList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No todos to view</Text>
        </View>
      ) : (
        <FlatList
          style={{ padding: 5 }}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderTodoItem}
          data={filteredTodoList}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal transparent={true} visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Pressable
          onPress={() => setModalVisible(false)}
          style={styles.modalBackground}
        >
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Todo</Text>
            <TextInput
              value={todo}
              onChangeText={(e) => setTodo(e)}
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#AFAFAF"
            />
            <TextInput
              value={description}
              onChangeText={(e) => setDescription(e)}
              style={styles.input}
              placeholder="Description"
              placeholderTextColor="#AFAFAF"
            />
            <View style={{ alignSelf: 'flex-end' }}>
              <TouchableOpacity onPress={addTodo} style={styles.addButton}>
                <Text style={{ color: 'white' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent={true}
        visible={isDeleteModalVisible}
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <Pressable
          onPress={() => setIsDeleteModalVisible(false)}
          style={styles.modalBackground}
        >
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Delete</Text>
            <Text style={styles.modalDescription}>Are you sure you want to delete this todo?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setIsDeleteModalVisible(false)} style={styles.cancelButton}>
                <Text style={{ color: 'white' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                <Text style={{ color: 'white' }}>Okay</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainText: {
    fontSize: 25,
    fontFamily: 'Poppins-SemiBold',
    padding: 20,
    color: '#404040',
  },
  search: {
    backgroundColor: 'white',
    height: 50,
    marginBottom:10,
    borderRadius: 20,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BCBCBC',
    marginHorizontal: 20,
  },
  searchInput: {
    marginHorizontal: 10,
    fontFamily: 'Poppins-Light',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#a77cfc',
    fontSize: 18,
    fontFamily:'Poppins-Light'
  },
  itemContainer: {
    marginHorizontal: 20,
    marginVertical: 5,
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: 75,
    backgroundColor: 'white',
    elevation: 5,
    borderRadius: 15,
  },
  todoText: {
    fontSize: 17,
    color: '#a77cfc',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  descriptionText: {
    color: '#707070',
    fontFamily: 'Poppins-Light',
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 30,
    right: 30,
    elevation: 5,
    borderColor: '#A8A8A8',
    borderWidth: 1,
  },
  fabText: {
    fontSize: 40,
    color: '#A8A8A8',
    
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    paddingVertical: 20,
    paddingHorizontal: 35,
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    color: '#8954F3',
    fontFamily: 'Poppins-SemiBold',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ABABAB',
    marginTop: 20,
    fontFamily: 'Poppins-Light',
  },
  addButton: {
    marginTop: 15,
    backgroundColor: '#a579fc',
    width: 70,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 15,
    backgroundColor: '#a579fc',
    width: 70,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    width: 70,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDescription: {
    marginTop: 10,
    fontFamily: 'Poppins-Light',
  },
});


export default App;