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
      <div className="container pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">Our Services</h1>
          <p className="text-muted-foreground">Find the perfect treatment for your style</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex gap-2">
            {genderFilters.map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  gender === g
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-surface-hover'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {lengthFilters.map(l => (
              <button
                key={l}
                onClick={() => setLength(l)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  length === l
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-surface-hover'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(s => (
              <ServiceCard key={s.id} {...s} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No services found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
