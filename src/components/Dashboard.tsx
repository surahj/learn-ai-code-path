import React, { useState, useEffect } from "react";
import LearningGoalSetup from "./LearningGoalSetup";
import { useAuth } from "../contexts/AuthContext";
import learningAPI, {
  LearningPlanStructure,
  CompleteLearningPlan,
  WeeklyTheme,
  WeeklyContent,
  DailyContent,
  LessonContent,
} from "../api/learning";
import "./Dashboard.css";
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
  Plus,
  Calendar,
  Target,
  Clock,
  ArrowRight,
  CheckCircle,
  FileText,
  BarChart3,
  ArrowLeft,
  Lightbulb,
  Link,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LearningGoal {
  goal: string;
  timePerDay: string;
  duration: string;
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
  </div>
);

const Dashboard: React.FC = () => {
  // Get auth context
  const { currentUser, token, logout } = useAuth();
  const navigate = useNavigate();

  const [showWelcome, setShowWelcome] = useState(true);

  // Backend integration state
  const [userLearnings, setUserLearnings] = useState<LearningPlanStructure[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLearning, setSelectedLearning] =
    useState<LearningPlanStructure | null>(null);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [detailedPlan, setDetailedPlan] = useState<CompleteLearningPlan | null>(
    null
  );
  const [loadingPlanDetails, setLoadingPlanDetails] = useState(false);
  const [completedWeeks, setCompletedWeeks] = useState<Set<number>>(new Set());
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<WeeklyTheme | null>(null);
  const [loadingWeekContent, setLoadingWeekContent] = useState(false);
  const [weeklyContent, setWeeklyContent] = useState<WeeklyContent | null>(
    null
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dailyContent, setDailyContent] = useState<DailyContent | null>(null);
  const [loadingDailyContent, setLoadingDailyContent] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);

  // Load user's learning plans from backend
  useEffect(() => {
    if (token) {
      loadUserLearnings();
    }
  }, [token]);

  const loadUserLearnings = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const learnings = await learningAPI.getLearnings(token);
      console.log("Raw learnings data:", learnings);

      // Validate that each learning has an ID
      const validLearnings = learnings.filter((learning) => {
        if (!learning.id) {
          console.error("Learning without ID:", learning);
          return false;
        }
        return true;
      });

      console.log("Valid learnings:", validLearnings);
      setUserLearnings(validLearnings);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.error("Failed to load learnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDetailedPlan = async (planId: number) => {
    console.log("=== loadDetailedPlan called ===");
    console.log("Plan ID:", planId);
    console.log("Token:", token);

    if (!token) {
      console.error("No token available");
      setError("Authentication required");
      return;
    }

    setLoadingPlanDetails(true);
    setError("");

    try {
      console.log("Calling learningAPI.getPlanStructure...");
      const response = await learningAPI.getPlanStructure(token, planId);
      console.log("API Response:", response);

      if (response && response.plan) {
        console.log("Setting detailedPlan to:", response.plan);
        setDetailedPlan(response.plan);
      } else {
        console.error("Invalid response format:", response);
        setError("Invalid response from server");
      }
    } catch (error) {
      console.error("loadDetailedPlan error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load plan details"
      );
    } finally {
      console.log("Setting loadingPlanDetails to false");
      setLoadingPlanDetails(false);
    }
  };

  const handleWeekStart = (weekNumber: number) => {
    if (!selectedLearning) return;
    navigate(`/dashboard/week/${selectedLearning.id}/${weekNumber}`);
  };

  const handleDaySelect = (dayNumber: number) => {
    if (!selectedLearning || !selectedWeek) return;
    navigate(
      `/dashboard/daily/${selectedLearning.id}/${selectedWeek.week_number}/${dayNumber}`
    );
  };

  const handleBackToWeek = () => {
    setSelectedDay(null);
    setDailyContent(null);
  };

  const handleWeekComplete = (weekNumber: number) => {
    setCompletedWeeks((prev) => new Set([...prev, weekNumber]));
    if (currentWeek === weekNumber) {
      setCurrentWeek(null);
    }
    setSelectedWeek(null);
    setWeeklyContent(null);
    setSelectedDay(null);
    setDailyContent(null);
  };

  const handleBackToPlan = () => {
    setSelectedWeek(null);
    setWeeklyContent(null);
    setSelectedDay(null);
    setDailyContent(null);
  };

  const handleDeletePlan = async (planId: number) => {
    if (!token) return;
    try {
      await learningAPI.deletePlan(token, planId);
      setUserLearnings((prev) => prev.filter((p) => p.id !== planId));
      setDeletingPlanId(null); // Close the dialog
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete plan");
    }
  };

  const handleGoalSet = async (goal: LearningGoal) => {
    setShowWelcome(false);
    setShowCreateNew(false);

    if (token) {
      try {
        setLoading(true);
        setError(null);

        // Generate learning plan structure using backend
        const request = {
          goal: goal.goal,
          total_weeks: parseInt(goal.duration),
          daily_commitment: parseInt(goal.timePerDay),
        };

        const result = await learningAPI.generatePlanStructure(token, request);
        console.log("Generated learning plan:", result);

        // Create a new learning structure object to add to the list
        const newLearning: LearningPlanStructure = {
          id: result.id,
          user_id: currentUser?.id || 0,
          goal: goal.goal,
          total_weeks: parseInt(goal.duration),
          structure: JSON.parse(JSON.stringify(result.plan)),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Add the new learning to the existing list
        setUserLearnings((prev) => [...prev, newLearning]);

        // Set the newly created learning as selected
        setSelectedLearning(newLearning);

        // Show success message or redirect to the new plan
        console.log("New learning plan created successfully:", newLearning);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        console.error("Failed to generate learning plan:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Weekly Content View Component
  const WeeklyContentView = ({ week }: { week: WeeklyTheme }) => {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBackToPlan} className="mb-4">
            ← Back to Learning Plan
          </Button>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
            <h1 className="text-3xl font-bold mb-2">Week {week.week_number}</h1>
            <h2 className="text-xl opacity-90">{week.theme}</h2>
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
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Learning Objectives
              </h3>
              <ul className="space-y-3">
                {week.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-700">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Concepts */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                Key Concepts
              </h3>
              <div className="flex flex-wrap gap-2">
                {week.key_concepts.map((concept, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            {week.prerequisites && week.prerequisites.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-orange-600" />
                  Prerequisites
                </h3>
                <ul className="space-y-2">
                  {week.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Daily Milestones */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Daily Learning Milestones
              </h3>
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
                </div>
              )}
            </div>

            {/* Adaptive Notes */}
            {weeklyContent.adaptive_notes && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                  Adaptive Learning Notes
                </h3>
                <blockquote className="border-l-4 border-yellow-400 pl-4 italic text-gray-700 bg-yellow-50 p-4 rounded-r-lg">
                  {weeklyContent.adaptive_notes}
                </blockquote>
              </div>
            )}

            {/* Progress Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                Track Progress
              </h3>
              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleWeekComplete(week.week_number)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Week as Complete
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleBackToPlan}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Plan
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Daily Content View Component
  const DailyContentView = ({ dayNumber }: { dayNumber: number }) => {
    if (!dailyContent || !selectedWeek) return null;

    const { content, exercises, resources } = dailyContent;
    const {
      title: lessonTitle,
      summary: lessonSummary,
      explanation: lessonExplanation,
      key_points: keyPoints,
    } = content;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBackToWeek} className="mb-4">
            ← Back to Week {selectedWeek?.week_number}
          </Button>

          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-2">
              Day {dayNumber}: {lessonTitle}
            </h1>
            <h2 className="text-xl opacity-90">{selectedWeek?.theme}</h2>
          </div>
        </div>

        {loadingDailyContent && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
            <span className="text-gray-600">Loading your daily content...</span>
          </div>
        )}

        {dailyContent && (
          <div className="space-y-8">
            {/* Lesson Content */}
            {content && (
              <div className="bg-white p-6 rounded-lg shadow-md border">
                {lessonSummary && (
                  <p className="text-lg text-gray-600 mb-6 italic border-l-4 border-blue-300 pl-4">
                    {lessonSummary}
                  </p>
                )}
                {lessonExplanation && (
                  <div className="prose max-w-none mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                      Detailed Explanation
                    </h3>
                    <div
                      className="text-gray-700"
                      dangerouslySetInnerHTML={{ __html: lessonExplanation }}
                    />
                  </div>
                )}
                {keyPoints.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Key Points:
                    </h4>
                    <ul className="space-y-2">
                      {keyPoints.map((point: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Exercises */}
            {exercises && (
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Practice Exercises
                </h3>
                <div className="prose max-w-none text-gray-700">
                  <pre className="whitespace-pre-wrap font-sans">
                    {JSON.stringify(exercises, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Resources */}
            {resources && (
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Link className="h-5 w-5 mr-2 text-purple-600" />
                  Learning Resources
                </h3>
                <div className="prose max-w-none text-gray-700">
                  <pre className="whitespace-pre-wrap font-sans">
                    {JSON.stringify(resources, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleBackToWeek}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Week
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleWeekComplete(selectedWeek!.week_number)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Day Complete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Show selected learning plan details if one is selected
  if (selectedLearning) {
    // Show weekly content view if a week is selected
    if (selectedWeek) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="user-controls">
            <span>{currentUser?.first_name}</span>
            <button onClick={handleLogout} className="logout-button">
              Log Out
            </button>
          </div>
          <WeeklyContentView week={selectedWeek} />
        </div>
      );
    }

    // Otherwise, show the detailed plan overview
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="user-controls">
          <span>{currentUser?.first_name}</span>
          <button onClick={handleLogout} className="logout-button">
            Log Out
          </button>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedLearning(null);
                  setDetailedPlan(null);
                  handleBackToPlan();
                }}
                className="mb-4"
              >
                ← Back to Learning Plans
              </Button>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedLearning.goal}
                    </h1>
                    <p className="text-lg text-gray-600">
                      {selectedLearning.total_weeks} weeks •{" "}
                      {selectedLearning.total_weeks * 7} days
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Created</div>
                    <div className="font-semibold">
                      {new Date(
                        selectedLearning.created_at
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {loadingPlanDetails && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-gray-600">
                      Loading your personalized learning plan...
                    </span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {detailedPlan && (
              <div className="space-y-8">
                {/* Progress Overview */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg
                      className="h-6 w-6 mr-3 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Your Progress
                  </h2>

                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {detailedPlan.weekly_themes.length}
                      </div>
                      <div className="text-sm text-gray-600">Total Weeks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {completedWeeks.size}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {currentWeek ? 1 : 0}
                      </div>
                      <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {Math.round(
                          (completedWeeks.size /
                            detailedPlan.weekly_themes.length) *
                            100
                        )}
                        %
                      </div>
                      <div className="text-sm text-gray-600">
                        Overall Progress
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>
                        {completedWeeks.size} of{" "}
                        {detailedPlan.weekly_themes.length} weeks
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (completedWeeks.size /
                              detailedPlan.weekly_themes.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Prerequisites Section */}
                {detailedPlan.prerequisites &&
                  Object.keys(detailedPlan.prerequisites).length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                        <BookOpen className="h-6 w-6 mr-3 text-blue-600" />
                        Prerequisites
                      </h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        {Object.entries(detailedPlan.prerequisites).map(
                          ([category, items]) => (
                            <div
                              key={category}
                              className="bg-blue-50 rounded-lg p-4"
                            >
                              <h3 className="font-semibold text-blue-900 mb-2 capitalize">
                                {category.replace("_", " ")}
                              </h3>
                              <ul className="space-y-1">
                                {items.map((item, index) => (
                                  <li
                                    key={index}
                                    className="text-sm text-blue-800 flex items-start"
                                  >
                                    <span className="text-blue-600 mr-2 mt-1">
                                      •
                                    </span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Weekly Themes Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Calendar className="h-6 w-6 mr-3 text-green-600" />
                    Your Learning Journey
                  </h2>
                  {!detailedPlan.weekly_themes ||
                  detailedPlan.weekly_themes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500 mb-4">
                        <Calendar className="h-12 w-12 mx-auto mb-2" />
                        <p>No weekly themes found in this plan.</p>
                      </div>
                      <p className="text-sm text-gray-400">
                        This might be due to incomplete plan generation. Please
                        try creating a new plan.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {detailedPlan.weekly_themes.map((week) => (
                        <div key={week.week_number} className="mb-6">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              Week {week.week_number}: {week.theme}
                            </h3>
                            <Button
                              variant="outline"
                              onClick={() => handleWeekStart(week.week_number)}
                            >
                              View Week
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Adaptive Rules Section */}
                {detailedPlan.adaptive_rules &&
                  Object.keys(detailedPlan.adaptive_rules).length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                        <svg
                          className="h-6 w-6 mr-3 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                        Adaptive Learning Rules
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(detailedPlan.adaptive_rules).map(
                          ([rule, description]) => (
                            <div
                              key={rule}
                              className="bg-indigo-50 rounded-lg p-4"
                            >
                              <h3 className="font-semibold text-indigo-900 mb-2 capitalize">
                                {rule.replace("_", " ")}
                              </h3>
                              <p className="text-sm text-indigo-800">
                                {description}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Start Learning CTA */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-8 text-center text-white">
                  <h2 className="text-3xl font-bold mb-4">
                    Ready to Start Your Learning Journey?
                  </h2>
                  <p className="text-xl mb-6 opacity-90">
                    Your personalized curriculum is ready. Begin with Week 1 and
                    let AI guide your progress!
                  </p>
                  <Button
                    size="lg"
                    className="bg-white text-green-600 hover:bg-gray-100 font-semibold"
                    onClick={() => handleWeekStart(1)}
                  >
                    Start Learning Now
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show goal setup only when user explicitly wants to create new plan
  if (showCreateNew) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="user-controls">
          <span>{currentUser?.first_name}</span>
          <button onClick={handleLogout} className="logout-button">
            Log Out
          </button>
        </div>
        <LearningGoalSetup
          onGoalSet={handleGoalSet}
          loading={loading}
          onBack={() => setShowCreateNew(false)}
        />
      </div>
    );
  }

  // Show learning plans if user has existing learnings (prioritize this over welcome)
  if (userLearnings.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="user-controls">
          <span>{currentUser?.first_name}</span>
          <button onClick={handleLogout} className="logout-button">
            Log Out
          </button>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Your Learning Plans
              </h1>
              <p className="text-lg text-gray-600">
                Choose a plan to continue or create a new one
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {userLearnings.map((learning) => (
                <Card
                  key={learning.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    if (!learning.id) {
                      console.error("Learning ID is undefined!");
                      setError("Invalid learning plan: missing ID");
                      return;
                    }
                    setSelectedLearning(learning);
                    loadDetailedPlan(learning.id);
                  }}
                >
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span>{learning.goal}</span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingPlanId(learning.id);
                            }}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </AlertDialogTrigger>
                        {deletingPlanId === learning.id && (
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your learning plan and all of
                                its associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={(e) => e.stopPropagation()}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePlan(learning.id);
                                }}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        )}
                      </AlertDialog>
                    </CardTitle>
                    <CardDescription>ID: {learning.id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        <span>Goal: {learning.goal}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Duration: {learning.total_weeks} weeks</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          Created:{" "}
                          {new Date(learning.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!learning.id) {
                          console.error("Learning ID is undefined!");
                          setError("Invalid learning plan: missing ID");
                          return;
                        }
                        setSelectedLearning(learning);
                        loadDetailedPlan(learning.id);
                      }}
                    >
                      Continue Learning <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={() => setShowCreateNew(true)} // This will show the learning goal setup
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Plan...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Learning Plan
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show welcome screen for new users (only if no existing learnings)
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="user-controls">
          <span>{currentUser?.first_name}</span>
          <button onClick={handleLogout} className="logout-button">
            Log Out
          </button>
        </div>

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="text-center max-w-2xl">
            <div className="mb-8">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to AI Mentor! 🎉
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Let's create your personalized learning journey. We'll help you
                master new skills with AI-powered guidance.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-4">What you'll get:</h2>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">
                    Personalized Curriculum
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tailored lessons based on your goals and schedule
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">AI-Powered Learning</h3>
                  <p className="text-sm text-gray-600">
                    Smart explanations and adaptive content
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Track Progress</h3>
                  <p className="text-sm text-gray-600">
                    Monitor your learning journey and achievements
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowWelcome(false)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105"
            >
              Let's Get Started! 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show goal setup for new users who have no learning plans
  if (userLearnings.length === 0 && !showCreateNew) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="user-controls">
          <span>{currentUser?.first_name}</span>
          <button onClick={handleLogout} className="logout-button">
            Log Out
          </button>
        </div>
        <LearningGoalSetup onGoalSet={handleGoalSet} loading={loading} />
      </div>
    );
  }

  return <LoadingSpinner />;
};

export default Dashboard;
