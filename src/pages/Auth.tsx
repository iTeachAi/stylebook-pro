import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Scissors } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, fullName);
        toast.success('Account created! Check your email to verify.');
      } else {
        await signIn(email, password);
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-32 pb-16 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-8"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <Scissors className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-display font-bold text-card-foreground">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignUp ? 'Sign up to book appointments' : 'Sign in to your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" required />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            <Button type="submit" variant="gold" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline font-medium">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
