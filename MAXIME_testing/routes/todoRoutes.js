import express from 'express';
import {
    getAllTodos,
    getTodoById,
    createTodo,
    updateTodo,
    //deleteTodo,
    //toggleTodoComplete
} from '../controllers/todoController.js';

const router = express.Router();

router.route('/')
    .get(getAllTodos)
    .post(createTodo);

router.route('/:id')
    .get(getTodoById)
    .put(updateTodo)
    //.delete(deleteTodo);

//router.route('/:id/toggle')
    //.patch(toggleTodoComplete);

export default router;
