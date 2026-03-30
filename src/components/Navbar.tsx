import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-xl text-foreground tracking-tight">
          Luxe <span className="serif-italic">Studio</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/services" className="text-[13px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Services</Link>
          <Link to="/book" className="text-[13px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Book</Link>
          {isAdmin && (
            <Link to="/admin" className="text-[13px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          )}
          {user ? (
            <Button variant="minimal" size="sm" onClick={handleSignOut}>Sign Out</Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>Sign In</Button>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="container py-6 flex flex-col gap-4">
              <Link to="/services" onClick={() => setMobileOpen(false)} className="text-[13px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground py-1">Services</Link>
              <Link to="/book" onClick={() => setMobileOpen(false)} className="text-[13px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground py-1">Book</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-[13px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground py-1">Dashboard</Link>}
              {user ? (
                <Button variant="outline" size="sm" onClick={() => { handleSignOut(); setMobileOpen(false); }}>Sign Out</Button>
              ) : (
                <Button variant="default" size="sm" onClick={() => { navigate('/auth'); setMobileOpen(false); }}>Sign In</Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
