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
  ExternalLink,
  User,
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
import UserProfileSetup from "./UserProfileSetup";
import authAPI from "../api/auth";

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

  const [showWelcome, setShowWelcome] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Backend integration state
  const [userLearnings, setUserLearnings] = useState<LearningPlanStructure[]>(
    []
  );
  const [loading, setLoading] = useState(true);
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Helper functions to format time and duration
  const formatCommitment = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else if (minutes === 60) {
      return "1 hour";
    } else {
      const hours = minutes / 60;
      if (hours === Math.floor(hours)) {
        return `${hours} hours`;
      } else {
        return `${hours} hours`;
      }
    }
  };

  const formatDuration = (weeks: number): string => {
    if (weeks < 4) {
      return `${weeks} week${weeks > 1 ? "s" : ""}`;
    } else if (weeks === 4) {
      return "1 month";
    } else if (weeks < 48) {
      const months = Math.floor(weeks / 4);
      const remainingWeeks = weeks % 4;
      if (remainingWeeks === 0) {
        return `${months} month${months > 1 ? "s" : ""}`;
      } else {
        return `${months} month${months > 1 ? "s" : ""} ${remainingWeeks} week${
          remainingWeeks > 1 ? "s" : ""
        }`;
      }
    } else {
      const years = Math.floor(weeks / 48);
      const remainingMonths = Math.floor((weeks % 48) / 4);
      if (remainingMonths === 0) {
        return `${years} year${years > 1 ? "s" : ""}`;
      } else {
        return `${years} year${years > 1 ? "s" : ""} ${remainingMonths} month${
          remainingMonths > 1 ? "s" : ""
        }`;
      }
    }
  };

  // Load user's learning plans from backend
  useEffect(() => {
    const loadDashboard = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const learnings = await learningAPI.getLearnings(token);
        setUserLearnings(learnings);

        // Check if user has completed profile setup
        const userProfile = await authAPI.getProfile(token);
        const hasProfileData =
          userProfile.age && userProfile.level && userProfile.background;

        if (!hasProfileData) {
          setShowProfileSetup(true);
        } else if (learnings.length === 0) {
          setShowWelcome(true);
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [token]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

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
    setCompletedWeeks((prev) => {
      const newSet = new Set(prev);
      newSet.add(weekNumber);
      return newSet;
    });
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
    setLoading(true);
    setError(null);
    try {
      const response = await learningAPI.generatePlanStructure(token!, {
        goal: goal.goal,
        total_weeks: parseInt(goal.duration),
        daily_commitment: parseInt(goal.timePerDay),
      });
      setSuccessMessage("Learning plan created successfully!");
      setShowSuccess(true);
      setShowCreateNew(false);
      // Refresh the learnings list
      const refreshedLearnings = await learningAPI.getLearnings(token!);
      setUserLearnings(refreshedLearnings);
      // Select the newly created plan
      if (response.id) {
        const newLearning = refreshedLearnings.find(
          (learning) => learning.id === response.id
        );
        if (newLearning) {
          setSelectedLearning(newLearning);
          await loadDetailedPlan(newLearning.id);
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to create learning plan");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = async (profile: {
    age: number;
    level: string;
    background: string;
    preferred_language: string;
    interests: string;
    country: string;
  }) => {
    setProfileLoading(true);
    setError(null);
    try {
      await authAPI.updateProfile(token!, profile);
      setShowProfileSetup(false);
      setShowWelcome(true);
      // Refresh user data
      const userData = await authAPI.getProfile(token!);
      // Update the current user in context
      // This would need to be implemented in AuthContext
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Weekly Content View Component
  const WeeklyContentView = ({ week }: { week: WeeklyTheme }) => {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBackToPlan} className="mb-4">
            ← Back to Learning Plan
          </Button>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 rounded-lg">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Week {week.week_number}
            </h1>
            <h2 className="text-lg sm:text-xl opacity-90">{week.theme}</h2>
          </div>
        </div>

        {loadingWeekContent && (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600 text-sm sm:text-base">
              Generating your personalized weekly content...
            </span>
          </div>
        )}

        {weeklyContent && (
          <div className="space-y-4 sm:space-y-6">
            {/* Learning Objectives */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Learning Objectives
              </h3>
              <ul className="space-y-3">
                {week.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-700 text-sm sm:text-base">
                      {objective}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Concepts */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                Key Concepts
              </h3>
              <div className="flex flex-wrap gap-2">
                {week.key_concepts.map((concept, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            {week.prerequisites && week.prerequisites.length > 0 && (
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-orange-600" />
                  Prerequisites
                </h3>
                <ul className="space-y-2">
                  {week.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm sm:text-base">
                        {prereq}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Daily Milestones */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Daily Learning Milestones
              </h3>
              {loadingWeekContent ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500 text-sm sm:text-base">
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
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
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
                          <span className="text-sm text-gray-500 text-sm sm:text-base">
                            {milestone.duration_minutes} min
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {milestone.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm sm:text-base">
                    No daily milestones available for this week.
                  </p>
                </div>
              )}
            </div>

            {/* Adaptive Notes */}
            {weeklyContent.adaptive_notes && (
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                  Adaptive Learning Notes
                </h3>
                <blockquote className="border-l-4 border-yellow-400 pl-4 italic text-gray-700 bg-yellow-50 p-4 rounded-r-lg">
                  {weeklyContent.adaptive_notes}
                </blockquote>
              </div>
            )}

            {/* Progress Actions */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                Track Progress
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
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
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBackToWeek} className="mb-4">
            ← Back to Week {selectedWeek?.week_number}
          </Button>

          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 sm:p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Day {dayNumber}: {lessonTitle}
            </h1>
            <h2 className="text-lg sm:text-xl opacity-90">
              {selectedWeek?.theme}
            </h2>
          </div>
        </div>

        {loadingDailyContent && (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
            <span className="text-gray-600 text-sm sm:text-base">
              Loading your daily content...
            </span>
          </div>
        )}

        {dailyContent && (
          <div className="space-y-4 sm:space-y-6">
            {/* Lesson Summary */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Lesson Summary
              </h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                {lessonSummary}
              </p>
            </div>

            {/* Key Points */}
            {keyPoints && keyPoints.length > 0 && (
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Key Points
                </h3>
                <ul className="space-y-3">
                  {keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-700 text-sm sm:text-base">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Explanation */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                Detailed Explanation
              </h3>
              <div className="prose prose-sm sm:prose max-w-none">
                <div className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {lessonExplanation}
                </div>
              </div>
            </div>

            {/* Practice Exercises */}
            {exercises && exercises.length > 0 && (
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
                  Practice Exercises
                </h3>
                <div className="space-y-4">
                  {exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                          Exercise {index + 1}
                        </h4>
                        <span className="text-xs sm:text-sm text-gray-500 capitalize">
                          {exercise.type}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm sm:text-base mb-3">
                        {exercise.question}
                      </p>
                      {exercise.options && exercise.options.length > 0 && (
                        <div className="space-y-2">
                          {exercise.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className="flex items-center space-x-2 p-2 rounded border"
                            >
                              <input
                                type="radio"
                                name={`exercise-${index}`}
                                id={`exercise-${index}-${optIndex}`}
                                className="text-blue-600"
                              />
                              <label
                                htmlFor={`exercise-${index}-${optIndex}`}
                                className="text-sm sm:text-base text-gray-700 cursor-pointer"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm sm:text-base text-blue-800">
                          <strong>Answer:</strong> {exercise.answer}
                        </p>
                        {exercise.explanation && (
                          <p className="text-sm text-blue-700 mt-1">
                            {exercise.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Resources */}
            {resources && resources.length > 0 && (
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <ExternalLink className="h-5 w-5 mr-2 text-indigo-600" />
                  Additional Resources
                </h3>
                <div className="space-y-3">
                  {resources.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-sm sm:text-base">
                          {resource.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {resource.description}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-3 flex-shrink-0"
                        onClick={() => window.open(resource.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <ArrowRight className="h-5 w-5 mr-2 text-green-600" />
                Continue Learning
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleBackToWeek}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Week Overview
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleWeekComplete(selectedWeek!.week_number)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Day as Complete
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
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/profile")}
                className="text-gray-600 hover:text-gray-800"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <button onClick={handleLogout} className="logout-button">
                Log Out
              </button>
            </div>
          </div>
          <WeeklyContentView week={selectedWeek} />
        </div>
      );
    }

    // Otherwise, show the detailed plan overview
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="user-controls">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="text-gray-600 hover:text-gray-800"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <button onClick={handleLogout} className="logout-button">
              Log Out
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
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

              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div className="mb-4 sm:mb-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {selectedLearning.goal}
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600">
                      {formatDuration(selectedLearning.total_weeks)} •{" "}
                      {selectedLearning.total_weeks * 7} days
                      {detailedPlan &&
                        detailedPlan.daily_commitment_minutes && (
                          <span className="block text-sm text-gray-500 mt-1">
                            Daily commitment:{" "}
                            {formatCommitment(
                              detailedPlan.daily_commitment_minutes
                            )}
                          </span>
                        )}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
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
                    <span className="text-gray-600 text-sm sm:text-base">
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
              <div className="space-y-6 sm:space-y-8">
                {/* Progress Overview */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6 mr-3 text-purple-600"
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

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                        {detailedPlan.weekly_themes.length}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        Total Weeks
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                        {completedWeeks.size}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        Completed
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">
                        {currentWeek ? 1 : 0}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        In Progress
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2">
                        {Math.round(
                          (completedWeeks.size /
                            detailedPlan.weekly_themes.length) *
                            100
                        )}
                        %
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        Overall Progress
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>
                        {completedWeeks.size} of{" "}
                        {detailedPlan.weekly_themes.length} weeks
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 sm:h-3 rounded-full transition-all duration-300"
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

                {/* Weekly Themes Section */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-3 text-green-600" />
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
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
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

                {/* Start Learning CTA */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-6 sm:p-8 text-center text-white">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                    Ready to Start Your Learning Journey?
                  </h2>
                  <p className="text-lg sm:text-xl mb-6 opacity-90">
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
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="text-gray-600 hover:text-gray-800"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <button onClick={handleLogout} className="logout-button">
              Log Out
            </button>
          </div>
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
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="text-gray-600 hover:text-gray-800"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <button onClick={handleLogout} className="logout-button">
              Log Out
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Your Learning Plans
              </h1>
              <p className="text-base sm:text-lg text-gray-600">
                Choose a plan to continue or create a new one
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {showSuccess && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {userLearnings.map((learning) => (
                <Card
                  key={learning.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    console.log("Learning plan clicked:", learning);
                    if (!learning.id) {
                      console.error("Learning ID is undefined!");
                      setError("Invalid learning plan: missing ID");
                      return;
                    }
                    console.log(
                      "Setting selected learning and loading detailed plan for ID:",
                      learning.id
                    );
                    setSelectedLearning(learning);
                    loadDetailedPlan(learning.id);
                  }}
                >
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex justify-between items-start text-sm sm:text-base">
                      <span className="line-clamp-2">{learning.goal}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlan(learning.id!);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="text-sm text-gray-600 mb-4">
                      {formatDuration(learning.total_weeks)} •{" "}
                      {learning.total_weeks * 7} days
                    </div>
                    <div className="text-xs text-gray-500">
                      Created:{" "}
                      {new Date(learning.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={() => setShowCreateNew(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-200 transform hover:scale-105"
              >
                Create New Learning Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show profile setup for new users who haven't completed their profile
  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="user-controls">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="text-gray-600 hover:text-gray-800"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <button onClick={handleLogout} className="logout-button">
              Log Out
            </button>
          </div>
        </div>
        <UserProfileSetup
          onProfileComplete={handleProfileComplete}
          loading={profileLoading}
        />
      </div>
    );
  }

  // Show welcome screen for new users (only if no existing learnings)
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="user-controls">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="text-gray-600 hover:text-gray-800"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <button onClick={handleLogout} className="logout-button">
              Log Out
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="text-center max-w-2xl">
            <div className="mb-6 sm:mb-8">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <svg
                  className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600"
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
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Welcome to AI Mentor! 🎉
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
                Let's create your personalized learning journey. We'll help you
                master new skills with AI-powered guidance.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
                What you'll get:
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-left">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6 text-green-600"
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
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">
                    Personalized Curriculum
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Tailored lessons based on your goals and schedule
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600"
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
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">
                    AI-Powered Learning
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Smart explanations and adaptive content
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600"
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
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">
                    Track Progress
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Monitor your learning journey and achievements
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowWelcome(false)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-200 transform hover:scale-105"
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
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="text-gray-600 hover:text-gray-800"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <button onClick={handleLogout} className="logout-button">
              Log Out
            </button>
          </div>
        </div>
        <LearningGoalSetup onGoalSet={handleGoalSet} loading={loading} />
      </div>
    );
  }

  return <LoadingSpinner />;
};

export default Dashboard;
