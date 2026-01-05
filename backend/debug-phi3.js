const OpenAI = require('openai');

const openai = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama',
});

async function main() {
    const prompt = "Learn colors";
    const systemPrompt = `
      You are an expert curriculum designer. 
      Create a structured learning path for the user's request.
      IMPORTANT:
      - Each lesson content MUST be detailed, comprehensive, and educational.
      - Use Markdown formatting (headers, lists, code blocks).
      - Include practical examples and real-world context.
      - Aim for approx 300 words per lesson.
      Return ONLY valid JSON format without markdown code blocks:
      {
        "title": "Course Title",
        "description": "Brief description",
        "modules": [
          {
            "title": "Module Title",
            "lessons": [
              { "title": "Lesson Title", "content": "Detailed markdown content with headers, examples, and explanation (approx 200 words)..." }
            ]
          }
        ]
      }
      User Request: ${prompt}
    `;

    try {
        console.log('Sending request to phi3...');
        const start = Date.now();
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }],
            model: 'phi3',
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });
        console.log(`Response received in ${(Date.now() - start) / 1000}s`);

        const content = completion.choices[0].message.content;
        console.log('RAW CONTENT START');
        console.log(content);
        console.log('RAW CONTENT END');

        try {
            JSON.parse(content);
            console.log('JSON Parse Successful');
        } catch (e) {
            console.error('JSON Parse Failed:', e.message);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
