
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface LearningGoal {
  goal: string;
  timePerDay: string;
  duration: string;
}

interface LearningGoalSetupProps {
  onGoalSet: (goal: LearningGoal) => void;
}

const LearningGoalSetup: React.FC<LearningGoalSetupProps> = ({ onGoalSet }) => {
  const [goal, setGoal] = useState('');
  const [timePerDay, setTimePerDay] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal && timePerDay && duration) {
      onGoalSet({ goal, timePerDay, duration });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Set Your Learning Goal</CardTitle>
          <CardDescription>
            Let's create a personalized curriculum just for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="goal">What do you want to learn?</Label>
              <Select onValueChange={setGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your learning goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript-basics">JavaScript Basics</SelectItem>
                  <SelectItem value="javascript-intermediate">Intermediate JavaScript</SelectItem>
                  <SelectItem value="javascript-advanced">Advanced JavaScript</SelectItem>
                  <SelectItem value="javascript-frameworks">JavaScript Frameworks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">How much time can you commit daily?</Label>
              <Select onValueChange={setTimePerDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Select daily time commitment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">How long do you want to study?</Label>
              <Select onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 week</SelectItem>
                  <SelectItem value="2">2 weeks</SelectItem>
                  <SelectItem value="4">4 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={!goal || !timePerDay || !duration}
            >
              Generate My Curriculum
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningGoalSetup;
