import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ServiceCard from '@/components/ServiceCard';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

const genderFilters = ['all', 'men', 'women', 'unisex'] as const;
const lengthFilters = ['all', 'short', 'medium', 'long'] as const;

export default function Services() {
  const [gender, setGender] = useState<string>('all');
  const [length, setLength] = useState<string>('all');

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const filtered = services?.filter(s => {
    if (gender !== 'all' && s.category_gender !== gender) return false;
    if (length !== 'all' && s.category_length !== length) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <p className="text-[13px] uppercase tracking-[0.3em] text-muted-foreground mb-4">What We Offer</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground">
            Our <span className="serif-italic">Services</span>
          </h1>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-6 mb-10 border-b border-border pb-6">
          <div className="flex gap-1">
            {genderFilters.map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`px-4 py-1.5 text-[13px] uppercase tracking-[0.1em] transition-colors capitalize ${
                  gender === g
                    ? 'text-foreground bg-accent'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {lengthFilters.map(l => (
              <button
                key={l}
                onClick={() => setLength(l)}
                className={`px-4 py-1.5 text-[13px] uppercase tracking-[0.1em] transition-colors capitalize ${
                  length === l
                    ? 'text-foreground bg-accent'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-accent/30 animate-pulse" />
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div>
            {filtered.map(s => (
              <ServiceCard key={s.id} {...s} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-muted-foreground">
            <p className="font-display text-2xl text-foreground mb-2">No services found</p>
            <p>Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
