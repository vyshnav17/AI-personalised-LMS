const axios = require('axios');

const API_URL = 'http://127.0.0.1:3000';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testOllamaIntegration() {
    try {
        console.log('1. Registering User...');
        const email = `test.ollama.${Date.now()}@example.com`;
        const password = 'password123';

        await axios.post(`${API_URL}/auth/register`, {
            email,
            password,
            role: 'STUDENT'
        });

        console.log('2. Logging In...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });

        const token = loginRes.data.access_token;
        console.log('   Token received.');

        console.log('3. Generating Course via Ollama (Async process)...');
        const start = Date.now();
        const courseRes = await axios.post(`${API_URL}/courses/generate`,
            { prompt: "Learn colors" },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const courseId = courseRes.data.id;
        console.log('   Course ID:', courseId);
        console.log('   Initial Status:', courseRes.data.status);

        console.log('4. Polling for completion...');
        let status = 'CREATING';
        let moduleCount = 0;
        let attempts = 0;
        const maxAttempts = 150; // 5 minutes approx

        while (status === 'CREATING' && attempts < maxAttempts) {
            await sleep(2000);
            attempts++;
            process.stdout.write('.');

            try {
                const getRes = await axios.get(`${API_URL}/courses/${courseId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                status = getRes.data.status;
                if (getRes.data.modules) {
                    moduleCount = getRes.data.modules.length;
                }
            } catch (err) {
                console.log('   Error polling:', err.message);
            }
        }
        console.log(''); // newline

        const duration = (Date.now() - start) / 1000;
        console.log(`   Final Status: ${status} (after ${duration.toFixed(2)}s)`);

        if (status === 'READY') {
            if (moduleCount > 0) {
                console.log(`   SUCCESS: Course generated with ${moduleCount} modules.`);

                // Step 5: Generate Detailed Lesson Content
                try {
                    const firstModule = (await axios.get(`${API_URL}/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` } })).data.modules[0];
                    if (firstModule && firstModule.lessons && firstModule.lessons.length > 0) {
                        const firstLesson = firstModule.lessons[0];
                        console.log(`5. Generating detailed content for lesson: ${firstLesson.title}...`);

                        const lessonStart = Date.now();
                        const lessonRes = await axios.post(
                            `${API_URL}/courses/${courseId}/lessons/${firstLesson.id}/generate`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        const lessonDuration = (Date.now() - lessonStart) / 1000;
                        const newContent = lessonRes.data.content;

                        console.log(`   Lesson generated in ${lessonDuration.toFixed(2)}s`);
                        console.log(`   Content Length: ${newContent.length} chars`);

                        if (newContent.length > 500) {
                            console.log('   SUCCESS: Detailed content generated (>500 chars).');
                        } else {
                            console.warn('   WARNING: Content seems short.');
                        }
                    } else {
                        console.warn('   WARNING: No lessons found to generate content for.');
                    }
                } catch (lessonErr) {
                    console.error('   FAILURE: Lesson generation failed', lessonErr.message);
                }

            } else {
                console.log('   WARNING: Status is READY but 0 modules found.');
            }
        } else {
            console.error('   FAILURE: Course generation failed or timed out.');
        }

    } catch (error) {
        console.error('TEST FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
            console.error('Code:', error.code);
        }
    }
}

testOllamaIntegration();
