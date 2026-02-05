import { Card, CardContent } from './ui/card';
import { Quote } from 'lucide-react';
import { useEffect, useState } from 'react';

const quotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Code is like humor. When you have to explain it, it's bad. - Cory House",
  "First, solve the problem. Then, write the code. - John Johnson",
  "Experience is the name everyone gives to their mistakes. - Oscar Wilde",
  "In order to be irreplaceable, one must always be different. - Coco Chanel",
  "The best error message is the one that never shows up. - Thomas Fuchs",
  "Simplicity is the soul of efficiency. - Austin Freeman",
  "Make it work, make it right, make it fast. - Kent Beck",
  "Clean code always looks like it was written by someone who cares. - Robert C. Martin",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. - Martin Fowler",
  "The most disastrous thing that you can ever learn is your first programming language. - Alan Kay",
  "Programming isn't about what you know; it's about what you can figure out. - Chris Pine",
  "The best way to predict the future is to implement it. - David Heinemeier Hansson",
  "Perfection is achieved not when there is nothing more to add, but rather when there is nothing more to take away. - Antoine de Saint-Exupery",
  "Don't worry if it doesn't work right. If everything did, you'd be out of a job. - Mosher's Law",
];

export default function MotivationalQuote() {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <Card className="gradient-card border-purple-200 dark:border-purple-800 shadow-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Quote className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground italic leading-relaxed">
              "{quote}"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

