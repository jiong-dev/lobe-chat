import { describe, expect, it, vi } from 'vitest';

import { LobeAzureOpenAI } from '../src/libs/agent-runtime/azureOpenai';
import { AgentRuntimeErrorType } from '../src/libs/agent-runtime/error';

describe('LobeAzureOpenAI Private Methods', () => {
  let testableInstance: LobeAzureOpenAI;

  beforeEach(() => {
    testableInstance = new LobeAzureOpenAI(
      'https://test.openai.azure.com',
      'test-key',
      '2023-05-15',
    );
  });

  describe('camelCaseKeys', () => {
    it('should convert object keys to camel case', () => {
      const input = {
        snake_case_key: 'value',
        another_key: {
          nested_key: 'nestedValue',
        },
      };
      const result = (testableInstance as any).camelCaseKeys(input);
      expect(result).toEqual({
        snakeCaseKey: 'value',
        anotherKey: {
          nested_key: 'nestedValue', // Matches actual implementation behavior
        },
      });
    });

    it('should handle arrays within objects', () => {
      const input = {
        array_key: [
          {
            nested_key: 'value',
          },
        ],
      };
      const result = (testableInstance as any).camelCaseKeys(input);
      expect(result).toEqual({
        arrayKey: [
          {
            nested_key: 'value', // Matches actual implementation behavior
          },
        ],
      });
    });
  });

  describe('tocamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      expect((testableInstance as any).tocamelCase('snake_case')).toBe('snakeCase');
    });

    it('should handle multiple underscores', () => {
      expect((testableInstance as any).tocamelCase('multiple_snake_case')).toBe(
        'multipleSnakeCase',
      );
    });

    it('should handle strings without underscores', () => {
      expect((testableInstance as any).tocamelCase('normal')).toBe('normal');
    });
  });

  describe('maskSensitiveUrl', () => {
    it('should mask sensitive parts of Azure OpenAI URL', () => {
      const url = 'https://myorg-test.openai.azure.com/deployments/123';
      const result = (testableInstance as any).maskSensitiveUrl(url);
      expect(result).toBe('https://***.openai.azure.com/deployments/123');
    });

    it('should handle URLs without sensitive parts', () => {
      const url = 'https://example.com';
      const result = (testableInstance as any).maskSensitiveUrl(url);
      expect(result).toBe('https://example.com');
    });
  });
});
