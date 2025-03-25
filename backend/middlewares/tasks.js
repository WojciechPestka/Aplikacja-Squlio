const User = require('../models/User');
const Tasks = require('../models/Tasks');

const taskProgress = async (userId, eventType, details) => {
    console.log('========== POSTĘP UŻYTKOWNIKA ==========');
    console.log(`User ID: ${userId}`);
    console.log(`Zdarzenie: ${eventType}`);
    console.log('Szczegóły:', details);
    console.log('=========================================');

    try {
        let user = await User.findById(userId);
        if (!user) {
            console.log('Użytkownik nie znaleziony');
            return;
        }

        if (!user.tasks_progress || user.tasks_progress.length === 0) {
            user.tasks_progress = [{}];
        }

        const taskUpdates = {};

        const updateTaskProgress = async (taskId, increment, max, resetOnFail = false) => {
            const taskKey = `id_${taskId}`;
            const currentProgress = user.tasks_progress[0][taskKey] || 0;

            if (resetOnFail && currentProgress < max) {
                taskUpdates[`tasks_progress.0.${taskKey}`] = 0;
            } else {
                taskUpdates[`tasks_progress.0.${taskKey}`] = Math.min(currentProgress + increment, max);
            }

            // Get the current task's level
            const currentTask = await Tasks.findOne({ id_task: taskId });
            if (!currentTask) return;

            // Get all tasks from the same level
            const levelTasks = await Tasks.find({ level: currentTask.level });
            
            // Check if all tasks from this level are completed
            const allTasksCompleted = levelTasks.every(task => {
                const taskProgress = user.tasks_progress[0][`id_${task.id_task}`] || 0;
                let progressPlusIncrement = parseInt(taskProgress) + parseInt(increment)
                return progressPlusIncrement >= task.possible_progress;
            });

            // If all tasks are completed, add an extracoin
            if (allTasksCompleted && !user.extracoinsgiven.includes(currentTask.level)) {
                user.extracoins = (user.extracoins || 0) + 1;
                user.extracoinsgiven.push(currentTask.level);
                await user.save();
                console.log(`Awarded +1 extracoin for completing all tasks in level ${currentTask.level}`);
            } else {
                console.log(`Not all tasks in level ${currentTask.level} are completed yet or award already given`);
            }
        };

        switch (eventType) {
            case 'answered_question':
                if (details.isCorrect) {
                    const domainMapping = {
                        Programing: "correct_programmingQuestion",
                        Math: "correct_mathsQuestion",
                        English: "correct_englishQuestion",
                        Science: "correct_scienceQuestion"
                    };

                    const thresholds = [
                        { threshold: 1, taskId: 1, max: 4 },
                        { threshold: 2, taskId: 6, max: 8 },
                        { threshold: 10, taskId: 11, max: 40 },
                        { threshold: 20, taskId: 16, max: 80 },
                        { threshold: 100, taskId: 21, max: 400 }
                    ];

                    if (details.isCorrect) {
                        const domainKey = domainMapping[details.questionDomain];
                        if (domainKey) {
                            thresholds.forEach(({ threshold, taskId, max }) => {
                                if (details[domainKey] <= threshold) {
                                    updateTaskProgress(taskId, 1, max);
                                }
                            });
                        }
                    }

                    updateTaskProgress(7, 1, 2);
                    updateTaskProgress(12, 1, 3);
                    updateTaskProgress(17, 1, 4);
                    updateTaskProgress(23, 1, 20);

                }
                if (!details.isCorrect) {
                    updateTaskProgress(7, 0, 2, true);
                    updateTaskProgress(12, 0, 3, true);
                    updateTaskProgress(17, 0, 4, true);
                    updateTaskProgress(23, 0, 20, true);
                }
                break;
            case 'finished_dailyQuiz':
                updateTaskProgress(5, 1, 1);
                updateTaskProgress(18, 1, 3);
                break;
            case 'break_in_dailyQuiz':
                updateTaskProgress(18, 0, 3, true);
                break;
            case 'new_difficulty':
                switch (details.newDifficulty) {
                    case 2:
                        updateTaskProgress(2, 1, 1);
                        break
                    case 3:
                        updateTaskProgress(13, 1, 1);
                        break
                    case 4:
                        updateTaskProgress(20, 1, 1);
                        break
                    case 5:
                        updateTaskProgress(22, 1, 1);
                        break
                }
                break;
            case 'high_elo':
                updateTaskProgress(25, 0, 4, true);
                updateTaskProgress(25, details.HighElo, 4);
                break;
            case 'skin_clothes':
                updateTaskProgress(3, 1, 1);
                updateTaskProgress(14, 1, 3);
                break;
            case 'dressed_skins':
                const isFullyDressed = details.headSkin && details.armSkin && details.legSkin;

                if (!isFullyDressed) {
                    updateTaskProgress(14, 0, 3, true);
                } else {
                    updateTaskProgress(14, 3, 3); 
                }
                break;
            case 'skin_purchased':
                updateTaskProgress(4, 1, 1);
                updateTaskProgress(10, 1, 2);
                break;
            case 'available_items':
                if (details.availableItems == 0) {
                    updateTaskProgress(24, 1, 1);
                }
                break;
            case 'level_up':
                if (details.newLevel >= 5) {
                    updateTaskProgress(15, 1, 1);
                }
                break;
            case 'task_level':
                if (details.taskLevel >= 2) {
                    updateTaskProgress(8, 1, 1);
                }
                if (details.taskLevel >= 3) {
                    updateTaskProgress(9, 1, 1);
                }
                break;
            case 'earned_money':
                updateTaskProgress(19, details.amount, 1000);
                break;
            default:
                break;
        }

        if (Object.keys(taskUpdates).length > 0) {
            await User.findByIdAndUpdate(userId, { $set: taskUpdates }, { new: true });
            console.log('Zaktualizowano progres użytkownika.');
        }

    } catch (error) {
        console.error('Błąd podczas aktualizacji progresu użytkownika:', error);
    }
};




// taskProgress(user._id, 'skin_purchased', { skinPurchased: item.name });
// taskProgress(user._id, 'available_items', { availableItems: availableItems });
// taskProgress(user._id, 'skin_clothes', { skinClothes: item.name });
// taskProgress(user._id, 'dressed_skins', {
//     headSkin: user.headSkin,
//     armSkin: user.armSkin,
//     legSkin: user.legSkin
// });
// taskProgress(user._id, 'level_up', { newLevel: user.level });
// taskProgress(user._id, 'answered_question', {
//     questionId,
//     isCorrect,
//     newElo: user.programmingQuestionElo,
//     newCoins: user.coins,
//     newExp: user.exp,
//     newLevel: user.level,
//     hp: user.hp
// });
// taskProgress(user._id, 'earned_money', { amount: rewards.coins });
// taskProgress(user._id, 'new_difficulty', { newDifficulty: getLevelByElo(user.programmingQuestionElo) });
// taskProgress(user._id, 'task_level', { taskLevel: level });
// taskProgress(user._id, 'finished_dailyQuiz', { unansweredQuestions: unansweredQuestions.length });
// taskProgress(user._id, 'break_in_dailyQuiz', { differenceInDays: differenceInDays});
// taskProgress(user._id, 'high_elo', { HighElo: countHighElo(user) });

module.exports = { taskProgress };
