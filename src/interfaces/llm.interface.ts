
export interface LLMConfig {
  model: string;
  temperature?: number;
  max_tokens?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
}
export interface LLMRequest {
  messages: LLMMessage[];
  config?: Partial<LLMConfig>;
}

export interface LLMResponse<T = any> {
  content: T;
  usage: {
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
  };
  latencyMs: number;
}