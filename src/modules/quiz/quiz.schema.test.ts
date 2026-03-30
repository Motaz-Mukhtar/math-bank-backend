import { describe, it, expect } from 'vitest';
import { QuestionType, QuizCategory, QuizLevel } from '@prisma/client';
import {
  mcqQuestionSchema,
  fillBlankQuestionSchema,
  sortOrderQuestionSchema,
  matchingQuestionSchema,
  visualMcqQuestionSchema,
  clockReadQuestionSchema,
  questionSchema,
} from './quiz.schema';

describe('MCQ Question Schema', () => {
  const validMCQBase = {
    text: 'ما هو ناتج 2 + 2؟',
    questionType: QuestionType.MCQ,
    category: QuizCategory.ADDITION,
    level: QuizLevel.EASY,
    points: 5,
  };

  it('should validate a valid MCQ question', () => {
    const data = {
      ...validMCQBase,
      options: ['٢', '٣', '٤', '٥'],
      answer: '٤',
    };
    expect(() => mcqQuestionSchema.parse(data)).not.toThrow();
  });

  it('should reject MCQ with less than 4 options', () => {
    const data = {
      ...validMCQBase,
      options: ['٢', '٣', '٤'],
      answer: '٤',
    };
    expect(() => mcqQuestionSchema.parse(data)).toThrow();
  });

  it('should reject MCQ with more than 4 options', () => {
    const data = {
      ...validMCQBase,
      options: ['٢', '٣', '٤', '٥', '٦'],
      answer: '٤',
    };
    expect(() => mcqQuestionSchema.parse(data)).toThrow();
  });

  it('should reject MCQ with answer not in options', () => {
    const data = {
      ...validMCQBase,
      options: ['٢', '٣', '٤', '٥'],
      answer: '٦',
    };
    expect(() => mcqQuestionSchema.parse(data)).toThrow(/الإجابة يجب أن تكون من ضمن الخيارات/);
  });

  it('should reject MCQ with empty option', () => {
    const data = {
      ...validMCQBase,
      options: ['٢', '', '٤', '٥'],
      answer: '٤',
    };
    expect(() => mcqQuestionSchema.parse(data)).toThrow();
  });

  it('should reject MCQ with empty answer', () => {
    const data = {
      ...validMCQBase,
      options: ['٢', '٣', '٤', '٥'],
      answer: '',
    };
    expect(() => mcqQuestionSchema.parse(data)).toThrow();
  });
});

describe('Fill Blank Question Schema', () => {
  const validFillBlankBase = {
    text: 'أكمل الفراغ',
    questionType: QuestionType.FILL_BLANK,
    category: QuizCategory.ADDITION,
    level: QuizLevel.EASY,
    points: 5,
  };

  it('should validate a valid fill blank question with numeric pad', () => {
    const data = {
      ...validFillBlankBase,
      options: {
        before: '٢ + ٢ = ',
        after: '',
        pad: 'numeric' as const,
      },
      answer: '٤',
    };
    expect(() => fillBlankQuestionSchema.parse(data)).not.toThrow();
  });

  it('should validate a valid fill blank question with fraction pad', () => {
    const data = {
      ...validFillBlankBase,
      options: {
        before: 'نصف = ',
        after: '',
        pad: 'fraction' as const,
      },
      answer: '1/2',
    };
    expect(() => fillBlankQuestionSchema.parse(data)).not.toThrow();
  });

  it('should validate fill blank with after text', () => {
    const data = {
      ...validFillBlankBase,
      options: {
        before: '٢ + ',
        after: ' = ٥',
        pad: 'numeric' as const,
      },
      answer: '٣',
    };
    expect(() => fillBlankQuestionSchema.parse(data)).not.toThrow();
  });

  it('should reject fill blank with invalid pad type', () => {
    const data = {
      ...validFillBlankBase,
      options: {
        before: '٢ + ٢ = ',
        after: '',
        pad: 'invalid' as any,
      },
      answer: '٤',
    };
    expect(() => fillBlankQuestionSchema.parse(data)).toThrow(/نوع الإدخال يجب أن يكون numeric أو fraction/);
  });

  it('should reject fill blank with empty answer', () => {
    const data = {
      ...validFillBlankBase,
      options: {
        before: '٢ + ٢ = ',
        after: '',
        pad: 'numeric' as const,
      },
      answer: '',
    };
    expect(() => fillBlankQuestionSchema.parse(data)).toThrow();
  });
});

describe('Sort Order Question Schema', () => {
  const validSortOrderBase = {
    text: 'رتب الأرقام من الأصغر إلى الأكبر',
    questionType: QuestionType.SORT_ORDER,
    category: QuizCategory.COMPARISON,
    level: QuizLevel.MEDIUM,
    points: 10,
  };

  it('should validate a valid sort order question', () => {
    const data = {
      ...validSortOrderBase,
      options: {
        items: ['٥', '٢', '٨', '٣'],
        instruction: 'رتب من الأصغر إلى الأكبر',
        slots: 4,
      },
      answer: '٢, ٣, ٥, ٨',
    };
    expect(() => sortOrderQuestionSchema.parse(data)).not.toThrow();
  });

  it('should reject sort order with less than 3 items', () => {
    const data = {
      ...validSortOrderBase,
      options: {
        items: ['٥', '٢'],
        instruction: 'رتب من الأصغر إلى الأكبر',
        slots: 2,
      },
      answer: '٢, ٥',
    };
    expect(() => sortOrderQuestionSchema.parse(data)).toThrow(/يجب أن يكون هناك 3 عناصر على الأقل/);
  });

  it('should reject sort order with more than 5 items', () => {
    const data = {
      ...validSortOrderBase,
      options: {
        items: ['٥', '٢', '٨', '٣', '٧', '٩'],
        instruction: 'رتب من الأصغر إلى الأكبر',
        slots: 6,
      },
      answer: '٢, ٣, ٥, ٧, ٨, ٩',
    };
    expect(() => sortOrderQuestionSchema.parse(data)).toThrow(/يجب أن يكون هناك 5 عناصر كحد أقصى/);
  });

  it('should reject sort order with answer missing items', () => {
    const data = {
      ...validSortOrderBase,
      options: {
        items: ['٥', '٢', '٨', '٣'],
        instruction: 'رتب من الأصغر إلى الأكبر',
        slots: 4,
      },
      answer: '٢, ٣, ٥',
    };
    expect(() => sortOrderQuestionSchema.parse(data)).toThrow(/الإجابة يجب أن تحتوي على جميع العناصر/);
  });

  it('should reject sort order with answer containing invalid items', () => {
    const data = {
      ...validSortOrderBase,
      options: {
        items: ['٥', '٢', '٨', '٣'],
        instruction: 'رتب من الأصغر إلى الأكبر',
        slots: 4,
      },
      answer: '٢, ٣, ٥, ٩',
    };
    expect(() => sortOrderQuestionSchema.parse(data)).toThrow(/الإجابة يجب أن تحتوي على جميع العناصر/);
  });

  it('should reject sort order with empty item', () => {
    const data = {
      ...validSortOrderBase,
      options: {
        items: ['٥', '', '٨', '٣'],
        instruction: 'رتب من الأصغر إلى الأكبر',
        slots: 4,
      },
      answer: '٣, ٥, ٨',
    };
    expect(() => sortOrderQuestionSchema.parse(data)).toThrow();
  });
});

describe('Matching Question Schema', () => {
  const validMatchingBase = {
    text: 'طابق الأرقام مع الكلمات',
    questionType: QuestionType.MATCHING,
    category: QuizCategory.PLACE_VALUE,
    level: QuizLevel.MEDIUM,
    points: 12,
  };

  it('should validate a valid matching question', () => {
    const data = {
      ...validMatchingBase,
      options: {
        pairs: [
          { left: '١', right: 'واحد' },
          { left: '٢', right: 'اثنان' },
          { left: '٣', right: 'ثلاثة' },
          { left: '٤', right: 'أربعة' },
        ],
      },
      answer: '١:واحد|٢:اثنان|٣:ثلاثة|٤:أربعة',
    };
    expect(() => matchingQuestionSchema.parse(data)).not.toThrow();
  });

  it('should reject matching with less than 4 pairs', () => {
    const data = {
      ...validMatchingBase,
      options: {
        pairs: [
          { left: '١', right: 'واحد' },
          { left: '٢', right: 'اثنان' },
          { left: '٣', right: 'ثلاثة' },
        ],
      },
      answer: '١:واحد|٢:اثنان|٣:ثلاثة',
    };
    expect(() => matchingQuestionSchema.parse(data)).toThrow(/يجب أن يكون هناك 4 أزواج بالضبط/);
  });

  it('should reject matching with more than 4 pairs', () => {
    const data = {
      ...validMatchingBase,
      options: {
        pairs: [
          { left: '١', right: 'واحد' },
          { left: '٢', right: 'اثنان' },
          { left: '٣', right: 'ثلاثة' },
          { left: '٤', right: 'أربعة' },
          { left: '٥', right: 'خمسة' },
        ],
      },
      answer: '١:واحد|٢:اثنان|٣:ثلاثة|٤:أربعة|٥:خمسة',
    };
    expect(() => matchingQuestionSchema.parse(data)).toThrow(/يجب أن يكون هناك 4 أزواج بالضبط/);
  });

  it('should reject matching with empty left value', () => {
    const data = {
      ...validMatchingBase,
      options: {
        pairs: [
          { left: '', right: 'واحد' },
          { left: '٢', right: 'اثنان' },
          { left: '٣', right: 'ثلاثة' },
          { left: '٤', right: 'أربعة' },
        ],
      },
      answer: ':واحد|٢:اثنان|٣:ثلاثة|٤:أربعة',
    };
    expect(() => matchingQuestionSchema.parse(data)).toThrow();
  });

  it('should reject matching with empty right value', () => {
    const data = {
      ...validMatchingBase,
      options: {
        pairs: [
          { left: '١', right: '' },
          { left: '٢', right: 'اثنان' },
          { left: '٣', right: 'ثلاثة' },
          { left: '٤', right: 'أربعة' },
        ],
      },
      answer: '١:|٢:اثنان|٣:ثلاثة|٤:أربعة',
    };
    expect(() => matchingQuestionSchema.parse(data)).toThrow();
  });
});

describe('Visual MCQ Question Schema', () => {
  const validVisualMCQBase = {
    text: 'اختر الشكل الذي يمثل النصف',
    questionType: QuestionType.VISUAL_MCQ,
    category: QuizCategory.FRACTIONS,
    level: QuizLevel.MEDIUM,
    points: 10,
  };

  it('should validate a valid visual MCQ question', () => {
    const data = {
      ...validVisualMCQBase,
      options: {
        svgType: 'FRACTION_CIRCLE' as const,
        choices: [
          { params: { numerator: 1, denominator: 2 }, label: 'نصف' },
          { params: { numerator: 1, denominator: 3 }, label: 'ثلث' },
          { params: { numerator: 1, denominator: 4 }, label: 'ربع' },
          { params: { numerator: 3, denominator: 4 }, label: 'ثلاثة أرباع' },
        ],
      },
      answer: '0',
    };
    expect(() => visualMcqQuestionSchema.parse(data)).not.toThrow();
  });

  it('should validate all valid svgType values', () => {
    const svgTypes = [
      'FRACTION_CIRCLE',
      'FRACTION_RECT',
      'FRACTION_GROUP',
      'SHAPE_2D',
      'SHAPE_3D',
      'DOT_ARRAY',
      'SYMMETRY',
      'GRID_AREA',
      'BAR_CHART',
      'CLOCK_FACE',
    ];

    svgTypes.forEach((svgType) => {
      const data = {
        ...validVisualMCQBase,
        options: {
          svgType: svgType as any,
          choices: [
            { params: {}, label: 'A' },
            { params: {}, label: 'B' },
            { params: {}, label: 'C' },
            { params: {}, label: 'D' },
          ],
        },
        answer: '0',
      };
      expect(() => visualMcqQuestionSchema.parse(data)).not.toThrow();
    });
  });

  it('should reject visual MCQ with invalid svgType', () => {
    const data = {
      ...validVisualMCQBase,
      options: {
        svgType: 'INVALID_TYPE' as any,
        choices: [
          { params: {}, label: 'A' },
          { params: {}, label: 'B' },
          { params: {}, label: 'C' },
          { params: {}, label: 'D' },
        ],
      },
      answer: '0',
    };
    expect(() => visualMcqQuestionSchema.parse(data)).toThrow(/نوع الشكل غير صالح/);
  });

  it('should reject visual MCQ with less than 4 choices', () => {
    const data = {
      ...validVisualMCQBase,
      options: {
        svgType: 'FRACTION_CIRCLE' as const,
        choices: [
          { params: {}, label: 'A' },
          { params: {}, label: 'B' },
          { params: {}, label: 'C' },
        ],
      },
      answer: '0',
    };
    expect(() => visualMcqQuestionSchema.parse(data)).toThrow(/يجب أن يكون هناك 4 خيارات بالضبط/);
  });

  it('should reject visual MCQ with invalid answer', () => {
    const data = {
      ...validVisualMCQBase,
      options: {
        svgType: 'FRACTION_CIRCLE' as const,
        choices: [
          { params: {}, label: 'A' },
          { params: {}, label: 'B' },
          { params: {}, label: 'C' },
          { params: {}, label: 'D' },
        ],
      },
      answer: '4',
    };
    expect(() => visualMcqQuestionSchema.parse(data)).toThrow(/الإجابة يجب أن تكون 0 أو 1 أو 2 أو 3/);
  });
});

describe('Clock Read Question Schema', () => {
  const validClockReadBase = {
    text: 'ما الوقت المعروض؟',
    questionType: QuestionType.CLOCK_READ,
    category: QuizCategory.TIME,
    level: QuizLevel.EASY,
    points: 8,
  };

  it('should validate a valid clock read question', () => {
    const data = {
      ...validClockReadBase,
      options: {
        clockTime: '03:30',
        choices: ['٣:٣٠', '٣:١٥', '٤:٣٠', '٢:٣٠'],
        displayMode: 'analog_to_digital' as const,
      },
      answer: '٣:٣٠',
    };
    expect(() => clockReadQuestionSchema.parse(data)).not.toThrow();
  });

  it('should validate all display modes', () => {
    const displayModes = ['analog_to_digital', 'digital_to_analog', 'elapsed_time'];

    displayModes.forEach((displayMode) => {
      const data = {
        ...validClockReadBase,
        options: {
          clockTime: '12:00',
          choices: ['١٢:٠٠', '١:٠٠', '١١:٠٠', '٢:٠٠'],
          displayMode: displayMode as any,
        },
        answer: '١٢:٠٠',
      };
      expect(() => clockReadQuestionSchema.parse(data)).not.toThrow();
    });
  });

  it('should reject clock read with invalid time format', () => {
    const data = {
      ...validClockReadBase,
      options: {
        clockTime: '25:70',
        choices: ['٣:٣٠', '٣:١٥', '٤:٣٠', '٢:٣٠'],
        displayMode: 'analog_to_digital' as const,
      },
      answer: '٣:٣٠',
    };
    expect(() => clockReadQuestionSchema.parse(data)).toThrow(/صيغة الوقت يجب أن تكون HH:MM/);
  });

  it('should reject clock read with invalid display mode', () => {
    const data = {
      ...validClockReadBase,
      options: {
        clockTime: '03:30',
        choices: ['٣:٣٠', '٣:١٥', '٤:٣٠', '٢:٣٠'],
        displayMode: 'invalid_mode' as any,
      },
      answer: '٣:٣٠',
    };
    expect(() => clockReadQuestionSchema.parse(data)).toThrow(/وضع العرض غير صالح/);
  });

  it('should reject clock read with less than 4 choices', () => {
    const data = {
      ...validClockReadBase,
      options: {
        clockTime: '03:30',
        choices: ['٣:٣٠', '٣:١٥'],
        displayMode: 'analog_to_digital' as const,
      },
      answer: '٣:٣٠',
    };
    expect(() => clockReadQuestionSchema.parse(data)).toThrow(/يجب أن يكون هناك 4 خيارات بالضبط/);
  });

  it('should reject clock read with empty choice', () => {
    const data = {
      ...validClockReadBase,
      options: {
        clockTime: '03:30',
        choices: ['٣:٣٠', '', '٤:٣٠', '٢:٣٠'],
        displayMode: 'analog_to_digital' as const,
      },
      answer: '٣:٣٠',
    };
    expect(() => clockReadQuestionSchema.parse(data)).toThrow();
  });
});

describe('Discriminated Union Schema', () => {
  it('should validate MCQ through discriminated union', () => {
    const data = {
      text: 'سؤال',
      questionType: QuestionType.MCQ,
      category: QuizCategory.ADDITION,
      level: QuizLevel.EASY,
      points: 5,
      options: ['أ', 'ب', 'ج', 'د'],
      answer: 'أ',
    };
    expect(() => questionSchema.parse(data)).not.toThrow();
  });

  it('should validate FILL_BLANK through discriminated union', () => {
    const data = {
      text: 'سؤال',
      questionType: QuestionType.FILL_BLANK,
      category: QuizCategory.ADDITION,
      level: QuizLevel.EASY,
      points: 5,
      options: {
        before: 'قبل',
        after: 'بعد',
        pad: 'numeric' as const,
      },
      answer: '٥',
    };
    expect(() => questionSchema.parse(data)).not.toThrow();
  });

  it('should validate SORT_ORDER through discriminated union', () => {
    const data = {
      text: 'سؤال',
      questionType: QuestionType.SORT_ORDER,
      category: QuizCategory.COMPARISON,
      level: QuizLevel.MEDIUM,
      points: 10,
      options: {
        items: ['أ', 'ب', 'ج'],
        instruction: 'رتب',
        slots: 3,
      },
      answer: 'أ, ب, ج',
    };
    expect(() => questionSchema.parse(data)).not.toThrow();
  });

  it('should validate MATCHING through discriminated union', () => {
    const data = {
      text: 'سؤال',
      questionType: QuestionType.MATCHING,
      category: QuizCategory.PLACE_VALUE,
      level: QuizLevel.MEDIUM,
      points: 12,
      options: {
        pairs: [
          { left: 'أ', right: '١' },
          { left: 'ب', right: '٢' },
          { left: 'ج', right: '٣' },
          { left: 'د', right: '٤' },
        ],
      },
      answer: 'أ:١|ب:٢|ج:٣|د:٤',
    };
    expect(() => questionSchema.parse(data)).not.toThrow();
  });

  it('should validate VISUAL_MCQ through discriminated union', () => {
    const data = {
      text: 'سؤال',
      questionType: QuestionType.VISUAL_MCQ,
      category: QuizCategory.FRACTIONS,
      level: QuizLevel.MEDIUM,
      points: 10,
      options: {
        svgType: 'FRACTION_CIRCLE' as const,
        choices: [
          { params: {}, label: 'أ' },
          { params: {}, label: 'ب' },
          { params: {}, label: 'ج' },
          { params: {}, label: 'د' },
        ],
      },
      answer: '0',
    };
    expect(() => questionSchema.parse(data)).not.toThrow();
  });

  it('should validate CLOCK_READ through discriminated union', () => {
    const data = {
      text: 'سؤال',
      questionType: QuestionType.CLOCK_READ,
      category: QuizCategory.TIME,
      level: QuizLevel.EASY,
      points: 8,
      options: {
        clockTime: '12:00',
        choices: ['أ', 'ب', 'ج', 'د'],
        displayMode: 'analog_to_digital' as const,
      },
      answer: 'أ',
    };
    expect(() => questionSchema.parse(data)).not.toThrow();
  });

  it('should reject question with invalid questionType', () => {
    const data = {
      text: 'سؤال',
      questionType: 'INVALID_TYPE' as any,
      category: QuizCategory.ADDITION,
      level: QuizLevel.EASY,
      points: 5,
      options: [],
      answer: 'أ',
    };
    expect(() => questionSchema.parse(data)).toThrow();
  });

  it('should reject question with missing base fields', () => {
    const data = {
      questionType: QuestionType.MCQ,
      options: ['أ', 'ب', 'ج', 'د'],
      answer: 'أ',
    };
    expect(() => questionSchema.parse(data)).toThrow();
  });

  it('should reject question with invalid category', () => {
    const data = {
      text: 'سؤال',
      questionType: QuestionType.MCQ,
      category: 'INVALID_CATEGORY' as any,
      level: QuizLevel.EASY,
      points: 5,
      options: ['أ', 'ب', 'ج', 'د'],
      answer: 'أ',
    };
    expect(() => questionSchema.parse(data)).toThrow(/فئة السؤال غير صالحة/);
  });

  it('should reject question with invalid level', () => {
    const data = {
      text: 'سؤال',
      questionType: QuestionType.MCQ,
      category: QuizCategory.ADDITION,
      level: 'INVALID_LEVEL' as any,
      points: 5,
      options: ['أ', 'ب', 'ج', 'د'],
      answer: 'أ',
    };
    expect(() => questionSchema.parse(data)).toThrow(/مستوى السؤال غير صالح/);
  });

  it('should reject question with negative points', () => {
    const data = {
      text: 'سؤال',
      questionType: QuestionType.MCQ,
      category: QuizCategory.ADDITION,
      level: QuizLevel.EASY,
      points: -5,
      options: ['أ', 'ب', 'ج', 'د'],
      answer: 'أ',
    };
    expect(() => questionSchema.parse(data)).toThrow(/النقاط يجب أن تكون رقم موجب/);
  });

  it('should reject question with zero points', () => {
    const data = {
      text: 'سؤال',
      questionType: QuestionType.MCQ,
      category: QuizCategory.ADDITION,
      level: QuizLevel.EASY,
      points: 0,
      options: ['أ', 'ب', 'ج', 'د'],
      answer: 'أ',
    };
    expect(() => questionSchema.parse(data)).toThrow(/النقاط يجب أن تكون رقم موجب/);
  });

  it('should reject MCQ type with FILL_BLANK options structure', () => {
    const data = {
      text: 'سؤال',
      questionType: QuestionType.MCQ,
      category: QuizCategory.ADDITION,
      level: QuizLevel.EASY,
      points: 5,
      options: {
        before: 'قبل',
        after: 'بعد',
        pad: 'numeric',
      },
      answer: '٥',
    };
    expect(() => questionSchema.parse(data)).toThrow();
  });
});

describe('Error Messages', () => {
  it('should return Arabic error message for empty text', () => {
    const data = {
      text: '',
      questionType: QuestionType.MCQ,
      category: QuizCategory.ADDITION,
      level: QuizLevel.EASY,
      points: 5,
      options: ['أ', 'ب', 'ج', 'د'],
      answer: 'أ',
    };
    
    try {
      questionSchema.parse(data);
    } catch (error: any) {
      expect(error.errors[0].message).toContain('نص السؤال مطلوب');
    }
  });

  it('should return Arabic error message for invalid category', () => {
    const data = {
      text: 'سؤال',
      questionType: QuestionType.MCQ,
      category: 'INVALID' as any,
      level: QuizLevel.EASY,
      points: 5,
      options: ['أ', 'ب', 'ج', 'د'],
      answer: 'أ',
    };
    
    try {
      questionSchema.parse(data);
    } catch (error: any) {
      expect(error.errors[0].message).toContain('فئة السؤال غير صالحة');
    }
  });

  it('should return Arabic error message for invalid level', () => {
    const data = {
      text: 'سؤال',
      questionType: QuestionType.MCQ,
      category: QuizCategory.ADDITION,
      level: 'INVALID' as any,
      points: 5,
      options: ['أ', 'ب', 'ج', 'د'],
      answer: 'أ',
    };
    
    try {
      questionSchema.parse(data);
    } catch (error: any) {
      expect(error.errors[0].message).toContain('مستوى السؤال غير صالح');
    }
  });
});
