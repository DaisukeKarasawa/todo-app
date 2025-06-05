<template>
  <div class="container">
    <h1>TODO APP</h1>
    
    <!-- TODO追加フォーム -->
    <div class="add-todo">
      <input 
        v-model="newTodo" 
        @keyup.enter="addTodo"
        placeholder="Enter a new todo"
        class="todo-input"
      />
      <button @click="addTodo" class="add-btn">Create</button>
    </div>

    <!-- TODOリスト -->
    <div class="todo-list">
      <div 
        v-for="todo in todos" 
        :key="todo.id" 
        class="todo-item"
        :class="{ completed: todo.is_completed }"
      >
        <input 
          type="checkbox" 
          v-model="todo.is_completed"
          @change="updateTodo(todo)"
          class="todo-checkbox"
        />
        <span class="todo-title">{{ todo.title }}</span>
        <button @click="deleteTodo(todo.id)" class="delete-btn">Delete</button>
      </div>
    </div>

    <!-- 空の状態 -->
    <div v-if="todos.length === 0" class="empty-state">
      No todos yet. Create a new todo.
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api/v1'

export default {
  name: 'App',
  data() {
    return {
      todos: [],
      newTodo: ''
    }
  },
  async mounted() {
    await this.fetchTodos()
  },
  methods: {
    async fetchTodos() {
      try {
        const response = await axios.get(`${API_BASE_URL}/todos`)
        this.todos = response.data
      } catch (error) {
        console.error('Failed to fetch todos:', error)
        alert('Failed to fetch todos')
      }
    },
    async addTodo() {
      if (!this.newTodo.trim()) return
      
      try {
        const response = await axios.post(`${API_BASE_URL}/todos`, {
          todo: {
            title: this.newTodo.trim(),
            is_completed: false
          }
        })
        this.todos.unshift(response.data)
        this.newTodo = ''
      } catch (error) {
        console.error('Failed to create todo:', error)
        alert('Failed to create todo')
      }
    },
    async updateTodo(todo) {
      try {
        await axios.put(`${API_BASE_URL}/todos/${todo.id}`, {
          todo: {
            title: todo.title,
            is_completed: todo.is_completed
          }
        })
      } catch (error) {
        console.error('Failed to update todo:', error)
        alert('Failed to update todo')
        todo.is_completed = !todo.is_completed
      }
    },
    async deleteTodo(id) {
      if (!confirm('Delete this todo?')) return
      
      try {
        await axios.delete(`${API_BASE_URL}/todos/${id}`)
        this.todos = this.todos.filter(todo => todo.id !== id)
      } catch (error) {
        console.error('Failed to delete todo:', error)
        alert('Failed to delete todo')
      }
    }
  }
}
</script>

<style scoped>
.add-todo {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.todo-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
}

.todo-input:focus {
  border-color: #007bff;
}

.add-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #a8b8f0 0%, #9b8bc4 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(168, 184, 240, 0.2);
}

.add-btn:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.todo-list {
  space-y: 10px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: linear-gradient(135deg, #f0f2ff 0%, #f8f9fa 100%);
  border-radius: 6px;
  margin-bottom: 10px;
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.todo-item:hover {
  background: linear-gradient(135deg, #e8ecff 0%, #f0f4ff 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.todo-item.completed {
  opacity: 0.6;
  background: linear-gradient(135deg, #e9ecef 0%, #f1f3f4 100%);
}

.todo-item.completed:hover {
  background: linear-gradient(135deg, #dee2e6 0%, #e9ecef 100%);
}

.todo-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.todo-title {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
  color: #6c757d;
}

.delete-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #ff9999 0%, #f0876e 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 10px rgba(255, 153, 153, 0.2);
}

.delete-btn:hover {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.empty-state {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 40px;
  background-color: #f8f9fa;
  border-radius: 6px;
}
</style>