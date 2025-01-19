const PRIORITY_MAP = { 1: 'low', 2: 'medium', 3: 'high' };

async function updatePriorities() {
    try {
        connectDB();
        console.log('Connected to the database.');

        const tasks = await Task.find();
        for (const task of tasks) {
            if (typeof task.priority === 'number') {
                const updatedPriority = PRIORITY_MAP[task.priority];
                if (updatedPriority) {
                    task.priority = updatedPriority;
                    await task.save();
                    console.log(`Updated task ${task._id} to priority ${updatedPriority}`);
                }
            }
        }

        console.log('Priorities updated successfully.');
        process.exit();
    } catch (error) {
        console.error('Error updating priorities:', error.message);
        process.exit(1);
    }
}

updatePriorities();
