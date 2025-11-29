import UserProgress from '../models/UserProgress';

export const checkLessonCompleted = async (userId: number, lessonId: number): Promise<boolean> => {
    const progress = await UserProgress.findOne({
        where: { userId, lessonId, isCompleted: true }
    });
    return !!progress;
};

export const markLessonCompleted = async (userId: number, lessonId: number, stats: { timeSpent: number, score?: number }): Promise<{ isNewCompletion: boolean, progress: UserProgress }> => {
    const [progress, created] = await UserProgress.findOrCreate({
        where: { userId, lessonId },
        defaults: {
            userId,
            lessonId,
            isCompleted: true,
            completedAt: new Date(),
            timeSpentMinutes: stats.timeSpent,
            score: stats.score || 0,
            attempts: 1
        }
    });

    let isNewCompletion = created;

    if (!created) {
        // If already existed but wasn't completed (unlikely with isCompleted: true in where, but possible if we change logic)
        if (!progress.isCompleted) {
            progress.isCompleted = true;
            progress.completedAt = new Date();
            isNewCompletion = true;
        }

        progress.attempts += 1;
        progress.timeSpentMinutes += stats.timeSpent;
        // Keep highest score
        if (stats.score && stats.score > (progress.score || 0)) {
            progress.score = stats.score;
        }
        await progress.save();
    }

    return { isNewCompletion, progress };
};
