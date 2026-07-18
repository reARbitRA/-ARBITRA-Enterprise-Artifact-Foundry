// FIX: The original schemas were in test files. Adding placeholder types to resolve errors.
type Prompt = {
    model: string;
    text: string;
};
type AIResponse = {
    id: string;
    usage: {
        totalTokens: number;
    },
    content: string;
};


export const beforeRequest = (prompt: Prompt) => {
  console.log('[Middleware] Before AI request:', {
    model: prompt.model,
    tokens: prompt.text.length
  });
  return prompt;
};

export const afterResponse = (response: AIResponse) => {
  console.log('[Middleware] After AI response:', {
    id: response.id,
    tokens: response.usage.totalTokens
  });
  return response;
};

export const handleError = (error: Error) => {
  console.error('[Middleware] AI request error:', error.message);
  throw error;
};

export const transformResponse = (response: AIResponse): AIResponse => {
  return {
    ...response,
    content: response.content.trim()
  };
};

export const cacheResponse = (key: string, response: AIResponse) => {
  const cacheKey = `ai_response_${key}`;
  try {
    localStorage.setItem(cacheKey, JSON.stringify(response));
  } catch (e) {
    console.warn('[Middleware] Failed to cache response:', e);
  }
};