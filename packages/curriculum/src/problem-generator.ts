import { Problem } from './types';

/**
 * Generate math problems dynamically based on type and difficulty
 */
export class ProblemGenerator {
  /**
   * Generate a math problem
   */
  static generateMathProblem(
    type: string,
    difficulty: number, // 0-1
    grade: number
  ): Problem {
    switch (type) {
      case 'addition':
        return this.generateAdditionProblem(difficulty, grade);
      case 'subtraction':
        return this.generateSubtractionProblem(difficulty, grade);
      case 'multiplication':
        return this.generateMultiplicationProblem(difficulty, grade);
      case 'division':
        return this.generateDivisionProblem(difficulty, grade);
      case 'fractions':
        return this.generateFractionProblem(difficulty, grade);
      default:
        throw new Error(`Unknown problem type: ${type}`);
    }
  }

  private static generateAdditionProblem(difficulty: number, grade: number): Problem {
    const maxValue = this.getMaxValue(difficulty, grade, 'addition');
    const a = this.randomInt(1, maxValue);
    const b = this.randomInt(1, maxValue);
    const answer = a + b;

    // Generate wrong options
    const options = [
      answer.toString(),
      (answer + this.randomInt(1, 5)).toString(),
      (answer - this.randomInt(1, 5)).toString(),
      (answer + this.randomInt(6, 10)).toString()
    ].sort(() => Math.random() - 0.5);

    return {
      id: `add-${Date.now()}-${Math.random()}`,
      type: 'addition',
      question: `What is ${a} + ${b}?`,
      options,
      correct_answer: answer.toString(),
      explanation: `${a} + ${b} = ${answer}. You can count up from ${a} by ${b} to get ${answer}.`,
      difficulty
    };
  }

  private static generateSubtractionProblem(difficulty: number, grade: number): Problem {
    const maxValue = this.getMaxValue(difficulty, grade, 'subtraction');
    const answer = this.randomInt(0, maxValue);
    const a = answer + this.randomInt(1, maxValue);
    const b = a - answer;

    const options = [
      answer.toString(),
      (answer + this.randomInt(1, 5)).toString(),
      (answer - this.randomInt(1, 5)).toString(),
      (answer + this.randomInt(6, 10)).toString()
    ].sort(() => Math.random() - 0.5);

    return {
      id: `sub-${Date.now()}-${Math.random()}`,
      type: 'subtraction',
      question: `What is ${a} - ${b}?`,
      options,
      correct_answer: answer.toString(),
      explanation: `${a} - ${b} = ${answer}. If you have ${a} and take away ${b}, you have ${answer} left.`,
      difficulty
    };
  }

  private static generateMultiplicationProblem(difficulty: number, grade: number): Problem {
    const maxValue = this.getMaxValue(difficulty, grade, 'multiplication');
    const a = this.randomInt(2, maxValue);
    const b = this.randomInt(2, maxValue);
    const answer = a * b;

    const options = [
      answer.toString(),
      (answer + a).toString(),
      (answer + b).toString(),
      (a + b).toString()
    ].sort(() => Math.random() - 0.5);

    return {
      id: `mul-${Date.now()}-${Math.random()}`,
      type: 'multiplication',
      question: `What is ${a} × ${b}?`,
      options,
      correct_answer: answer.toString(),
      explanation: `${a} × ${b} = ${answer}. This means ${a} groups of ${b}, or ${b} groups of ${a}.`,
      difficulty
    };
  }

  private static generateDivisionProblem(difficulty: number, grade: number): Problem {
    const maxValue = this.getMaxValue(difficulty, grade, 'division');
    const answer = this.randomInt(2, maxValue);
    const b = this.randomInt(2, maxValue);
    const a = answer * b;

    const options = [
      answer.toString(),
      (answer + 1).toString(),
      (answer - 1).toString(),
      b.toString()
    ].sort(() => Math.random() - 0.5);

    return {
      id: `div-${Date.now()}-${Math.random()}`,
      type: 'division',
      question: `What is ${a} ÷ ${b}?`,
      options,
      correct_answer: answer.toString(),
      explanation: `${a} ÷ ${b} = ${answer}. If you split ${a} into ${b} equal groups, each group has ${answer}.`,
      difficulty
    };
  }

  private static generateFractionProblem(difficulty: number, grade: number): Problem {
    const numerator = this.randomInt(1, 8);
    const denominator = this.randomInt(numerator + 1, 12);
    const simplified = this.simplifyFraction(numerator, denominator);

    const question = `Simplify the fraction ${numerator}/${denominator}`;
    const answer = `${simplified.numerator}/${simplified.denominator}`;

    const options = [
      answer,
      `${numerator}/${denominator}`,
      `${numerator + 1}/${denominator}`,
      `${numerator}/${denominator + 1}`
    ].sort(() => Math.random() - 0.5);

    return {
      id: `frac-${Date.now()}-${Math.random()}`,
      type: 'fractions',
      question,
      options,
      correct_answer: answer,
      explanation: `${numerator}/${denominator} simplifies to ${answer} by dividing both by their greatest common divisor.`,
      difficulty
    };
  }

  private static getMaxValue(difficulty: number, grade: number, type: string): number {
    const baseValues: Record<string, number[]> = {
      addition: [10, 20, 50, 100, 500],
      subtraction: [10, 20, 50, 100, 500],
      multiplication: [5, 10, 12, 15, 20],
      division: [5, 10, 12, 15, 20]
    };

    const values = baseValues[type] || [10, 20, 50, 100, 500];
    const index = Math.floor(difficulty * (values.length - 1));
    return values[index];
  }

  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  private static simplifyFraction(numerator: number, denominator: number): { numerator: number; denominator: number } {
    const divisor = this.gcd(numerator, denominator);
    return {
      numerator: numerator / divisor,
      denominator: denominator / divisor
    };
  }
}
