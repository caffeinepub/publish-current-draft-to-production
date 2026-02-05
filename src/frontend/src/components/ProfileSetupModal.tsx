import { useState, useEffect } from 'react';
import { useCreateUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Sparkles, Star } from 'lucide-react';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { mutate: createProfile, isPending, isSuccess } = useCreateUserProfile();

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      // Show success animation for 2 seconds before closing
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    createProfile(name.trim(), {
      onSuccess: (message) => {
        toast.success('🎉 Welcome to Study Buddies!', {
          description: 'Your account has been created successfully!',
        });
      },
      onError: (error) => {
        toast.error('Failed to create profile', {
          description: error.message,
        });
      },
    });
  };

  if (showSuccess) {
    return (
      <Dialog open={true}>
        <DialogContent 
          className="sm:max-w-md border-2 border-purple-300 dark:border-purple-700 shadow-glow-purple" 
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="text-center space-y-6 py-8 animate-in zoom-in duration-500">
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src="/assets/generated/celebration-bunny-transparent.dim_150x150.png" 
                  alt="Celebration Bunny" 
                  className="w-32 h-32 animate-bounce"
                />
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-500 animate-pulse" />
                <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-pink-500 animate-pulse delay-100" />
                <Star className="absolute top-0 left-0 w-6 h-6 text-purple-500 animate-ping" />
                <Star className="absolute bottom-0 right-0 w-5 h-5 text-violet-500 animate-ping delay-200" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 bg-clip-text text-transparent animate-pulse">
                Welcome, {name}! 🎉
              </h2>
              <p className="text-muted-foreground">
                Your account has been created successfully!
              </p>
              <p className="text-sm text-muted-foreground">
                Loading your dashboard...
              </p>
            </div>

            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce delay-100" />
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce delay-200" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true}>
      <DialogContent 
        className="sm:max-w-md border-2 border-purple-300 dark:border-purple-700 shadow-glow-purple animate-in zoom-in duration-300" 
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to Study Buddies! 🐰
          </DialogTitle>
          <DialogDescription className="text-center">
            Let's get you started on your DSA journey!
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center my-4 relative">
          <img 
            src="/assets/generated/profile-setup-sparkles-transparent.dim_150x150.png" 
            alt="Sparkles" 
            className="absolute w-32 h-32 animate-pulse opacity-50"
          />
          <img 
            src="/assets/generated/floating-study-bunny-transparent.dim_200x200.png" 
            alt="Study Bunny" 
            className="w-32 h-32 animate-bounce-slow relative z-10"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold">
              What should we call you?
            </Label>
            <div className="relative">
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isPending}
                className={`text-base transition-all duration-300 ${
                  isFocused 
                    ? 'ring-2 ring-purple-500 border-purple-500 shadow-glow-purple' 
                    : ''
                }`}
                autoFocus
              />
              {isFocused && (
                <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500 animate-pulse" />
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 hover:from-purple-700 hover:via-pink-700 hover:to-violet-700 text-white font-medium shadow-lg hover:shadow-glow-pink transition-all duration-300 hover:scale-105"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating your account...
              </>
            ) : (
              <>
                Let's Start! 🚀
                <Sparkles className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground pt-2">
          <p>Join the community of DSA enthusiasts! 📚✨</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
