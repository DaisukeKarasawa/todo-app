<template>
  <div>
    <h1>TODO APP</h1>
    
    <!-- TODO追加フォーム -->
    <div>
      <input 
        v-model="newTodo" 
        @keyup.enter="addTodo"
        placeholder="Enter a new todo"
      />
      <button @click="addTodo">Create</button>
    </div>

    <!-- TODOリスト -->
    <div>
      <div 
        v-for="todo in todos" 
        :key="todo.id" 
      >
        <input 
          type="checkbox" 
          v-model="todo.is_completed"
          @change="updateTodo(todo)"
        />
        <span>{{ todo.title }}</span>
        <button @click="deleteTodo(todo.id)">Delete</button>
      </div>
    </div>

    <!-- 空の状態 -->
    <div v-if="todos.length === 0">
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