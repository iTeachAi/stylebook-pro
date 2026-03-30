import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group border-b border-border py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-accent/30 transition-colors px-4 -mx-4"
    >
      <div className="flex-1">
        <div className="flex items-baseline gap-3">
          <h3 className="font-display text-2xl text-foreground">{name}</h3>
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{category_gender}</span>
          {category_length && (
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">· {category_length}</span>
          )}
        </div>
        {description && <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>}
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-sm">{duration_minutes}′</span>
        </div>
        <span className="font-display text-2xl text-foreground">${price}</span>
        <Button variant="outline" size="sm" onClick={() => navigate(`/book?service=${id}`)}>
          Book
        </Button>
      </div>
    </motion.div>
  );
}
