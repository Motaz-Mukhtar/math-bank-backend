import { QuizRepository } from './quiz.repository';
import { StartSessionDto, SubmitAnswerDto } from './quiz.schema';
import { ApiError } from '../../utils/ApiError';

// Quiz session always has 10 questions
const QUIZ_SESSION_LENGTH = 10;

// Points awarded based on level: EASY=5, MEDIUM=10, HARD=15
const POINTS_BY_LEVEL = {
  EASY: 5,
  MEDIUM: 10,
  HARD: 15,
};

export class QuizService {
  private repository: QuizRepository;

  constructor() {
    this.repository = new QuizRepository();
  }

  /**
   * Start new quiz session
   * Fetches 10 random questions and returns sessionId + first question
   */
  async startSession(userId: string, data: StartSessionDto) {
    // Create session
    const session = await this.repository.createSession({
      userId,
      category: data.category,
      level: data.level,
    });

    // Get 10 random questions for this category and level
    const questions = await this.repository.getRandomQuestions(
      data.category,
      data.level,
      QUIZ_SESSION_LENGTH
    );

    if (questions.length === 0) {
      throw new ApiError(404, 'لا توجد أسئلة متاحة لهذه الفئة والمستوى');
    }

    if (questions.length < QUIZ_SESSION_LENGTH) {
      throw new ApiError(
        400,
        `عدد الأسئلة المتاحة (${questions.length}) أقل من المطلوب (${QUIZ_SESSION_LENGTH})`
      );
    }

    // Return session info + first question (without answer)
    const firstQuestion = questions[0];

    return {
      sessionId: session.id,
      category: session.category,
      level: session.level,
      totalQuestions: QUIZ_SESSION_LENGTH,
      currentQuestion: 1,
      question: {
        id: firstQuestion.id,
        text: firstQuestion.text,
        options: firstQuestion.options as string[],
        category: firstQuestion.category,
        level: firstQuestion.level,
        points: firstQuestion.points,
      },
    };
  }

  /**
   * Get next unanswered question in the session
   */
  async getNextQuestion(sessionId: string) {
    // Get session with all items
    const session = await this.repository.getSession(sessionId);
    if (!session) {
      throw new ApiError(404, 'الجلسة غير موجودة');
    }

    if (session.isComplete) {
      throw new ApiError(400, 'الجلسة مكتملة بالفعل');
    }

    // Get answered question IDs
    const answeredIds = await this.repository.getAnsweredQuestionIds(sessionId);

    // Get all questions for this session
    const allQuestions = await this.repository.getRandomQuestions(
      session.category,
      session.level,
      QUIZ_SESSION_LENGTH
    );

    // Find first unanswered question
    const nextQuestion = allQuestions.find((q) => !answeredIds.includes(q.id));

    if (!nextQuestion) {
      throw new ApiError(404, 'لا توجد أسئلة متبقية في هذه الجلسة');
    }

    return {
      currentQuestion: answeredIds.length + 1,
      totalQuestions: QUIZ_SESSION_LENGTH,
      question: {
        id: nextQuestion.id,
        text: nextQuestion.text,
        options: nextQuestion.options as string[],
        category: nextQuestion.category,
        level: nextQuestion.level,
        points: nextQuestion.points,
      },
    };
  }

  /**
   * Submit answer for quiz question
   * Awards points based on level if correct
   * Returns isCorrect, pointsEarned, newTotal, isSessionComplete
   */
  async submitAnswer(sessionId: string, data: SubmitAnswerDto) {
    // Verify session exists
    const session = await this.repository.getSession(sessionId);
    if (!session) {
      throw new ApiError(404, 'الجلسة غير موجودة');
    }

    if (session.isComplete) {
      throw new ApiError(400, 'الجلسة مكتملة بالفعل');
    }

    // Get question
    const question = await this.repository.prisma.question.findUnique({
      where: { id: data.questionId },
    });

    if (!question) {
      throw new ApiError(404, 'السؤال غير موجود');
    }

    // Check if question was already answered in this session
    const answeredQuestionIds = await this.repository.getAnsweredQuestionIds(sessionId);
    if (answeredQuestionIds.includes(data.questionId)) {
      throw new ApiError(400, 'تم الإجابة على هذا السؤال بالفعل');
    }

    // Check answer
    const isCorrect = data.userAnswer.trim() === question.answer.trim();
    const pointsEarned = isCorrect ? POINTS_BY_LEVEL[question.level] : 0;

    // Save quiz item and update points (atomic transaction)
    const { newTotal, sessionScore } = await this.repository.saveQuizItem({
      sessionId,
      questionId: data.questionId,
      userAnswer: data.userAnswer,
      isCorrect,
      pointsEarned,
    });

    // Check if session is complete (all 10 questions answered)
    const isSessionComplete = answeredQuestionIds.length + 1 >= QUIZ_SESSION_LENGTH;

    return {
      isCorrect,
      pointsEarned,
      newTotal,
      sessionScore,
      correctAnswer: question.answer,
      isSessionComplete,
      questionsAnswered: answeredQuestionIds.length + 1,
      totalQuestions: QUIZ_SESSION_LENGTH,
    };
  }

  /**
   * Complete session and return summary
   */
  async completeSession(sessionId: string) {
    // Get session
    const session = await this.repository.getSession(sessionId);
    if (!session) {
      throw new ApiError(404, 'الجلسة غير موجودة');
    }

    if (session.isComplete) {
      throw new ApiError(400, 'الجلسة مكتملة بالفعل');
    }

    // Check if all questions answered
    const answeredCount = session.items.length;
    if (answeredCount < QUIZ_SESSION_LENGTH) {
      throw new ApiError(
        400,
        `يجب الإجابة على جميع الأسئلة (${answeredCount}/${QUIZ_SESSION_LENGTH})`
      );
    }

    // Mark session as complete
    const completedSession = await this.repository.completeSession(sessionId);

    // Calculate summary
    const correctCount = completedSession.items.filter((item) => item.isCorrect).length;
    const incorrectCount = completedSession.items.length - correctCount;

    return {
      sessionId: completedSession.id,
      category: completedSession.category,
      level: completedSession.level,
      totalScore: completedSession.totalScore,
      correctCount,
      incorrectCount,
      totalQuestions: completedSession.items.length,
      completedAt: completedSession.completedAt,
    };
  }

  /**
   * Get user's quiz history
   */
  async getUserHistory(userId: string) {
    const sessions = await this.repository.getUserHistory(userId);

    return sessions.map((session) => {
      const correctCount = session.items.filter((item) => item.isCorrect).length;
      const incorrectCount = session.items.length - correctCount;

      return {
        sessionId: session.id,
        category: session.category,
        level: session.level,
        totalScore: session.totalScore,
        correctCount,
        incorrectCount,
        totalQuestions: session.items.length,
        completedAt: session.completedAt,
      };
    });
  }
}
