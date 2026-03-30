import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Scissors, Menu, X } from 'lucide-react';
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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Scissors className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-semibold text-foreground">Luxe Studio</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Services</Link>
          <Link to="/book" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Book Now</Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          )}
          {user ? (
            <Button variant="gold-outline" size="sm" onClick={handleSignOut}>Sign Out</Button>
          ) : (
            <Button variant="gold" size="sm" onClick={() => navigate('/auth')}>Sign In</Button>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
            <div className="container py-4 flex flex-col gap-3">
              <Link to="/services" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">Services</Link>
              <Link to="/book" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">Book Now</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">Dashboard</Link>}
              {user ? (
                <Button variant="gold-outline" size="sm" onClick={() => { handleSignOut(); setMobileOpen(false); }}>Sign Out</Button>
              ) : (
                <Button variant="gold" size="sm" onClick={() => { navigate('/auth'); setMobileOpen(false); }}>Sign In</Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
