import React, { useState, useEffect } from 'react';
import AuthForm from './AuthForm';
import LearningGoalSetup from './LearningGoalSetup';
import LessonView from './LessonView';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';
import axios from 'axios';

interface LearningGoal {
  goal: string;
  timePerDay: string;
  duration: string;
}

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

const generateCurriculum = (goal: LearningGoal): Lesson[] => {
  const baseLessons = [
    {
      id: 1,
      title: "Variables and Data Types",
      description: "Learn about JavaScript variables and basic data types",
      explanation: "In JavaScript, variables are containers for storing data values. You can declare variables using 'let', 'const', or 'var'. JavaScript has several data types including strings, numbers, booleans, and more.",
      practiceTask: "Create variables of different types and log them to the console.",
      starterCode: "// Create a string variable\nlet name = 'JavaScript';\n\n// Create a number variable\nlet age = 25;\n\n// Create a boolean variable\nlet isActive = true;\n\n// Log all variables\nconsole.log('Name:', name);\nconsole.log('Age:', age);\nconsole.log('Active:', isActive);",
      quiz: {
        question: "Which keyword is used to declare a constant variable in JavaScript?",
        options: ["var", "let", "const", "static"],
        correctAnswer: 2
      },
      completed: false
    },
    {
      id: 2,
      title: "Functions",
      description: "Understanding how to create and use functions",
      explanation: "Functions are reusable blocks of code that perform specific tasks. They can take parameters and return values. Functions help organize code and avoid repetition.",
      practiceTask: "Create a function that takes two numbers and returns their sum.",
      starterCode: "// Create a function that adds two numbers\nfunction addNumbers(a, b) {\n  return a + b;\n}\n\n// Call the function\nlet result = addNumbers(5, 3);\nconsole.log('Result:', result);",
      quiz: {
        question: "How do you call a function named 'myFunction'?",
        options: ["call myFunction()", "myFunction()", "execute myFunction", "run myFunction()"],
        correctAnswer: 1
      },
      completed: false
    },
    {
      id: 3,
      title: "Arrays and Loops",
      description: "Working with arrays and iteration",
      explanation: "Arrays store multiple values in a single variable. Loops allow you to repeat code multiple times. The for loop is commonly used to iterate through arrays.",
      practiceTask: "Create an array of numbers and use a loop to calculate their sum.",
      starterCode: "// Create an array of numbers\nlet numbers = [1, 2, 3, 4, 5];\nlet sum = 0;\n\n// Use a for loop to calculate sum\nfor (let i = 0; i < numbers.length; i++) {\n  sum += numbers[i];\n}\n\nconsole.log('Sum:', sum);",
      quiz: {
        question: "How do you access the first element of an array called 'myArray'?",
        options: ["myArray[1]", "myArray[0]", "myArray.first()", "myArray.get(0)"],
        correctAnswer: 1
      },
      completed: false
    },
    {
      id: 4,
      title: "Objects",
      description: "Understanding JavaScript objects and properties",
      explanation: "Objects are collections of key-value pairs. They allow you to group related data and functions together. You can access object properties using dot notation or bracket notation.",
      practiceTask: "Create an object representing a person with properties and methods.",
      starterCode: "// Create a person object\nlet person = {\n  name: 'John Doe',\n  age: 30,\n  city: 'New York',\n  greet: function() {\n    return 'Hello, I am ' + this.name;\n  }\n};\n\nconsole.log('Name:', person.name);\nconsole.log('Greeting:', person.greet());",
      quiz: {
        question: "How do you access the 'name' property of an object called 'person'?",
        options: ["person->name", "person.name", "person[name]", "person::name"],
        correctAnswer: 1
      },
      completed: false
    },
    {
      id: 5,
      title: "DOM Manipulation",
      description: "Interacting with HTML elements using JavaScript",
      explanation: "The Document Object Model (DOM) allows JavaScript to interact with HTML elements. You can select elements, change their content, and respond to user events.",
      practiceTask: "Select an element and change its content dynamically.",
      starterCode: "// Note: This would work in a browser with HTML elements\n// Select an element by ID\n// let element = document.getElementById('myElement');\n\n// Change the content\n// element.textContent = 'New content!';\n\n// For demonstration purposes:\nconsole.log('DOM manipulation code ready!');",
      quiz: {
        question: "Which method is used to select an element by its ID?",
        options: ["document.querySelector()", "document.getElementById()", "document.getElement()", "document.selectById()"],
        correctAnswer: 1
      },
      completed: false
    }
  ];

  const weeks = parseInt(goal.duration);
  const lessonsNeeded = weeks * 5; // 5 lessons per week
  
  // Repeat and extend lessons based on duration
  const curriculum = [];
  for (let i = 0; i < lessonsNeeded; i++) {
    const baseLesson = baseLessons[i % baseLessons.length];
    curriculum.push({
      ...baseLesson,
      id: i + 1,
      title: `Day ${i + 1}: ${baseLesson.title}${i >= baseLessons.length ? ' (Review)' : ''}`
    });
  }
  
  return curriculum;
};

const Dashboard: React.FC = () => {
  // Get auth context
  const { currentUser, token, logout } = useAuth();
  
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [learningGoal, setLearningGoal] = useState<LearningGoal | null>(null);
  const [curriculum, setCurriculum] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  useEffect(() => {
    // Load saved data from localStorage
    const savedUser = localStorage.getItem('jsmentor_user');
    const savedGoal = localStorage.getItem('jsmentor_goal');
    const savedCurriculum = localStorage.getItem('jsmentor_curriculum');
    const savedProgress = localStorage.getItem('jsmentor_progress');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedGoal) setLearningGoal(JSON.parse(savedGoal));
    if (savedCurriculum) setCurriculum(JSON.parse(savedCurriculum));
    if (savedProgress) setCurrentLessonIndex(parseInt(savedProgress));
  }, []);

  const handleUserAuth = (userData: { name: string; email: string }) => {
    setUser(userData);
    localStorage.setItem('jsmentor_user', JSON.stringify(userData));
  };

  const handleGoalSet = async (goal: LearningGoal) => {
    setLearningGoal(goal);
    const newCurriculum = generateCurriculum(goal);
    setCurriculum(newCurriculum);
    
    // Add API call here to save goal to backend
    try {
      if (token) { // Get token from useAuth()
        await axios.post('https://ai-mentor-backend-w5gs.onrender.com/goals', 
          { 
            learning_goal: goal.goal,
            daily_commitment: parseInt(goal.timePerDay),
            duration: parseInt(goal.duration)
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        console.log('Goal saved to backend');
      }
    } catch (error) {
      console.error('Failed to save goal to backend:', error);
      // Continue with local storage anyway as fallback
    }
    
    // Keep your existing localStorage code
    localStorage.setItem('jsmentor_goal', JSON.stringify(goal));
    localStorage.setItem('jsmentor_curriculum', JSON.stringify(newCurriculum));
  };

  const handleLessonComplete = async () => {
    const updatedCurriculum = [...curriculum];
    updatedCurriculum[currentLessonIndex].completed = true;
    setCurriculum(updatedCurriculum);
    
    // Add API call here to track lesson completion
    try {
      if (token) { // Get token from useAuth()
        await axios.post('https://ai-mentor-backend-w5gs.onrender.com/progress', 
          { 
            lesson_id: curriculum[currentLessonIndex].id,
            completed: true,
            timestamp: new Date().toISOString()
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        console.log('Progress saved to backend');
      }
    } catch (error) {
      console.error('Failed to save progress to backend:', error);
      // Continue with local storage anyway as fallback
    }
    
    // Keep your existing localStorage code
    localStorage.setItem('jsmentor_curriculum', JSON.stringify(updatedCurriculum));
    
    if (currentLessonIndex < curriculum.length - 1) {
      const nextIndex = currentLessonIndex + 1;
      setCurrentLessonIndex(nextIndex);
      localStorage.setItem('jsmentor_progress', nextIndex.toString());
    }
  };

  const handleLogout = () => {
    logout();
    // Clear other localStorage items if needed
    localStorage.removeItem('jsmentor_user');
    localStorage.removeItem('jsmentor_goal');
    localStorage.removeItem('jsmentor_curriculum');
    localStorage.removeItem('jsmentor_progress');
    setUser(null);
  };
  
  const completedLessons = curriculum.filter(lesson => lesson.completed).length;

  // Show auth form if no user
  if (!user) {
    return <AuthForm onAuthSuccess={handleUserAuth} />;
  }

  // Show goal setup if no learning goal
  if (!learningGoal) {
    return <LearningGoalSetup onGoalSet={handleGoalSet} />;
  }

  // Show lesson view
  const currentLesson = curriculum[currentLessonIndex];
  if (!currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Congratulations! 🎉</h1>
          <p className="text-lg text-gray-600">You've completed your JavaScript curriculum!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="user-controls">
        <span>Welcome, {currentUser?.name || `User ${currentUser?.id}`}</span>
        <button onClick={handleLogout} className="logout-button">Log Out</button>
      </div>
      <LessonView
        lesson={currentLesson}
        totalLessons={curriculum.length}
        completedLessons={completedLessons}
        onLessonComplete={handleLessonComplete}
      />
    </>
  );
};

export default Dashboard;
