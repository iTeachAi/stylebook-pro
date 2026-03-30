import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Scissors, Star, Calendar, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';

const features = [
  { icon: Calendar, title: 'Easy Booking', desc: 'Book your appointment in seconds with our seamless online system.' },
  { icon: Scissors, title: 'Expert Stylists', desc: 'Our team of professionals brings years of experience to every cut.' },
  { icon: Clock, title: 'Flexible Hours', desc: 'Find the perfect time slot that fits your busy schedule.' },
  { icon: Star, title: 'Premium Service', desc: 'Experience luxury grooming in a relaxed, welcoming atmosphere.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-surface" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl mx-auto text-center"
          >
            <span className="inline-block text-sm uppercase tracking-[0.2em] text-primary font-medium mb-4">Premium Hair Studio</span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-tight mb-6">
              Your Style,{' '}
              <span className="text-gradient-gold">Perfected</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Book your next appointment with our expert stylists. Premium cuts, color, and styling — tailored just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="lg" onClick={() => navigate('/book')} className="text-base px-8">
                Book Appointment
              </Button>
              <Button variant="gold-outline" size="lg" onClick={() => navigate('/services')} className="text-base px-8">
                View Services
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Why Choose Us</h2>
            <p className="text-muted-foreground">Everything you need for the perfect look</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-6 text-center hover:border-primary/30 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-card-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-gradient-gold p-12 md:p-16 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
              Ready for a Fresh Look?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
              Book your appointment today and let our experts transform your style.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/book')}
              className="bg-background text-foreground hover:bg-background/90 text-base px-8"
            >
              Book Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Scissors className="h-5 w-5 text-primary" />
            <span className="font-display text-lg text-foreground">Luxe Studio</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Luxe Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
