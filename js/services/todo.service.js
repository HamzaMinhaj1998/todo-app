import ApiAdapter from './storage.adapter.js';

class TodoService {
  constructor() {
    this.api = new ApiAdapter('todos');
  }

  async getTodos(userId) {
    if (!userId) throw new Error('User ID required');
    // MockAPI supports filtering by relational ID if schema ends in Id,
    // usually ?userId=... works fine.
    return await this.api.query({ userId: userId });
  }

  async getAllTodos() {
    return await this.api.getAll();
  }

  async createTodo(userId, username, title, description) {
    if (!userId) throw new Error('User ID required');
    return await this.api.create({
      userId,
      username,
      title,
      description,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    });
  }

  async updateTodo(id, updates) {
    return await this.api.update(id, updates);
  }

  async deleteTodo(id) {
    return await this.api.delete(id);
  }

  async getTodoById(id) {
    return await this.api.getById(id);
  }
}

export const todoService = new TodoService();
