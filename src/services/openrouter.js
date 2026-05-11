export const getApiKey = () => {
  return localStorage.getItem('mygpt_api_key') || '';
};

export const chatCompletion = async (messages, model = 'anthropic/claude-3.5-sonnet') => {
  try {
    const customKey = getApiKey();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (customKey) {
      headers['X-Custom-API-Key'] = customKey;
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model,
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.body;
  } catch (error) {
    console.error('Chat Completion Error:', error);
    throw error;
  }
};

export const generateImage = async (prompt, width = 1024, height = 1024) => {
  try {
    const response = await fetch('/api/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, width, height }),
    });

    if (!response.ok) {
      throw new Error(`Image API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Image Generation Error:', error);
    throw error;
  }
};

export const parseStream = (chunk, onText) => {
  const lines = chunk.split('\n').filter((line) => line.trim() !== '');
  for (const line of lines) {
    const message = line.replace(/^data: /, '');
    if (message === '[DONE]') return;
    try {
      const parsed = JSON.parse(message);
      const content = parsed.choices[0]?.delta?.content;
      if (content) onText(content);
    } catch (e) {
      // Ignore parse errors for incomplete chunks
    }
  }
};
