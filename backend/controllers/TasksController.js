const User = require('../models/User');
const Tasks = require('../models/Tasks');

const getTasks = async (req, res) => {
    try {
        console.log("Pobieranie zadań użytkownika");
        const userId = req.user.userId; 
        console.log(`Rozpoczęto pobieranie danych użytkownika: ${userId}`);

        const user = await User.findById(userId).select('tasks_progress');
        if (!user) {
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony.' });
        }

        const progress = user.tasks_progress[0] || {};

        const tasks = await Tasks.find();

        const tasksWithProgress = tasks.map(task => {
            const taskProgress = progress[`id_${task.id_task}`] || 0;
            return {
                id_task: task.id_task,
                title: task.title,
                task: task.task, 
                possible_progress: task.possible_progress,
                user_progress: taskProgress,
                date: task.date
            };
        });
        
        res.status(200).json({
            message: "Pomyślnie pobrano zadania użytkownika",
            tasks: tasksWithProgress
        });

    } catch (error) {
        console.error('Błąd pobierania zadań użytkownika:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas pobierania zadań użytkownika.' });
    }
};

module.exports = { getTasks };
