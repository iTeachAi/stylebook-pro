import { motion } from 'framer-motion';
import { Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ServiceCardProps {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  category_gender: string;
  category_length: string | null;
}

export default function ServiceCard({ id, name, description, price, duration_minutes, category_gender, category_length }: ServiceCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-gold transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-card-foreground">{name}</h3>
          <div className="flex gap-2 mt-1">
            <span className="text-xs uppercase tracking-wider text-primary font-medium">{category_gender}</span>
            {category_length && (
              <span className="text-xs uppercase tracking-wider text-muted-foreground">• {category_length}</span>
            )}
          </div>
        </div>
        <span className="text-2xl font-display font-bold text-primary">${price}</span>
      </div>
      {description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm">{duration_minutes} min</span>
        </div>
        <Button variant="gold" size="sm" onClick={() => navigate(`/book?service=${id}`)}>
          Book Now
        </Button>
      </div>
    </motion.div>
  );
}
