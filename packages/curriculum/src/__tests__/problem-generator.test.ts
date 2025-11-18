import { ProblemGenerator } from '../problem-generator';

describe('ProblemGenerator', () => {
  describe('generateMathProblem', () => {
    it('should throw error for unknown problem type', () => {
      expect(() => {
        ProblemGenerator.generateMathProblem('unknown', 0.5, 3);
      }).toThrow('Unknown problem type: unknown');
    });

    it('should generate problem with all required fields', () => {
      const problem = ProblemGenerator.generateMathProblem('addition', 0.5, 3);

      expect(problem).toHaveProperty('id');
      expect(problem).toHaveProperty('type');
      expect(problem).toHaveProperty('question');
      expect(problem).toHaveProperty('options');
      expect(problem).toHaveProperty('correct_answer');
      expect(problem).toHaveProperty('explanation');
      expect(problem).toHaveProperty('difficulty');
    });
  });

  describe('Addition Problems', () => {
    it('should generate valid addition problem', () => {
      const problem = ProblemGenerator.generateMathProblem('addition', 0.5, 3);

      expect(problem.type).toBe('addition');
      expect(problem.question).toMatch(/What is \d+ \+ \d+\?/);
      expect(problem.options).toHaveLength(4);
      expect(problem.options).toContain(problem.correct_answer);
    });

    it('should generate correct answer', () => {
      const problem = ProblemGenerator.generateMathProblem('addition', 0.5, 3);

      // Extract numbers from question "What is 5 + 3?"
      const match = problem.question.match(/What is (\d+) \+ (\d+)\?/);
      expect(match).toBeTruthy();

      if (match) {
        const a = parseInt(match[1]);
        const b = parseInt(match[2]);
        const expectedAnswer = (a + b).toString();

        expect(problem.correct_answer).toBe(expectedAnswer);
      }
    });

    it('should scale difficulty for easy problems (difficulty 0)', () => {
      const problems = Array.from({ length: 10 }, () =>
        ProblemGenerator.generateMathProblem('addition', 0, 1)
      );

      problems.forEach(problem => {
        const match = problem.question.match(/What is (\d+) \+ (\d+)\?/);
        if (match) {
          const a = parseInt(match[1]);
          const b = parseInt(match[2]);
          // For difficulty 0, max value should be 10
          expect(a).toBeLessThanOrEqual(10);
          expect(b).toBeLessThanOrEqual(10);
        }
      });
    });

    it('should scale difficulty for hard problems (difficulty 1)', () => {
      const problems = Array.from({ length: 10 }, () =>
        ProblemGenerator.generateMathProblem('addition', 1, 5)
      );

      problems.forEach(problem => {
        const match = problem.question.match(/What is (\d+) \+ (\d+)\?/);
        if (match) {
          const a = parseInt(match[1]);
          const b = parseInt(match[2]);
          // For difficulty 1, max value should be 500
          expect(a).toBeLessThanOrEqual(500);
          expect(b).toBeLessThanOrEqual(500);
        }
      });
    });

    it('should include explanation', () => {
      const problem = ProblemGenerator.generateMathProblem('addition', 0.5, 3);
      expect(problem.explanation).toMatch(/You can count up from/);
    });
  });

  describe('Subtraction Problems', () => {
    it('should generate valid subtraction problem', () => {
      const problem = ProblemGenerator.generateMathProblem('subtraction', 0.5, 3);

      expect(problem.type).toBe('subtraction');
      expect(problem.question).toMatch(/What is \d+ - \d+\?/);
      expect(problem.options).toHaveLength(4);
      expect(problem.options).toContain(problem.correct_answer);
    });

    it('should generate correct answer', () => {
      const problem = ProblemGenerator.generateMathProblem('subtraction', 0.5, 3);

      const match = problem.question.match(/What is (\d+) - (\d+)\?/);
      expect(match).toBeTruthy();

      if (match) {
        const a = parseInt(match[1]);
        const b = parseInt(match[2]);
        const expectedAnswer = (a - b).toString();

        expect(problem.correct_answer).toBe(expectedAnswer);
      }
    });

    it('should never generate negative answers', () => {
      const problems = Array.from({ length: 20 }, () =>
        ProblemGenerator.generateMathProblem('subtraction', 0.5, 3)
      );

      problems.forEach(problem => {
        const answer = parseInt(problem.correct_answer);
        expect(answer).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include explanation', () => {
      const problem = ProblemGenerator.generateMathProblem('subtraction', 0.5, 3);
      expect(problem.explanation).toMatch(/If you have .* and take away/);
    });
  });

  describe('Multiplication Problems', () => {
    it('should generate valid multiplication problem', () => {
      const problem = ProblemGenerator.generateMathProblem('multiplication', 0.5, 4);

      expect(problem.type).toBe('multiplication');
      expect(problem.question).toMatch(/What is \d+ × \d+\?/);
      expect(problem.options).toHaveLength(4);
      expect(problem.options).toContain(problem.correct_answer);
    });

    it('should generate correct answer', () => {
      const problem = ProblemGenerator.generateMathProblem('multiplication', 0.5, 4);

      const match = problem.question.match(/What is (\d+) × (\d+)\?/);
      expect(match).toBeTruthy();

      if (match) {
        const a = parseInt(match[1]);
        const b = parseInt(match[2]);
        const expectedAnswer = (a * b).toString();

        expect(problem.correct_answer).toBe(expectedAnswer);
      }
    });

    it('should use numbers >= 2', () => {
      const problems = Array.from({ length: 20 }, () =>
        ProblemGenerator.generateMathProblem('multiplication', 0.5, 4)
      );

      problems.forEach(problem => {
        const match = problem.question.match(/What is (\d+) × (\d+)\?/);
        if (match) {
          const a = parseInt(match[1]);
          const b = parseInt(match[2]);
          expect(a).toBeGreaterThanOrEqual(2);
          expect(b).toBeGreaterThanOrEqual(2);
        }
      });
    });

    it('should include explanation about groups', () => {
      const problem = ProblemGenerator.generateMathProblem('multiplication', 0.5, 4);
      expect(problem.explanation).toMatch(/This means .* groups of/);
    });
  });

  describe('Division Problems', () => {
    it('should generate valid division problem', () => {
      const problem = ProblemGenerator.generateMathProblem('division', 0.5, 4);

      expect(problem.type).toBe('division');
      expect(problem.question).toMatch(/What is \d+ ÷ \d+\?/);
      expect(problem.options).toHaveLength(4);
      expect(problem.options).toContain(problem.correct_answer);
    });

    it('should generate correct answer with no remainder', () => {
      const problem = ProblemGenerator.generateMathProblem('division', 0.5, 4);

      const match = problem.question.match(/What is (\d+) ÷ (\d+)\?/);
      expect(match).toBeTruthy();

      if (match) {
        const a = parseInt(match[1]);
        const b = parseInt(match[2]);
        const answer = parseInt(problem.correct_answer);

        // Verify it's a valid division with no remainder
        expect(a).toBe(answer * b);
      }
    });

    it('should use divisors >= 2', () => {
      const problems = Array.from({ length: 20 }, () =>
        ProblemGenerator.generateMathProblem('division', 0.5, 4)
      );

      problems.forEach(problem => {
        const match = problem.question.match(/What is (\d+) ÷ (\d+)\?/);
        if (match) {
          const b = parseInt(match[2]);
          expect(b).toBeGreaterThanOrEqual(2);
        }
      });
    });

    it('should include explanation about equal groups', () => {
      const problem = ProblemGenerator.generateMathProblem('division', 0.5, 4);
      expect(problem.explanation).toMatch(/If you split .* into .* equal groups/);
    });
  });

  describe('Fraction Problems', () => {
    it('should generate valid fraction problem', () => {
      const problem = ProblemGenerator.generateMathProblem('fractions', 0.5, 5);

      expect(problem.type).toBe('fractions');
      expect(problem.question).toMatch(/Simplify the fraction \d+\/\d+/);
      expect(problem.options).toHaveLength(4);
      expect(problem.options).toContain(problem.correct_answer);
    });

    it('should generate correct simplified fraction', () => {
      const problem = ProblemGenerator.generateMathProblem('fractions', 0.5, 5);

      const match = problem.question.match(/Simplify the fraction (\d+)\/(\d+)/);
      expect(match).toBeTruthy();

      if (match) {
        const numerator = parseInt(match[1]);
        const denominator = parseInt(match[2]);

        // Parse the answer
        const answerMatch = problem.correct_answer.match(/(\d+)\/(\d+)/);
        expect(answerMatch).toBeTruthy();

        if (answerMatch) {
          const answerNum = parseInt(answerMatch[1]);
          const answerDenom = parseInt(answerMatch[2]);

          // Verify the fractions are equivalent
          expect(numerator * answerDenom).toBe(denominator * answerNum);

          // Verify it's simplified (GCD should be 1)
          const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
          expect(gcd(answerNum, answerDenom)).toBe(1);
        }
      }
    });

    it('should have denominator > numerator', () => {
      const problems = Array.from({ length: 20 }, () =>
        ProblemGenerator.generateMathProblem('fractions', 0.5, 5)
      );

      problems.forEach(problem => {
        const match = problem.question.match(/Simplify the fraction (\d+)\/(\d+)/);
        if (match) {
          const numerator = parseInt(match[1]);
          const denominator = parseInt(match[2]);
          expect(denominator).toBeGreaterThan(numerator);
        }
      });
    });

    it('should include explanation about GCD', () => {
      const problem = ProblemGenerator.generateMathProblem('fractions', 0.5, 5);
      expect(problem.explanation).toMatch(/simplifies to .* by dividing both by their greatest common divisor/);
    });
  });

  describe('Problem Structure', () => {
    const types = ['addition', 'subtraction', 'multiplication', 'division', 'fractions'];

    types.forEach(type => {
      it(`${type} should have unique IDs`, () => {
        const problem1 = ProblemGenerator.generateMathProblem(type, 0.5, 3);
        const problem2 = ProblemGenerator.generateMathProblem(type, 0.5, 3);

        expect(problem1.id).not.toBe(problem2.id);
      });

      it(`${type} should have 4 options`, () => {
        const problem = ProblemGenerator.generateMathProblem(type, 0.5, 3);
        expect(problem.options).toHaveLength(4);
      });

      it(`${type} should include correct answer in options`, () => {
        const problem = ProblemGenerator.generateMathProblem(type, 0.5, 3);
        expect(problem.options).toContain(problem.correct_answer);
      });

      it(`${type} should include correct answer in options`, () => {
        const problems = Array.from({ length: 20 }, () =>
          ProblemGenerator.generateMathProblem(type, 0.5, 3)
        );

        // Verify all problems include the correct answer
        problems.forEach(problem => {
          expect(problem.options).toContain(problem.correct_answer);
        });

        // Most problems should have some variety in options
        const hasVariety = problems.filter(problem => {
          const uniqueOptions = new Set(problem.options);
          return uniqueOptions.size >= 3; // At least 3 unique options
        }).length;

        // At least 80% should have variety (3+ unique options)
        expect(hasVariety).toBeGreaterThanOrEqual(16);
      });

      it(`${type} should store difficulty`, () => {
        const difficulty = 0.75;
        const problem = ProblemGenerator.generateMathProblem(type, difficulty, 3);
        expect(problem.difficulty).toBe(difficulty);
      });
    });
  });

  describe('Difficulty Scaling', () => {
    it('should return appropriate max values for different difficulties', () => {
      // Test addition difficulty scaling
      const easyAddition = Array.from({ length: 10 }, () =>
        ProblemGenerator.generateMathProblem('addition', 0, 1)
      );

      const hardAddition = Array.from({ length: 10 }, () =>
        ProblemGenerator.generateMathProblem('addition', 1, 5)
      );

      const avgEasy = easyAddition.reduce((sum, problem) => {
        const match = problem.question.match(/What is (\d+) \+ (\d+)\?/);
        if (match) {
          return sum + parseInt(match[1]) + parseInt(match[2]);
        }
        return sum;
      }, 0) / (easyAddition.length * 2);

      const avgHard = hardAddition.reduce((sum, problem) => {
        const match = problem.question.match(/What is (\d+) \+ (\d+)\?/);
        if (match) {
          return sum + parseInt(match[1]) + parseInt(match[2]);
        }
        return sum;
      }, 0) / (hardAddition.length * 2);

      // Hard problems should use larger numbers on average
      expect(avgHard).toBeGreaterThan(avgEasy * 2);
    });
  });
});
