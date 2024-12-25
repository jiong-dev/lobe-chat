import { describe, expect, it, vi } from 'vitest';

import { LobeAzureOpenAI } from '../src/libs/agent-runtime/azureOpenai';

describe('LobeAzureOpenAI', () => {
  describe('private methods', () => {
    let azure: LobeAzureOpenAI;

    beforeEach(() => {
      azure = new LobeAzureOpenAI('https://test.openai.azure.com/', 'fake-key', 'v1');
    });

    describe('tocamelCase', () => {
      it('should convert snake_case to camelCase', () => {
        const method = (azure as any).tocamelCase;
        expect(method('hello_world')).toBe('helloWorld');
        expect(method('foo_bar_baz')).toBe('fooBarBaz');
        expect(method('already_camel')).toBe('alreadyCamel');
      });
    });

    describe('camelCaseKeys', () => {
      it('should handle null and non-objects', () => {
        const method = (azure as any).camelCaseKeys;
        expect(method(null)).toBeNull();
        expect(method(undefined)).toBeUndefined();
        expect(method(123)).toBe(123);
        expect(method('string')).toBe('string');
      });

      it('should convert object keys to camelCase', () => {
        const method = (azure as any).camelCaseKeys;
        const input = {
          snake_case: 'value',
          nested_object: {
            another_key: 'value',
          },
          array_field: [{ item_one: 1 }, { item_two: 2 }],
        };

        const expected = {
          snakeCase: 'value',
          nestedObject: {
            another_key: 'value', // Method doesn't convert nested keys
          },
          arrayField: [{ item_one: 1 }, { item_two: 2 }],
        };

        expect(method(structuredClone(input))).toEqual(expected);
      });

      it('should handle empty objects and arrays', () => {
        const method = (azure as any).camelCaseKeys;
        const input = {
          empty_object: {},
          empty_array: [],
        };

        const expected = {
          emptyObject: {},
          emptyArray: [],
        };

        expect(method(input)).toEqual(expected);
      });
    });

    describe('maskSensitiveUrl', () => {
      it('should mask Azure OpenAI endpoint URLs', () => {
        const method = (azure as any).maskSensitiveUrl;

        expect(method('https://myorg.openai.azure.com/api')).toBe(
          'https://***.openai.azure.com/api',
        );

        expect(method('https://test-env.openai.azure.com/deployments')).toBe(
          'https://***.openai.azure.com/deployments',
        );
      });

      it('should not modify non-matching URLs', () => {
        const method = (azure as any).maskSensitiveUrl;

        const url = 'https://example.com/api';
        expect(method(url)).toBe(url);
      });
    });
  });
});
