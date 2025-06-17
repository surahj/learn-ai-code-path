
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { X, Send } from 'lucide-react';

interface AIMentorProps {
  onClose: () => void;
  currentLesson: {
    title: string;
    description: string;
  };
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIMentor: React.FC<AIMentorProps> = ({ onClose, currentLesson }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm your JavaScript mentor. I'm here to help you with "${currentLesson.title}". What would you like to know?`
    }
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);

    // Simple AI responses based on keywords
    setTimeout(() => {
      let response = "I understand you're asking about JavaScript. ";
      
      if (input.toLowerCase().includes('variable')) {
        response += "Variables in JavaScript are containers for storing data. Use 'let' for variables that can change, 'const' for constants, and avoid 'var' in modern code.";
      } else if (input.toLowerCase().includes('function')) {
        response += "Functions are reusable blocks of code. You can create them with 'function myFunction() {}' or as arrow functions 'const myFunction = () => {}'.";
      } else if (input.toLowerCase().includes('array')) {
        response += "Arrays store multiple values. Create them with 'let myArray = [1, 2, 3]' and access elements with 'myArray[0]'.";
      } else if (input.toLowerCase().includes('object')) {
        response += "Objects store key-value pairs. Create them with 'let obj = { key: 'value' }' and access properties with 'obj.key'.";
      } else {
        response += "Could you be more specific about what you'd like to learn? I can help with variables, functions, arrays, objects, and more!";
      }

      const assistantMessage = { role: 'assistant' as const, content: response };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);

    setInput('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl h-96 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>AI JavaScript Mentor</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white ml-auto'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about JavaScript..."
              className="flex-1 resize-none"
              rows={2}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
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
