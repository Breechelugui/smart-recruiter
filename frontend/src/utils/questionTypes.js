export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  MULTIPLE_ANSWER: 'multiple_answer',
  SUBJECTIVE: 'subjective',
  CODING: 'coding'
};

export const getQuestionTypeInfo = (questionType) => {
  const typeInfo = {
    [QUESTION_TYPES.MULTIPLE_CHOICE]: {
      label: 'Multiple Choice',
      icon: '🔘',
      color: 'blue',
      description: 'Select one correct answer from multiple options',
      hasOptions: true,
      requiresCodeEditor: false
    },
    [QUESTION_TYPES.MULTIPLE_ANSWER]: {
      label: 'Multiple Answer',
      icon: '☑️',
      color: 'indigo',
      description: 'Select multiple correct answers from options',
      hasOptions: true,
      requiresCodeEditor: false
    },
    [QUESTION_TYPES.SUBJECTIVE]: {
      label: 'Text Answer',
      icon: '📝',
      color: 'green',
      description: 'Provide a written response',
      hasOptions: false,
      requiresCodeEditor: false
    },
    [QUESTION_TYPES.CODING]: {
      label: 'Coding',
      icon: '💻',
      color: 'purple',
      description: 'Write code to solve problem',
      hasOptions: false,
      requiresCodeEditor: true
    }
  };

  return typeInfo[questionType] || {
    label: 'Unknown',
    icon: '❓',
    color: 'gray',
    description: 'Unknown question type',
    hasOptions: false,
    requiresCodeEditor: false
  };
};

export const detectQuestionType = (question) => {
  // If question_type is explicitly set, use it
  if (question.question_type) {
    return question.question_type;
  }

  // Auto-detect based on question properties
  if (question.codewars_kata_id || question.test_cases || question.starter_code) {
    return QUESTION_TYPES.CODING;
  }

  if (question.options && Array.isArray(question.options) && question.options.length > 0) {
    return QUESTION_TYPES.MULTIPLE_CHOICE;
  }

  if (question.description || question.title) {
    return QUESTION_TYPES.SUBJECTIVE;
  }

  return QUESTION_TYPES.SUBJECTIVE; // Default fallback
};

export const getQuestionTypeBadge = (questionType) => {
  const info = getQuestionTypeInfo(questionType);
  return {
    text: info.label,
    icon: info.icon,
    className: `bg-${info.color}-100 text-${info.color}-700`
  };
};

export const isCodingQuestion = (question) => {
  const type = detectQuestionType(question);
  return type === QUESTION_TYPES.CODING;
};

export const isMultipleChoiceQuestion = (question) => {
  const type = detectQuestionType(question);
  return type === QUESTION_TYPES.MULTIPLE_CHOICE;
};

export const isMultipleAnswerQuestion = (question) => {
  const type = detectQuestionType(question);
  return type === QUESTION_TYPES.MULTIPLE_ANSWER;
};

export const isSubjectiveQuestion = (question) => {
  const type = detectQuestionType(question);
  return type === QUESTION_TYPES.SUBJECTIVE;
};
