
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIMentorProps {
  onClose: () => void;
  currentLesson: {
    title: string;
    description: string;
  };
}

const AIMentor: React.FC<AIMentorProps> = ({ onClose, currentLesson }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Hi! I'm your AI JavaScript mentor. I can help you with "${currentLesson.title}" or any JavaScript concepts you're struggling with. What would you like to know?`,
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: generateAIResponse(inputMessage),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('variable') || lowerInput.includes('var') || lowerInput.includes('let') || lowerInput.includes('const')) {
      return "Great question about variables! In JavaScript, you have three ways to declare variables: 'var', 'let', and 'const'. I recommend using 'let' for values that can change and 'const' for values that won't change. 'var' is older and has some quirks, so it's best to avoid it in modern JavaScript.";
    }
    
    if (lowerInput.includes('function')) {
      return "Functions are one of the most important concepts in JavaScript! They're reusable blocks of code that can take inputs (parameters) and return outputs. You can create functions using the 'function' keyword or arrow functions (=>). Would you like me to explain a specific aspect of functions?";
    }
    
    if (lowerInput.includes('loop') || lowerInput.includes('for') || lowerInput.includes('while')) {
      return "Loops are essential for repeating code! JavaScript has several types: 'for' loops for counting, 'while' loops for conditions, and 'for...of' loops for arrays. Each has its own use case. What specific loop are you working with?";
    }
    
    if (lowerInput.includes('array')) {
      return "Arrays are fantastic for storing lists of data! You can create them with square brackets []. Common methods include push(), pop(), map(), filter(), and forEach(). Arrays are zero-indexed, meaning the first element is at position 0. What would you like to know about arrays?";
    }
    
    if (lowerInput.includes('object')) {
      return "Objects are key-value pairs that help organize related data! You create them with curly braces {}. You can access properties with dot notation (obj.property) or bracket notation (obj['property']). Objects are everywhere in JavaScript!";
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('stuck') || lowerInput.includes('don\'t understand')) {
      return "I'm here to help! Don't worry, everyone gets stuck sometimes - that's part of learning. Can you tell me specifically what part you're struggling with? I can break it down into smaller, easier-to-understand pieces.";
    }
    
    return "That's a great question! JavaScript can be tricky, but you're on the right track. Can you be more specific about what you'd like to know? I'm here to help you understand any concept, debug code, or explain how something works.";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600" />
            AI JavaScript Mentor
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about JavaScript..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIMentor;
