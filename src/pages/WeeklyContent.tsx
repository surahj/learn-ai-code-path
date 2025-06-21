import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import learningAPI, { WeeklyContent, WeeklyTheme } from "../api/learning";
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
  Calendar,
  Clock,
  Lightbulb,
  BarChart3,
  Plus,
} from "lucide-react";

const WeeklyContentPage: React.FC = () => {
  const { planId, weekNumber } = useParams<{
    planId: string;
    weekNumber: string;
  }>();

  const navigate = useNavigate();
  const { currentUser, token, logout } = useAuth();

  const [weeklyContent, setWeeklyContent] = useState<WeeklyContent | null>(
    null
  );
  const [weekTheme, setWeekTheme] = useState<WeeklyTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingWeekContent, setLoadingWeekContent] = useState(false);

  useEffect(() => {
    if (!token || !planId || !weekNumber) {
      setError("Missing required parameters");
      setLoading(false);
      return;
    }

    loadWeekContent();
  }, [token, planId, weekNumber]);

  const loadWeekContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, try to fetch existing content
      try {
        const existingContent = await learningAPI.getWeekContent(
          token!,
          parseInt(planId!),
          parseInt(weekNumber!)
        );
        setWeeklyContent(existingContent);
        console.log("Fetched existing weekly content:", existingContent);
      } catch (error) {
        if ((error as Error).message === "NOT_FOUND") {
          // If not found, generate it
          console.log("No existing content, generating new weekly content...");
          setLoadingWeekContent(true);
          try {
            const userProgress = {}; // TODO: Get actual user progress
            const newContent = await learningAPI.generateWeekContent(token!, {
              plan_id: parseInt(planId!),
              week_number: parseInt(weekNumber!),
              user_progress: userProgress,
            });
            setWeeklyContent(newContent.content);
            console.log("Generated new weekly content:", newContent.content);
          } catch (genError) {
            console.error("Failed to generate weekly content:", genError);
            setError(
              genError instanceof Error
                ? genError.message
                : "Failed to generate weekly content"
            );
          } finally {
            setLoadingWeekContent(false);
          }
        } else {
          // Handle other errors (e.g., server errors)
          console.error("Failed to fetch weekly content:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Failed to fetch weekly content"
          );
        }
      }
    } catch (error) {
      console.error("Failed to load week content:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load week content"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDaySelect = (dayNumber: number) => {
    navigate(`/dashboard/daily/${planId}/${weekNumber}/${dayNumber}`);
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
        <div className="user-controls">
          <span>{currentUser?.first_name}</span>
          <button onClick={handleLogout} className="logout-button">
            Log Out
          </button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Loading your weekly content...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="user-controls">
          <span>{currentUser?.first_name}</span>
          <button onClick={handleLogout} className="logout-button">
            Log Out
          </button>
        </div>
        <div className="max-w-4xl mx-auto p-6">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={handleBackToDashboard}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!weeklyContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="user-controls">
          <span>{currentUser?.first_name}</span>
          <button onClick={handleLogout} className="logout-button">
            Log Out
          </button>
        </div>
        <div className="max-w-4xl mx-auto p-6">
          <Alert className="mb-6">
            <AlertDescription>No weekly content found.</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={handleBackToDashboard}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="user-controls">
        <span>{currentUser?.first_name}</span>
        <button onClick={handleLogout} className="logout-button">
          Log Out
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleBackToDashboard}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning Plan
          </Button>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
            <h1 className="text-3xl font-bold mb-2">Week {weekNumber}</h1>
            <h2 className="text-xl opacity-90">
              {weeklyContent.theme || `Week ${weekNumber} Theme`}
            </h2>
          </div>
        </div>

        {loadingWeekContent && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">
              Generating your personalized weekly content...
            </span>
          </div>
        )}

        {weeklyContent && (
          <div className="space-y-6">
            {/* Learning Objectives */}
            {weeklyContent.objectives &&
              weeklyContent.objectives.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      Learning Objectives
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {weeklyContent.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                          <span className="text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

            {/* Key Concepts */}
            {weeklyContent.key_concepts &&
              weeklyContent.key_concepts.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                      Key Concepts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {weeklyContent.key_concepts.map((concept, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Prerequisites */}
            {weeklyContent.prerequisites &&
              weeklyContent.prerequisites.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-orange-600" />
                      Prerequisites
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {weeklyContent.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

            {/* Daily Milestones */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Daily Learning Milestones
                </CardTitle>
                <CardDescription>
                  Click on any day to start your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingWeekContent ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      Generating milestones...
                    </p>
                  </div>
                ) : weeklyContent.daily_milestones &&
                  weeklyContent.daily_milestones.length > 0 ? (
                  <div className="grid gap-4">
                    {weeklyContent.daily_milestones.map((milestone) => (
                      <div
                        key={milestone.day_number}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleDaySelect(milestone.day_number)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">
                            Day {milestone.day_number}: {milestone.topic}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                milestone.difficulty === "Easy"
                                  ? "bg-green-100 text-green-800"
                                  : milestone.difficulty === "Medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {milestone.difficulty}
                            </span>
                            <span className="text-sm text-gray-500">
                              {milestone.duration_minutes} min
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {milestone.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">
                      No daily milestones available for this week.
                    </p>
                    <Button onClick={loadWeekContent} className="mt-4">
                      Generate Daily Milestones
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Adaptive Notes */}
            {weeklyContent.adaptive_notes && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                    Adaptive Learning Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <blockquote className="border-l-4 border-yellow-400 pl-4 italic text-gray-700 bg-yellow-50 p-4 rounded-r-lg">
                    <p>{weeklyContent.adaptive_notes}</p>
                  </blockquote>
                </CardContent>
              </Card>
            )}

            {/* Progress Actions */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                  Track Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      // TODO: Mark week as complete
                      handleBackToDashboard();
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Week as Complete
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleBackToDashboard}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyContentPage;
