
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, CheckCircle, MessageSquare } from 'lucide-react';
import CodeEditor from './CodeEditor';
import AIMentor from './AIMentor';

interface Lesson {
  id: number;
  title: string;
  description: string;
  explanation: string;
  practiceTask: string;
  starterCode: string;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
  };
  completed: boolean;
}

interface LessonViewProps {
  lesson: Lesson;
  totalLessons: number;
  completedLessons: number;
  onLessonComplete: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ 
  lesson, 
  totalLessons, 
  completedLessons, 
  onLessonComplete 
}) => {
  const [code, setCode] = useState(lesson.starterCode);
  const [output, setOutput] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAIMentor, setShowAIMentor] = useState(false);

  const runCode = () => {
    try {
      // Create a safe evaluation environment
      const log = (message: any) => {
        setOutput(prev => prev + String(message) + '\n');
      };
      
      // Clear previous output
      setOutput('');
      
      // Create a function to safely execute the code
      const func = new Function('console', code);
      func({ log });
    } catch (error) {
      setOutput(`Error: ${error}`);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleLessonComplete = () => {
    if (selectedAnswer === lesson.quiz.correctAnswer) {
      onLessonComplete();
    }
  };

  const progressPercentage = (completedLessons / totalLessons) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              JavaScript Mentor
            </h1>
            <Badge variant="secondary">
              Day {lesson.id} of {totalLessons}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{completedLessons} of {totalLessons} lessons completed</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {lesson.completed && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {lesson.title}
                </CardTitle>
                <CardDescription>{lesson.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="learn" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="learn">Learn</TabsTrigger>
                    <TabsTrigger value="practice">Practice</TabsTrigger>
                    <TabsTrigger value="quiz">Quiz</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="learn" className="space-y-4">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed">{lesson.explanation}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="practice" className="space-y-4">
                    <div className="space-y-4">
                      <p className="text-gray-700">{lesson.practiceTask}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Code Editor</h4>
                          <Button onClick={runCode} size="sm" className="bg-green-600 hover:bg-green-700">
                            <Play className="w-4 h-4 mr-2" />
                            Run Code
                          </Button>
                        </div>
                        <CodeEditor
                          value={code}
                          onChange={setCode}
                          height="250px"
                        />
                      </div>
                      
                      {output && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Output</h4>
                          <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-sm">
                            <pre>{output}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="quiz" className="space-y-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">{lesson.quiz.question}</h4>
                      <div className="space-y-2">
                        {lesson.quiz.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuizAnswer(index)}
                            className={`w-full text-left p-3 rounded-md border transition-colors ${
                              selectedAnswer === index
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      
                      {selectedAnswer !== null && (
                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={handleLessonComplete}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            disabled={lesson.completed}
                          >
                            {lesson.completed ? 'Completed' : 'Complete Lesson'}
                          </Button>
                          {selectedAnswer === lesson.quiz.correctAnswer && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Correct!
                            </Badge>
                          )}
                          {selectedAnswer !== lesson.quiz.correctAnswer && (
                            <Badge variant="destructive">
                              Try again
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  AI Mentor
                </CardTitle>
                <CardDescription>
                  Ask me anything about JavaScript!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowAIMentor(true)}
                  variant="outline"
                  className="w-full"
                >
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-medium">{completedLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className="font-medium">{totalLessons - completedLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span>Progress:</span>
                  <span className="font-medium">{Math.round(progressPercentage)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showAIMentor && (
        <AIMentor 
          onClose={() => setShowAIMentor(false)}
          currentLesson={lesson}
        />
      )}
    </div>
  );
};

export default LessonView;
