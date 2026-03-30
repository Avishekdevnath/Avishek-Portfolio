import assert from 'node:assert/strict';
import test from 'node:test';

import { generateAIContent } from './outreach-ai';

test('generateAIContent prefers OpenAI when OPENAI_API_KEY is configured', async () => {
  const originalFetch = global.fetch;
  const originalOpenAIKey = process.env.OPENAI_API_KEY;
  const originalGoogleKey = process.env.GOOGLE_AI_API_KEY;

  let requestUrl = '';
  let requestInit: RequestInit | undefined;

  global.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    requestUrl = String(input);
    requestInit = init;

    return new Response(
      JSON.stringify({
        output: [
          {
            type: 'message',
            content: [
              {
                type: 'output_text',
                text: 'EMAIL_SUBJECT: Hello',
              },
            ],
          },
        ],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }) as typeof fetch;

  process.env.OPENAI_API_KEY = 'test-openai-key';
  process.env.GOOGLE_AI_API_KEY = 'expired-google-key';

  try {
    const content = await generateAIContent('Write a draft');

    assert.equal(content, 'EMAIL_SUBJECT: Hello');
    assert.equal(requestUrl, 'https://api.openai.com/v1/responses');
    assert.equal((requestInit?.headers as Record<string, string>).Authorization, 'Bearer test-openai-key');

    const body = JSON.parse(String(requestInit?.body));
    assert.equal(body.model, 'gpt-5.4');
    assert.equal(body.input, 'Write a draft');
  } finally {
    global.fetch = originalFetch;

    if (originalOpenAIKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalOpenAIKey;

    if (originalGoogleKey === undefined) delete process.env.GOOGLE_AI_API_KEY;
    else process.env.GOOGLE_AI_API_KEY = originalGoogleKey;
  }
});

test('generateAIContent falls back to Google AI when OPENAI_API_KEY is missing', async () => {
  const originalFetch = global.fetch;
  const originalOpenAIKey = process.env.OPENAI_API_KEY;
  const originalGoogleKey = process.env.GOOGLE_AI_API_KEY;

  let requestUrl = '';

  global.fetch = (async (input: string | URL | Request) => {
    requestUrl = String(input);

    return new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'SUBJECT: Hello',
                },
              ],
            },
          },
        ],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }) as typeof fetch;

  delete process.env.OPENAI_API_KEY;
  process.env.GOOGLE_AI_API_KEY = 'test-google-key';

  try {
    const content = await generateAIContent('Write a draft');

    assert.equal(content, 'SUBJECT: Hello');
    assert.match(requestUrl, /^https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-pro:generateContent\?key=/);
  } finally {
    global.fetch = originalFetch;

    if (originalOpenAIKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalOpenAIKey;

    if (originalGoogleKey === undefined) delete process.env.GOOGLE_AI_API_KEY;
    else process.env.GOOGLE_AI_API_KEY = originalGoogleKey;
  }
});
