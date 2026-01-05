import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { exams } from '../services/api';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ExamView = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (courseId) generateExam(courseId);
    }, [courseId]);

    const generateExam = async (id: string) => {
        try {
            const res = await exams.generate(id);
            setQuestions(res.data.questions);
        } catch (err) {
            console.error(err);
            alert('Failed to generate exam');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (qIndex: number, option: string) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const handleSubmit = async () => {
        setSubmitted(true); // Optimistic Update UI
        try {
            const res = await (await import('../services/api')).exams.submit(courseId || '', answers, questions);
            setScore(res.data.score);
        } catch (err) {
            console.error('Failed to submit exam', err);
            alert('Failed to save exam results');
        }
    };

    const handleDownloadCertificate = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userName = user.name || 'Student';

            // Ensure we have course title. fetching if missing
            let courseTitle = 'Course';

            // Try to get title from an existing course object if available, or fetch it
            try {
                const courseRes = await import('../services/api').then(m => m.courses.getOne(courseId || ''));
                courseTitle = courseRes.data.title;
            } catch (e) {
                console.error("Could not fetch course title for certificate", e);
            }

            const res = await import('../services/api').then(m => m.certificates.generate({
                courseId: courseId || 'unknown',
                userId: user.id || 'unknown',
                userName: userName,
                courseTitle: courseTitle
            }));

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${courseTitle.replace(/\s+/g, '_')}_Certificate.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error(err);
            alert('Failed to download certificate');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600">Generating AI Exam based on your course content...</p>
        </div>
    );

    if (questions.length === 0) return <div className="p-10 text-center">No questions generated.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="mb-8 border-b border-gray-100 pb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Course Final Exam</h1>
                    <p className="text-gray-500 mt-2">Test your knowledge. Select the best answer for each question.</p>
                </div>

                <div className="space-y-8">
                    {questions.map((q, idx) => (
                        <div key={idx} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <h3 className="font-semibold text-lg mb-4 text-gray-900">{idx + 1}. {q.question}</h3>
                            <div className="space-y-3">
                                {q.options.map((opt: string, optIdx: number) => {
                                    const isSelected = answers[idx] === opt;
                                    const isCorrect = q.correctAnswer === opt;
                                    const optionLabel = String.fromCharCode(65 + optIdx); // A, B, C, D...

                                    let containerClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ";
                                    let radioClass = "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ";

                                    if (submitted) {
                                        if (isCorrect) {
                                            containerClass += "bg-green-50 border-green-500 shadow-sm";
                                            radioClass += "border-green-600 bg-green-600 text-white";
                                        } else if (isSelected && !isCorrect) {
                                            containerClass += "bg-red-50 border-red-500 opacity-75";
                                            radioClass += "border-red-500 bg-red-500 text-white";
                                        } else {
                                            containerClass += "bg-gray-50 border-transparent opacity-50";
                                            radioClass += "border-gray-300 bg-transparent";
                                        }
                                    } else {
                                        if (isSelected) {
                                            containerClass += "bg-indigo-50 border-indigo-600 shadow-md ring-1 ring-indigo-600";
                                            radioClass += "border-indigo-600 bg-indigo-600 text-white";
                                        } else {
                                            containerClass += "bg-white border-gray-100 hover:border-indigo-200 hover:bg-gray-50 hover:shadow-sm";
                                            radioClass += "border-gray-300 bg-white group-hover:border-indigo-300";
                                        }
                                    }

                                    return (
                                        <button
                                            key={opt}
                                            onClick={() => handleOptionSelect(idx, opt)}
                                            className={containerClass}
                                            disabled={submitted}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Custom Radio Circle */}
                                                <div className={radioClass}>
                                                    {isSelected || (submitted && isCorrect) ? (
                                                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                                    ) : (
                                                        <span className="text-xs font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{optionLabel}</span>
                                                    )}
                                                </div>

                                                {/* Option Text */}
                                                <span className={`text-base ${isSelected ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {opt}
                                                </span>
                                            </div>

                                            {/* Status Icons */}
                                            {submitted && isCorrect && <CheckCircle className="w-6 h-6 text-green-600" />}
                                            {submitted && isSelected && !isCorrect && <AlertCircle className="w-6 h-6 text-red-600" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                    {submitted ? (
                        <div className="flex items-center gap-4">
                            <div className="text-xl font-bold">
                                Score: <span className={score >= 3 ? "text-green-600" : "text-red-600"}>{score} / {questions.length}</span>
                            </div>

                            {score >= 3 && (
                                <button
                                    onClick={() => handleDownloadCertificate()}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                                >
                                    Download Certificate
                                </button>
                            )}

                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={Object.keys(answers).length < questions.length}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit Exam
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamView;
