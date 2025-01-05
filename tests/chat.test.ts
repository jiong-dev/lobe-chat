import { createHeadersWithPluginSettings } from '@lobehub/chat-plugin-sdk';
import { PluginRequestPayload } from '@lobehub/chat-plugin-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ModelProvider } from '@/libs/agent-runtime';
import { AgentRuntime } from '@/libs/agent-runtime';
import { getProviderAuthPayload } from '@/services/_auth';
import { createHeaderWithAuth } from '@/services/_auth';
import { ChatService, initializeWithClientStore } from '@/services/chat';
import { ChatMessage, MessageRoleType } from '@/types/message';
import { OpenAIChatMessage } from '@/types/openai/chat';
import { fetchSSE } from '@/utils/fetch';

vi.mock('@/services/_auth', () => ({
  getProviderAuthPayload: vi.fn(),
  createHeaderWithAuth: vi.fn(),
}));

vi.mock('@/libs/agent-runtime', () => ({
  AgentRuntime: {
    initializeWithProviderOptions: vi.fn(),
  },
  ModelProvider: {
    OpenAI: 'openai',
    Azure: 'azure',
    Google: 'google',
    Bedrock: 'bedrock',
    Ollama: 'ollama',
    Perplexity: 'perplexity',
    Anthropic: 'anthropic',
    Groq: 'groq',
    Cloudflare: 'cloudflare',
  },
}));

vi.mock('@/utils/fetch', () => ({
  fetchSSE: vi.fn(),
}));

vi.mock('@lobehub/chat-plugin-sdk', () => ({
  createHeadersWithPluginSettings: vi.fn(),
}));

describe('ChatService', () => {
  let chatService: ChatService;

  beforeEach(() => {
    chatService = new ChatService();
    vi.clearAllMocks();
  });

  describe('initializeWithClientStore', () => {
    it('should initialize AgentRuntime with OpenAI provider', async () => {
      const provider = ModelProvider.OpenAI;
      const payload = { some: 'payload' };
      const providerAuthPayload = { endpoint: 'https://openai.com' };

      vi.mocked(getProviderAuthPayload).mockReturnValue(providerAuthPayload);

      await initializeWithClientStore(provider, payload);

      expect(getProviderAuthPayload).toHaveBeenCalledWith(provider);
      expect(AgentRuntime.initializeWithProviderOptions).toHaveBeenCalledWith(provider, {
        [provider]: {
          dangerouslyAllowBrowser: true,
          ...providerAuthPayload,
          baseURL: providerAuthPayload.endpoint,
          ...payload,
        },
      });
    });

    it('should initialize AgentRuntime with Azure provider', async () => {
      const provider = ModelProvider.Azure;
      const payload = { some: 'payload' };
      const providerAuthPayload = {
        azureApiVersion: '2021-06-01',
        apiKey: 'azure-key',
        endpoint: 'https://azure.com',
      };

      vi.mocked(getProviderAuthPayload).mockReturnValue(providerAuthPayload);

      await initializeWithClientStore(provider, payload);

      expect(getProviderAuthPayload).toHaveBeenCalledWith(provider);
      expect(AgentRuntime.initializeWithProviderOptions).toHaveBeenCalledWith(provider, {
        [provider]: {
          dangerouslyAllowBrowser: true,
          ...providerAuthPayload,
          apiVersion: providerAuthPayload.azureApiVersion,
          apikey: providerAuthPayload.apiKey,
          ...payload,
        },
      });
    });
  });

  describe('createAssistantMessage', () => {
    it('should create assistant message with default model and params', async () => {
      const params = {
        messages: [{ role: 'user' as MessageRoleType, content: 'Hello' }] as ChatMessage[],
        plugins: [] as string[],
      };

      const options = {};

      await chatService.createAssistantMessage(params, options);

      expect(fetchSSE).toHaveBeenCalled();
    });
  });

  describe('createAssistantMessageStream', () => {
    it('should create assistant message stream', async () => {
      const params = {
        params: {
          messages: [{ role: 'user' as MessageRoleType, content: 'Hello' }] as ChatMessage[],
          plugins: [] as string[],
        },
        abortController: new AbortController(),
        onAbort: vi.fn(),
        onMessageHandle: vi.fn(),
        onErrorHandle: vi.fn(),
        onFinish: vi.fn(),
        trace: {},
        isWelcomeQuestion: false,
        historySummary: '',
      };

      await chatService.createAssistantMessageStream(params);

      expect(fetchSSE).toHaveBeenCalled();
    });
  });

  describe('getChatCompletion', () => {
    it('should fetch chat completion with default model and params', async () => {
      const params = {
        messages: [{ role: 'user', content: 'Hello' }] as OpenAIChatMessage[],
      };

      const options = {};

      await chatService.getChatCompletion(params, options);

      expect(fetchSSE).toHaveBeenCalled();
    });
  });

  describe('runPluginApi', () => {
    it('should run plugin API and return result', async () => {
      const params: PluginRequestPayload = {
        identifier: 'plugin-id',
        apiName: 'test-api',
        some: 'params',
      } as any;
      const options = {};

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => 'response text',
        headers: {
          get: vi.fn().mockReturnValue('trace-id'),
        },
      });

      const result = await chatService.runPluginApi(params, options);

      expect(global.fetch).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('fetchPresetTaskResult', () => {
    it('should fetch preset task result and handle messages', async () => {
      const params = {
        params: { messages: [{ role: 'user', content: 'Hello' }] as OpenAIChatMessage[] },
        onMessageHandle: vi.fn(),
        onFinish: vi.fn(),
        onError: vi.fn(),
        onLoadingChange: vi.fn(),
        abortController: new AbortController(),
        trace: {},
      };

      await chatService.fetchPresetTaskResult(params);

      expect(fetchSSE).toHaveBeenCalled();
    });
  });
});
