import { parseLesson, parseUnit, parseCurriculum, validatePrerequisites, getRecommendedLessons, calculateLessonDifficulty } from '../loader';
import { Lesson } from '../types';

describe('Curriculum Loader', () => {
  describe('parseLesson', () => {
    it('should parse valid lesson YAML', () => {
      const yaml = `
lesson:
  id: math-grade2-addition-1
  title: "Introduction to Addition"
  grade: 2
  subject: math
  unit: addition
  prerequisites: []
  teaches: ["basic-addition", "single-digit-addition"]
  estimated_time: "20 minutes"
  sections:
    - type: video
      duration: "5 minutes"
      content:
        video_url: "https://example.com/video.mp4"
        transcript: "Welcome to addition..."
    - type: practice
      problem_generator:
        type: addition
        difficulty: 0.3
        count: 5
`;

      const lesson = parseLesson(yaml);

      expect(lesson.id).toBe('math-grade2-addition-1');
      expect(lesson.title).toBe('Introduction to Addition');
      expect(lesson.grade).toBe(2);
      expect(lesson.subject).toBe('math');
      expect(lesson.prerequisites).toEqual([]);
      expect(lesson.teaches).toEqual(['basic-addition', 'single-digit-addition']);
      expect(lesson.sections).toHaveLength(2);
    });

    it('should parse lesson with prerequisites', () => {
      const yaml = `
lesson:
  id: math-grade3-multiplication-2
  title: "Multiplication Tables"
  grade: 3
  subject: math
  unit: multiplication
  prerequisites: ["basic-multiplication", "skip-counting"]
  teaches: ["times-tables", "multiplication-facts"]
  estimated_time: "25 minutes"
  sections:
    - type: practice
      problem_generator:
        type: multiplication
        difficulty: 0.5
        count: 10
`;

      const lesson = parseLesson(yaml);

      expect(lesson.prerequisites).toEqual(['basic-multiplication', 'skip-counting']);
      expect(lesson.teaches).toEqual(['times-tables', 'multiplication-facts']);
    });

    it('should parse lesson with all section types', () => {
      const yaml = `
lesson:
  id: test-lesson
  title: "Test Lesson"
  grade: 3
  subject: math
  unit: test
  estimated_time: "30 minutes"
  sections:
    - type: video
      duration: "5 minutes"
      content:
        video_url: "https://example.com/video.mp4"
    - type: interactive
      component: "NumberLine"
      props:
        min: 0
        max: 10
    - type: practice
      problem_generator:
        type: addition
        difficulty: 0.5
        count: 5
    - type: assessment
      mastery_threshold: 0.8
      problems: 10
      ai_tutor_enabled: true
`;

      const lesson = parseLesson(yaml);

      expect(lesson.sections).toHaveLength(4);
      expect(lesson.sections[0].type).toBe('video');
      expect(lesson.sections[1].type).toBe('interactive');
      expect(lesson.sections[2].type).toBe('practice');
      expect(lesson.sections[3].type).toBe('assessment');
    });

    it('should throw error for invalid lesson YAML', () => {
      const invalidYaml = `
lesson:
  id: missing-required-fields
  title: "Invalid Lesson"
`;

      expect(() => parseLesson(invalidYaml)).toThrow();
    });

    it('should throw error for invalid grade', () => {
      const invalidYaml = `
lesson:
  id: invalid-grade
  title: "Invalid Grade"
  grade: 15
  subject: math
  unit: test
  estimated_time: "20 minutes"
  sections: []
`;

      expect(() => parseLesson(invalidYaml)).toThrow();
    });
  });

  describe('parseUnit', () => {
    it('should parse valid unit YAML', () => {
      const yaml = `
unit:
  id: math-grade2-addition
  title: "Addition"
  grade: 2
  subject: math
  description: "Learn to add numbers"
  lessons: ["addition-1", "addition-2", "addition-3"]
  estimated_total_time: "1 hour"
`;

      const unit = parseUnit(yaml);

      expect(unit.id).toBe('math-grade2-addition');
      expect(unit.title).toBe('Addition');
      expect(unit.grade).toBe(2);
      expect(unit.lessons).toEqual(['addition-1', 'addition-2', 'addition-3']);
      expect(unit.estimated_total_time).toBe('1 hour');
    });

    it('should throw error for invalid unit YAML', () => {
      const invalidYaml = `
unit:
  id: missing-fields
  title: "Invalid Unit"
`;

      expect(() => parseUnit(invalidYaml)).toThrow();
    });
  });

  describe('parseCurriculum', () => {
    it('should parse valid curriculum YAML', () => {
      const yaml = `
curriculum:
  id: math-grade3
  subject: math
  grade: 3
  title: "Grade 3 Math"
  description: "Complete third grade math curriculum"
  units: ["addition", "subtraction", "multiplication", "division"]
`;

      const curriculum = parseCurriculum(yaml);

      expect(curriculum.id).toBe('math-grade3');
      expect(curriculum.grade).toBe(3);
      expect(curriculum.subject).toBe('math');
      expect(curriculum.units).toHaveLength(4);
    });

    it('should throw error for invalid curriculum YAML', () => {
      const invalidYaml = `
curriculum:
  id: missing-fields
`;

      expect(() => parseCurriculum(invalidYaml)).toThrow();
    });
  });

  describe('validatePrerequisites', () => {
    const lesson: Lesson = {
      id: 'test-lesson',
      title: 'Test Lesson',
      grade: 3,
      subject: 'math',
      unit: 'test',
      prerequisites: ['addition', 'subtraction', 'counting'],
      teaches: ['multiplication'],
      estimated_time: '20 minutes',
      sections: []
    };

    it('should validate when all prerequisites are met', () => {
      const masteredConcepts = ['addition', 'subtraction', 'counting', 'other-concept'];
      const result = validatePrerequisites(lesson, masteredConcepts);

      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should detect missing prerequisites', () => {
      const masteredConcepts = ['addition', 'counting'];
      const result = validatePrerequisites(lesson, masteredConcepts);

      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['subtraction']);
    });

    it('should detect all missing prerequisites', () => {
      const masteredConcepts: string[] = [];
      const result = validatePrerequisites(lesson, masteredConcepts);

      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['addition', 'subtraction', 'counting']);
    });

    it('should handle lesson with no prerequisites', () => {
      const lessonNoPrereqs: Lesson = {
        ...lesson,
        prerequisites: []
      };
      const result = validatePrerequisites(lessonNoPrereqs, []);

      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });
  });

  describe('getRecommendedLessons', () => {
    const lessons: Lesson[] = [
      {
        id: 'math-3-lesson-1',
        title: 'Basic Addition',
        grade: 3,
        subject: 'math',
        unit: 'addition',
        prerequisites: [],
        teaches: ['single-digit-addition'],
        estimated_time: '20 minutes',
        sections: []
      },
      {
        id: 'math-3-lesson-2',
        title: 'Advanced Addition',
        grade: 3,
        subject: 'math',
        unit: 'addition',
        prerequisites: ['single-digit-addition'],
        teaches: ['double-digit-addition'],
        estimated_time: '25 minutes',
        sections: []
      },
      {
        id: 'math-3-lesson-3',
        title: 'Multi-digit Addition',
        grade: 3,
        subject: 'math',
        unit: 'addition',
        prerequisites: ['single-digit-addition', 'double-digit-addition'],
        teaches: ['multi-digit-addition'],
        estimated_time: '30 minutes',
        sections: []
      },
      {
        id: 'math-4-lesson-1',
        title: 'Grade 4 Addition',
        grade: 4,
        subject: 'math',
        unit: 'addition',
        prerequisites: [],
        teaches: ['grade4-addition'],
        estimated_time: '20 minutes',
        sections: []
      },
      {
        id: 'science-3-lesson-1',
        title: 'Plants',
        grade: 3,
        subject: 'science',
        unit: 'biology',
        prerequisites: [],
        teaches: ['plant-biology'],
        estimated_time: '30 minutes',
        sections: []
      }
    ];

    it('should recommend lessons matching grade and subject', () => {
      const masteredConcepts: string[] = [];
      const recommended = getRecommendedLessons(lessons, masteredConcepts, 3, 'math');

      expect(recommended).toHaveLength(1);
      expect(recommended[0].id).toBe('math-3-lesson-1');
    });

    it('should exclude lessons from different grades', () => {
      const masteredConcepts: string[] = [];
      const recommended = getRecommendedLessons(lessons, masteredConcepts, 3, 'math');

      const gradeIds = recommended.map(l => l.grade);
      expect(gradeIds.every(g => g === 3)).toBe(true);
    });

    it('should exclude lessons from different subjects', () => {
      const masteredConcepts: string[] = [];
      const recommended = getRecommendedLessons(lessons, masteredConcepts, 3, 'math');

      const subjects = recommended.map(l => l.subject);
      expect(subjects.every(s => s === 'math')).toBe(true);
    });

    it('should exclude lessons with unmet prerequisites', () => {
      const masteredConcepts: string[] = [];
      const recommended = getRecommendedLessons(lessons, masteredConcepts, 3, 'math');

      // Should only include lesson 1 (no prerequisites)
      expect(recommended).toHaveLength(1);
      expect(recommended[0].id).toBe('math-3-lesson-1');
    });

    it('should recommend next lesson after mastering prerequisites', () => {
      const masteredConcepts = ['single-digit-addition'];
      const recommended = getRecommendedLessons(lessons, masteredConcepts, 3, 'math');

      // Should include lesson 2 (prerequisites met)
      expect(recommended).toHaveLength(1);
      expect(recommended[0].id).toBe('math-3-lesson-2');
    });

    it('should exclude already mastered lessons', () => {
      const masteredConcepts = ['single-digit-addition'];
      const recommended = getRecommendedLessons(lessons, masteredConcepts, 3, 'math');

      // Should not include lesson 1 (already mastered)
      const ids = recommended.map(l => l.id);
      expect(ids).not.toContain('math-3-lesson-1');
    });

    it('should prioritize lessons with more prerequisites met', () => {
      const masteredConcepts = ['single-digit-addition', 'double-digit-addition', 'extra-concept'];
      const recommended = getRecommendedLessons(lessons, masteredConcepts, 3, 'math');

      // Lesson 3 has 2 prerequisites met, should be first
      expect(recommended[0].id).toBe('math-3-lesson-3');
    });

    it('should return empty array when no lessons match', () => {
      const masteredConcepts: string[] = [];
      const recommended = getRecommendedLessons(lessons, masteredConcepts, 6, 'history');

      expect(recommended).toEqual([]);
    });
  });

  describe('calculateLessonDifficulty', () => {
    it('should calculate difficulty for lesson with no prerequisites or concepts', () => {
      const lesson: Lesson = {
        id: 'test',
        title: 'Test',
        grade: 1,
        subject: 'math',
        unit: 'test',
        prerequisites: [],
        teaches: [],
        estimated_time: '20 minutes',
        sections: []
      };

      const difficulty = calculateLessonDifficulty(lesson);
      expect(difficulty).toBe(0);
    });

    it('should increase difficulty with more prerequisites', () => {
      const easyLesson: Lesson = {
        id: 'easy',
        title: 'Easy',
        grade: 1,
        subject: 'math',
        unit: 'test',
        prerequisites: [],
        teaches: ['concept1'],
        estimated_time: '20 minutes',
        sections: []
      };

      const hardLesson: Lesson = {
        id: 'hard',
        title: 'Hard',
        grade: 1,
        subject: 'math',
        unit: 'test',
        prerequisites: ['p1', 'p2', 'p3', 'p4', 'p5'],
        teaches: ['concept1'],
        estimated_time: '20 minutes',
        sections: []
      };

      const easyDifficulty = calculateLessonDifficulty(easyLesson);
      const hardDifficulty = calculateLessonDifficulty(hardLesson);

      expect(hardDifficulty).toBeGreaterThan(easyDifficulty);
    });

    it('should increase difficulty with more concepts taught', () => {
      const fewConcepts: Lesson = {
        id: 'few',
        title: 'Few Concepts',
        grade: 1,
        subject: 'math',
        unit: 'test',
        prerequisites: [],
        teaches: ['concept1'],
        estimated_time: '20 minutes',
        sections: []
      };

      const manyConcepts: Lesson = {
        id: 'many',
        title: 'Many Concepts',
        grade: 1,
        subject: 'math',
        unit: 'test',
        prerequisites: [],
        teaches: ['concept1', 'concept2', 'concept3'],
        estimated_time: '20 minutes',
        sections: []
      };

      const fewDifficulty = calculateLessonDifficulty(fewConcepts);
      const manyDifficulty = calculateLessonDifficulty(manyConcepts);

      expect(manyDifficulty).toBeGreaterThan(fewDifficulty);
    });

    it('should cap difficulty at 1.0', () => {
      const veryHardLesson: Lesson = {
        id: 'very-hard',
        title: 'Very Hard',
        grade: 5,
        subject: 'math',
        unit: 'test',
        prerequisites: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'],
        teaches: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'],
        estimated_time: '60 minutes',
        sections: []
      };

      const difficulty = calculateLessonDifficulty(veryHardLesson);
      expect(difficulty).toBeLessThanOrEqual(1.0);
    });

    it('should weight prerequisites more than concepts taught', () => {
      const manyPrereqs: Lesson = {
        id: 'prereqs',
        title: 'Many Prerequisites',
        grade: 3,
        subject: 'math',
        unit: 'test',
        prerequisites: ['p1', 'p2', 'p3', 'p4', 'p5'],
        teaches: [],
        estimated_time: '20 minutes',
        sections: []
      };

      const manyConcepts: Lesson = {
        id: 'concepts',
        title: 'Many Concepts',
        grade: 3,
        subject: 'math',
        unit: 'test',
        prerequisites: [],
        teaches: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'],
        estimated_time: '20 minutes',
        sections: []
      };

      const prereqDifficulty = calculateLessonDifficulty(manyPrereqs);
      const conceptDifficulty = calculateLessonDifficulty(manyConcepts);

      // Prerequisites weighted at 0.6, concepts at 0.4
      expect(prereqDifficulty).toBeGreaterThan(conceptDifficulty);
    });
  });
});
