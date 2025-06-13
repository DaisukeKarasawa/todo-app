import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import App from '../App.vue'

const mock = new MockAdapter(axios)

describe('TODOアプリテスト', () => {
    let wrapper

    beforeEach(() => {
        mock.reset()
        vi.clearAllMocks()

        global.alert = vi.fn()
        global.confirm = vi.fn()

        mock.onGet('http://localhost:3000/api/v1/todos').reply(200, [])
    })

    afterEach(() => {
        if (wrapper) {
            wrapper.unmount()
        }
    })

    describe('1. 初期表示テスト', () => {
        it('アプリケーションタイトルが表示されること', async () => {
            wrapper = mount(App)
            await wrapper.vm.$nextTick()

            expect(wrapper.find('h1').text()).toBe('TODO APP')
        })

        it('追加ボタンが表示されること', async () => {
            wrapper = mount(App)
            await wrapper.vm.$nextTick()

            const button = wrapper.find('.add-btn')
            expect(button.exists()).toBe(true)
            expect(button.text()).toBe('Create')
        })

        it('TODOが0件の場合、空状態メッセージが表示されること', async () => {
            wrapper = mount(App)
            await wrapper.vm.$nextTick()

            const emptyState = wrapper.find('.empty-state')
            expect(emptyState.exists()).toBe(true)
            expect(emptyState.text()).toBe('No todos yet. Create a new todo.')
        })
    })

    describe('2. TODO追加テスト', () => {
        beforeEach(async () => {
            wrapper = mount(App)
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 0))
        })

        it('TODO追加後、入力フィールドがクリアされること', async () => {
            const newTodo = { id: 3, title: '新しいTODO', is_completed: false }
            mock.onPost('http://localhost:3000/api/v1/todos').reply(201, newTodo)

            const input = wrapper.find('.todo-input')
            const button = wrapper.find('.add-btn')

            await input.setValue('新しいTODO')
            await button.trigger('click')
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 0))

            expect(input.element.value).toBe('')
            expect(wrapper.vm.newTodo).toBe('')
        })

        it('新しいTODOがリストの先頭に表示されること', async () => {
            wrapper.vm.todos = [{ id: 1, title: '既存TODO', is_completed: false }]
            await wrapper.vm.$nextTick()

            const newTodo = { id: 2, title: '新しいTODO', is_completed: false }
            mock.onPost('http://localhost:3000/api/v1/todos').reply(201, newTodo)

            const input = wrapper.find('.todo-input')
            const button = wrapper.find('.add-btn')

            await input.setValue('新しいTODO')
            await button.trigger('click')
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 0))

            expect(wrapper.vm.todos[0]).toEqual(newTodo)
        })

        it('空文字では追加されないこと', async () => {
            const input = wrapper.find('.todo-input')
            const button = wrapper.find('.add-btn')

            await input.setValue('')
            await button.trigger('click')
            await wrapper.vm.$nextTick()

            expect(mock.history.post).toHaveLength(0)
        })

        it('空白のみの入力では追加されないこと', async () => {
            const input = wrapper.find('.todo-input')
            const button = wrapper.find('.add-btn')

            await input.setValue('   ')
            await button.trigger('click')
            await wrapper.vm.$nextTick()

            expect(mock.history.post).toHaveLength(0)
        })

        it('Enterキーで追加できること', async () => {
            const newTodo = { id: 3, title: '新しいTODO', is_completed: false }
            mock.onPost('http://localhost:3000/api/v1/todos').reply(201, newTodo)

            const input = wrapper.find('.todo-input')

            await input.setValue('新しいTODO')
            await input.trigger('keyup.enter')
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 0))

            expect(wrapper.vm.todos).toContainEqual(newTodo)
        })
    })

    describe('3. TODO完了状態切り替えテスト', () => {
        beforeEach(async () => {
            const mockTodos = [
                { id: 1, title: 'テストTODO', is_completed: false }
            ]

            mock.onGet('http://localhost:3000/api/v1/todos').reply(200, mockTodos)
            mock.onPut('http://localhost:3000/api/v1/todos/1').reply(200, {})

            wrapper = mount(App)
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 0))
        })

        it('チェックボックスクリックで完了状態が切り替わること', async () => {
            const checkbox = wrapper.find('.todo-checkbox')

            await checkbox.setChecked(true)
            await wrapper.vm.$nextTick()

            expect(wrapper.vm.todos[0].is_completed).toBe(true)
        })

        it('完了時、タイトルに取り消し線が表示されること', async () => {
            const checkbox = wrapper.find('.todo-checkbox')

            await checkbox.setChecked(true)
            await wrapper.vm.$nextTick()

            const todoItem = wrapper.find('.todo-item')
            expect(todoItem.classes()).toContain('completed')
        })

        it('完了時、アイテムの透明度が変わること', async () => {
            const checkbox = wrapper.find('.todo-checkbox')

            await checkbox.setChecked(true)
            await wrapper.vm.$nextTick()

            const todoItem = wrapper.find('.todo-item')
            expect(todoItem.classes()).toContain('completed')
        })

        it('未完了に戻すことができること', async () => {
            wrapper.vm.todos[0].is_completed = true
            await wrapper.vm.$nextTick()

            const checkbox = wrapper.find('.todo-checkbox')
            await checkbox.setChecked(false)
            await wrapper.vm.$nextTick()

            expect(wrapper.vm.todos[0].is_completed).toBe(false)
        })
    })

    describe('4. TODO削除テスト', () => {
        beforeEach(async () => {
            const mockTodos = [
                { id: 1, title: 'テストTODO', is_completed: false }
            ]

            mock.onGet('http://localhost:3000/api/v1/todos').reply(200, mockTodos)
            mock.onDelete('http://localhost:3000/api/v1/todos/1').reply(204)

            wrapper = mount(App)
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 0))
        })

        it('削除ボタンクリックで確認ダイアログが表示されること', async () => {
            global.confirm.mockReturnValue(false)

            const deleteBtn = wrapper.find('.delete-btn')
            await deleteBtn.trigger('click')

            expect(global.confirm).toHaveBeenCalledWith('Delete this todo?')
        })

        it('確認後、TODOがリストから削除されること', async () => {
            global.confirm.mockReturnValue(true)

            const deleteBtn = wrapper.find('.delete-btn')
            await deleteBtn.trigger('click')
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 0))

            expect(wrapper.vm.todos).toHaveLength(0)
        })

        it('キャンセル時、TODOが削除されないこと', async () => {
            global.confirm.mockReturnValue(false)

            const deleteBtn = wrapper.find('.delete-btn')
            await deleteBtn.trigger('click')
            await wrapper.vm.$nextTick()

            expect(wrapper.vm.todos).toHaveLength(1)
        })
    })

    describe('5. エラーハンドリングテスト', () => {
        it('API取得エラー時、エラーメッセージが表示されること', async () => {
            mock.onGet('http://localhost:3000/api/v1/todos').reply(500)

            wrapper = mount(App)
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 0))

            expect(global.alert).toHaveBeenCalledWith('Failed to fetch todos')
        })

        it('TODO追加エラー時、エラーメッセージが表示されること', async () => {
            mock.onPost('http://localhost:3000/api/v1/todos').reply(500)

            wrapper = mount(App)
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 0))

            const input = wrapper.find('.todo-input')
            const button = wrapper.find('.add-btn')

            await input.setValue('新しいTODO')
            await button.trigger('click')
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 0))

            expect(global.alert).toHaveBeenCalledWith('Failed to create todo')
        })

        it('TODO更新エラー時、状態が元に戻ること', async () => {
            const mockTodos = [
                { id: 1, title: 'テストTODO', is_completed: false }
            ]
        
            mock.onGet('http://localhost:3000/api/v1/todos').reply(200, mockTodos)
            mock.onPut('http://localhost:3000/api/v1/todos/1').reply(500)

            wrapper = mount(App)
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 0))

            const checkbox = wrapper.find('.todo-checkbox')
            await checkbox.setChecked(true)
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 0))

            expect(global.alert).toHaveBeenCalledWith('Failed to update todo')
            expect(wrapper.vm.todos[0].is_completed).toBe(false)
        })

        it('TODO削除エラー時、エラーメッセージが表示されること', async () => {
            const mockTodos = [
                { id: 1, title: 'テストTODO', is_completed: false }
            ]

            mock.onGet('http://localhost:3000/api/v1/todos').reply(200, mockTodos)
            mock.onDelete('http://localhost:3000/api/v1/todos/1').reply(500)
            global.confirm.mockReturnValue(true)

            wrapper = mount(App)
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 0))

            const deleteBtn = wrapper.find('.delete-btn')
            await deleteBtn.trigger('click')
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 0))

            expect(global.alert).toHaveBeenCalledWith('Failed to delete todo')
        })
    })
})