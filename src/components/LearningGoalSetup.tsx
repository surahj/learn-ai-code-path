import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import learningAPI from "../api/learning";
import { Plus, Minus } from "lucide-react";

interface LearningGoal {
  goal: string;
  timePerDay: string;
  duration: string;
}

interface LearningGoalSetupProps {
  onGoalSet: (goal: LearningGoal) => void;
  loading?: boolean;
  onBack?: () => void;
}

const LearningGoalSetup: React.FC<LearningGoalSetupProps> = ({
  onGoalSet,
  loading = false,
  onBack,
}) => {
  const [goal, setGoal] = useState("");
  const [timePerDay, setTimePerDay] = useState("60");
  const [duration, setDuration] = useState("4");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { token } = useAuth();

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

  const handleCommitmentChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 15 && numValue <= 1200) {
      setTimePerDay(value);
    }
  };

  const handleDurationChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 1 && numValue <= 52) {
      setDuration(value);
    }
  };

  const incrementCommitment = () => {
    const current = parseInt(timePerDay) || 60;
    const newValue = Math.min(current + 15, 1200);
    setTimePerDay(newValue.toString());
  };

  const decrementCommitment = () => {
    const current = parseInt(timePerDay) || 60;
    const newValue = Math.max(current - 15, 15);
    setTimePerDay(newValue.toString());
  };

  const incrementDuration = () => {
    const current = parseInt(duration) || 4;
    const newValue = Math.min(current + 1, 52);
    setDuration(newValue.toString());
  };

  const decrementDuration = () => {
    const current = parseInt(duration) || 4;
    const newValue = Math.max(current - 1, 1);
    setDuration(newValue.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !timePerDay || !duration) return;

    setIsValidating(true);
    setValidationError(null);

    try {
      const validation = await learningAPI.validateGoal(token!, { goal });
      if (!validation.appropriate) {
        setValidationError(validation.reason);
        setIsValidating(false);
        return;
      }
    } catch (error) {
      setValidationError("Could not validate the goal. Please try again.");
      setIsValidating(false);
      return;
    }

    setIsValidating(false);
    onGoalSet({ goal, timePerDay, duration });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            {onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back to Plans
              </Button>
            )}
            <div className="flex-1"></div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Set Your Learning Goal
          </CardTitle>
          <CardDescription>
            Let's create a personalized curriculum just for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="goal">What do you want to learn?</Label>
              <Input
                id="goal"
                placeholder="e.g., Advanced Go, React Hooks, etc."
                value={goal}
                onChange={(e) => {
                  setGoal(e.target.value);
                  if (validationError) setValidationError(null);
                }}
              />
              {validationError && (
                <p className="text-sm text-red-600 mt-1">{validationError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">How much time can you commit daily?</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={decrementCommitment}
                  className="flex-shrink-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    id="time"
                    type="number"
                    min="15"
                    max="1200"
                    step="15"
                    value={timePerDay}
                    onChange={(e) => handleCommitmentChange(e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-gray-500 mt-1 text-center">
                    {formatCommitment(parseInt(timePerDay) || 60)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={incrementCommitment}
                  className="flex-shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Range: 15 minutes to 20 hours (in 15-minute increments)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">How long do you want to study?</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={decrementDuration}
                  className="flex-shrink-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="52"
                    step="1"
                    value={duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-gray-500 mt-1 text-center">
                    {formatDuration(parseInt(duration) || 4)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={incrementDuration}
                  className="flex-shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Range: 1 week to 1 year (in weekly increments)
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={
                !goal || !timePerDay || !duration || loading || isValidating
              }
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Validating Goal...
                </>
              ) : loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Your Curriculum...
                </>
              ) : (
                "Generate My Curriculum"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningGoalSetup;
