import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import learningAPI from "../api/learning";

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
  const [timePerDay, setTimePerDay] = useState("");
  const [duration, setDuration] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { token } = useAuth();

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
              <Select onValueChange={setTimePerDay} value={timePerDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Select daily time commitment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                  <SelectItem value="150">150 minutes</SelectItem>
                  <SelectItem value="180">180 minutes</SelectItem>
                  <SelectItem value="210">210 minutes</SelectItem>
                  <SelectItem value="240">240 minutes</SelectItem>
                  <SelectItem value="270">270 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">How long do you want to study?</Label>
              <Select onValueChange={setDuration} value={duration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 week</SelectItem>
                  <SelectItem value="2">2 weeks</SelectItem>
                  <SelectItem value="3">3 weeks</SelectItem>
                  <SelectItem value="4">4 weeks</SelectItem>
                  <SelectItem value="6">6 weeks</SelectItem>
                  <SelectItem value="8">8 weeks</SelectItem>
                  <SelectItem value="12">12 weeks</SelectItem>
                  <SelectItem value="16">16 weeks</SelectItem>
                  <SelectItem value="20">20 weeks</SelectItem>
                  <SelectItem value="24">24 weeks</SelectItem>
                  <SelectItem value="28">28 weeks</SelectItem>
                  <SelectItem value="32">32 weeks</SelectItem>
                  <SelectItem value="36">36 weeks</SelectItem>
                </SelectContent>
              </Select>
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
