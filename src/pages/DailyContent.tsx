import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import learningAPI, { DailyContent, LessonContent } from "../api/learning";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  Target,
  CheckCircle,
  ArrowLeft,
  Link,
  Calendar,
  Clock,
  Lightbulb,
  BarChart3,
  FileText,
  Youtube,
  Book,
  Code,
} from "lucide-react";

const getResourceIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "article":
      return <FileText className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />;
    case "video":
      return <Youtube className="h-5 w-5 mr-3 text-red-500 flex-shrink-0" />;
    case "book":
      return <Book className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />;
    case "online course":
      return <Code className="h-5 w-5 mr-3 text-purple-500 flex-shrink-0" />;
    default:
      return <Link className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0" />;
  }
};

const DailyContentPage: React.FC = () => {
  const { planId, weekNumber, dayNumber } = useParams<{
    planId: string;
    weekNumber: string;
    dayNumber: string;
  }>();

  const navigate = useNavigate();
  const { currentUser, token, logout } = useAuth();

  const [dailyContent, setDailyContent] = useState<DailyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekTheme, setWeekTheme] = useState<string>("");

  useEffect(() => {
    if (!token || !planId || !weekNumber || !dayNumber) {
      setError("Missing required parameters");
      setLoading(false);
      return;
    }

    loadDailyContent();
  }, [token, planId, weekNumber, dayNumber]);

  const loadDailyContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const content = await learningAPI.getDailyContent(
        token!,
        parseInt(planId!),
        parseInt(weekNumber!),
        parseInt(dayNumber!)
      );

      setDailyContent(content);

      // Try to get week theme from the content or set a default
      setWeekTheme(`Week ${weekNumber}`);
    } catch (error) {
      console.error("Failed to load daily content:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load daily content"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToWeek = () => {
    navigate(`/dashboard/week/${planId}/${weekNumber}`);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="user-controls flex justify-between items-center p-4">
          <span className="text-lg font-medium">{currentUser?.first_name}</span>
          <Button variant="ghost" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
          <span className="text-gray-600">Loading your daily content...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="user-controls flex justify-between items-center p-4">
          <span className="text-lg font-medium">{currentUser?.first_name}</span>
          <Button variant="ghost" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
        <div className="max-w-4xl mx-auto p-6">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={handleBackToWeek}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Week
            </Button>
            <Button variant="outline" onClick={handleBackToDashboard}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!dailyContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="user-controls flex justify-between items-center p-4">
          <span className="text-lg font-medium">{currentUser?.first_name}</span>
          <Button variant="ghost" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
        <div className="max-w-4xl mx-auto p-6">
          <Alert className="mb-6">
            <AlertDescription>No daily content found.</AlertDescription>
          </Alert>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={handleBackToWeek}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Week
            </Button>
            <Button variant="outline" onClick={handleBackToDashboard}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { content, exercises, resources } = dailyContent;
  const {
    title: lessonTitle,
    summary: lessonSummary,
    explanation: lessonExplanation,
    key_points: keyPoints,
  } = content as LessonContent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="user-controls flex justify-between items-center p-4">
        <span className="text-lg font-medium">{currentUser?.first_name}</span>
        <Button variant="ghost" onClick={handleLogout}>
          Log Out
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <Button variant="outline" onClick={handleBackToWeek}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Week {weekNumber}
            </Button>
            <Button variant="outline" onClick={handleBackToDashboard}>
              Back to Dashboard
            </Button>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-4 mb-2">
              <Calendar className="h-6 w-6" />
              <span className="text-lg font-medium">
                Week {weekNumber}, Day {dayNumber}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{lessonTitle}</h1>
            <h2 className="text-xl opacity-90">{weekTheme}</h2>
          </div>
        </div>

        <div className="space-y-8">
          {/* Lesson Content */}
          {content && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Lesson Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {lessonSummary && (
                  <div className="bg-blue-50 border-l-4 border-blue-300 p-4 rounded-r-lg">
                    <p className="text-lg text-gray-700 italic">
                      {lessonSummary}
                    </p>
                  </div>
                )}

                {lessonExplanation && (
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
                      Detailed Explanation
                    </h3>
                    <div
                      className="prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ __html: lessonExplanation }}
                    />
                  </div>
                )}

                {keyPoints && keyPoints.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-green-600" />
                      Key Points
                    </h4>
                    <ul className="space-y-2">
                      {keyPoints.map((point: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Exercises */}
          {exercises && Object.keys(exercises).length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Practice Exercises
                </CardTitle>
                <CardDescription>
                  Complete these exercises to reinforce your learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none text-gray-700">
                  <pre className="whitespace-pre-wrap font-sans bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(exercises, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resources */}
          {resources && resources.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Link className="h-5 w-5 mr-2 text-purple-600" />
                  Learning Resources
                </CardTitle>
                <CardDescription>
                  Additional materials to enhance your understanding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resources.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      {getResourceIcon(resource.type)}
                      <div className="flex-1">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {resource.title}
                        </a>
                        <p className="text-sm text-gray-600 mt-1">
                          {resource.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <Button variant="outline" onClick={handleBackToWeek}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Week
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  // TODO: Mark day as complete
                  handleBackToWeek();
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Day Complete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyContentPage;
