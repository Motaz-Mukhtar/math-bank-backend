import { WheelRepository } from './wheel.repository';
import { SpinDto, SubmitAnswerDto } from './wheel.schema';
import { ApiError } from '../../utils/ApiError';
import { QuizCategory } from '@prisma/client';

// Wheel quiz always awards 10 points per correct answer
const WHEEL_POINTS_PER_CORRECT = 10;

export class WheelService {
  private repository: WheelRepository;

  constructor() {
    this.repository = new WheelRepository();
  }

  /**
   * Start new wheel session
   */
  async startSession(userId: string) {
    const session = await this.repository.createSession(userId);

    return {
      sessionId: session.id,
      createdAt: session.createdAt,
    };
  }

  /**
   * Spin the wheel and get a random question from the category
   * Excludes questions already asked in this session
   * Returns question WITHOUT the answer field
   */
  async spin(sessionId: string, data: SpinDto) {
    // Verify session exists
    const session = await this.repository.getSession(sessionId);
    if (!session) {
      throw new ApiError(404, 'الجلسة غير موجودة');
    }

    // Get available questions for this category
    const availableQuestions = await this.repository.getAvailableQuestions(
      sessionId,
      data.category
    );

    if (availableQuestions.length === 0) {
      throw new ApiError(404, 'لا توجد أسئلة متاحة في هذه الفئة');
    }

    // Pick random question
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const question = availableQuestions[randomIndex];

    // Return question WITHOUT answer field
    return {
      id: question.id,
      text: question.text,
      options: question.options as string[],
      category: question.category,
      level: question.level,
      points: WHEEL_POINTS_PER_CORRECT, // Always 10 points for wheel
    };
  }

  /**
   * Submit answer for wheel question
   * Awards points if correct
   * Returns isCorrect, pointsEarned, newTotal
   */
  async submitAnswer(sessionId: string, data: SubmitAnswerDto) {
    // Verify session exists
    const session = await this.repository.getSession(sessionId);
    if (!session) {
      throw new ApiError(404, 'الجلسة غير موجودة');
    }

    // Get question
    const question = await this.repository.prisma.question.findUnique({
      where: { id: data.questionId },
    });

    if (!question) {
      throw new ApiError(404, 'السؤال غير موجود');
    }

    // Check if question was already answered in this session
    const askedQuestionIds = await this.repository.getAskedQuestionIds(sessionId);
    if (askedQuestionIds.includes(data.questionId)) {
      throw new ApiError(400, 'تم الإجابة على هذا السؤال بالفعل');
    }

    // Check answer
    const isCorrect = data.userAnswer.trim() === question.answer.trim();
    const pointsEarned = isCorrect ? WHEEL_POINTS_PER_CORRECT : 0;

    // Save wheel item and update points (atomic transaction)
    const { newTotal } = await this.repository.saveWheelItem({
      sessionId,
      questionId: data.questionId,
      category: question.category,
      userAnswer: data.userAnswer,
      isCorrect,
      pointsEarned,
    });

    return {
      isCorrect,
      pointsEarned,
      newTotal,
      correctAnswer: question.answer, // Return correct answer for feedback
    };
  }
}
