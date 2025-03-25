const mongoose = require('mongoose');

const tasksSchema = new mongoose.Schema({
    level: {type: Number, required: true},
    id_task: { type: Number, required: true, unique: true },
    title: { type: String, required: true, unique: true  },
    task: { type: String, required: true },
    possible_progress: { type: Number, required: true},
    date: { type: Date, required: true },
});

const Tasks = mongoose.model('Tasks', tasksSchema);

module.exports = Tasks;