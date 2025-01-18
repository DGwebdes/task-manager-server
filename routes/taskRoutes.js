const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/taskModel');
const taskRouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const errorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

taskRouter.use(authMiddleware);
taskRouter.get('/',  async (req, res) => {
    try {
        const filters = {};
        const { priority, completed, dueDate } = req.query;

        if (priority) filters.priority = priority;
        if (completed) filters.completed = completed;
        if (dueDate) filters.dueDate = { $lte: new Date(dueDate) };

        const tasks = await Task.find({ user: req.user.userId, ...filters });

        res.status(200).json(tasks);
    } catch (err) {
        logger.error('Error fetching tasks', {error: err.message});
        errorResponse(res, 500, 'Error fetching Tasks', err.message);
    }
});

taskRouter.post('/', async (req, res) => {
    try {
        const { title, description, dueDate, priority } = req.body;

        if (!title){
            logger.warn('Failed to identify a title', { title });
            return errorResponse(res, 400, 'Title is Required');
        }
        if (new Date(dueDate) <= new Date()){
            return errorResponse(res, 400, 'Date must be in the Future');
        }
        const newTask = await Task.create({ title, description, dueDate, priority, user: req.user.userId });
        res.status(201).json(newTask);

    } catch (err) {
        errorResponse(res, 500, 'Error creating task', err.message);
    }
});

taskRouter.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            logger.warn('Cannot find task by Id', { id });
            return errorResponse(res, 400, 'Invalid task ID');
        }
        if (!updates.title){
            logger.warn('Failed to identify a title', { title });
            return errorResponse(res, 400, 'Title is Required');
        }

        const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!updatedTask){
            logger.warn('Failed to update task', { id });
            return errorResponse(res, 400, 'Failed to updated task');
        }

        res.status(200).json(updatedTask)
    } catch (err) {
        logger.error('Error updating task', {error: err.message})
        errorResponse(res, 500, 'Error updating task', err.message);
    }
});

taskRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            logger.warn('failed to delete task by Id', { id });
            return errorResponse(res, 400, 'Invalid task ID')
        }
        const deleteTask = await Task.findByIdAndDelete(id);
        if (!deleteTask) {
            logger.warn('Failed to delete task', { id });
            return errorResponse(res, 404, 'Task not Found')
        }

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (err) {
        logger.error('Error deleting task', {error: err.message})
        errorResponse(res, 500, 'Error deleting task', err.message);
    }
});

taskRouter.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { completed } = req.body;

        if (typeof completed !== "boolean") {
            logger.warn('Invalid completed status', { completed });
            return errorResponse(res, 400, 'Completed must be a boolean');
        }

        const task = await Task.findOne({ _id: id, user: req.user.userId });
        if (!task) {
            logger.warn('Failed to update task status', { id });
            return errorResponse(res, 404, 'Task not Found');
        }
        task.completed = completed;
        await task.save();

        res.status(200).json({
            message: `Task marked as ${completed ? 'Completed' : 'Incomplete'}`,
            task: task
        })
    } catch (error) {
        logger.error('Error updating task status', {error: error.message})
        errorResponse(res, 500, 'Error updating task status', err.message);
    }
});


module.exports = taskRouter;