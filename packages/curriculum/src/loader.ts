import YAML from 'yaml';
import { Lesson, LessonSchema, Unit, UnitSchema, Curriculum, CurriculumSchema } from './types';

/**
 * Load and parse a lesson from YAML string
 */
export function parseLesson(yamlContent: string): Lesson {
  const parsed = YAML.parse(yamlContent);
  return LessonSchema.parse(parsed.lesson);
}

/**
 * Load and parse a unit from YAML string
 */
export function parseUnit(yamlContent: string): Unit {
  const parsed = YAML.parse(yamlContent);
  return UnitSchema.parse(parsed.unit);
}

/**
 * Load and parse a curriculum from YAML string
 */
export function parseCurriculum(yamlContent: string): Curriculum {
  const parsed = YAML.parse(yamlContent);
  return CurriculumSchema.parse(parsed.curriculum);
}

/**
 * Validate lesson prerequisites
 */
export function validatePrerequisites(
  lesson: Lesson,
  masteredConcepts: string[]
): { valid: boolean; missing: string[] } {
  const missing = lesson.prerequisites.filter(
    prereq => !masteredConcepts.includes(prereq)
  );

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Get recommended next lessons based on student progress
 */
export function getRecommendedLessons(
  allLessons: Lesson[],
  masteredConcepts: string[],
  currentGrade: number,
  subject: string
): Lesson[] {
  return allLessons
    .filter(lesson => {
      // Match grade and subject
      if (lesson.grade !== currentGrade || lesson.subject !== subject) {
        return false;
      }

      // Check if already mastered
      const alreadyMastered = lesson.teaches.every(concept =>
        masteredConcepts.includes(concept)
      );
      if (alreadyMastered) {
        return false;
      }

      // Check if prerequisites are met
      const prereqsMet = lesson.prerequisites.every(prereq =>
        masteredConcepts.includes(prereq)
      );

      return prereqsMet;
    })
    .sort((a, b) => {
      // Prioritize lessons with more prerequisites met
      const aPrereqsMet = a.prerequisites.filter(p => masteredConcepts.includes(p)).length;
      const bPrereqsMet = b.prerequisites.filter(p => masteredConcepts.includes(p)).length;
      return bPrereqsMet - aPrereqsMet;
    });
}

/**
 * Calculate lesson difficulty based on prerequisites
 */
export function calculateLessonDifficulty(lesson: Lesson): number {
  // More prerequisites = harder lesson
  const prereqWeight = Math.min(lesson.prerequisites.length / 5, 1) * 0.6;

  // More concepts taught = more complex
  const conceptWeight = Math.min(lesson.teaches.length / 3, 1) * 0.4;

  return prereqWeight + conceptWeight;
}
