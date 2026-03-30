import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import heroImage from '@/assets/hero-salon.jpg';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.15 } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Luxury hair salon"
            width={1920}
            height={1080}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        </div>

        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="container relative text-center pt-16"
        >
          <motion.p
            variants={fadeUp}
            className="text-[13px] uppercase tracking-[0.3em] text-muted-foreground mb-6"
          >
            Premium Hair Studio
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-display text-[clamp(3rem,8vw,8rem)] leading-[0.95] text-foreground mb-8"
          >
            Your Style,
            <br />
            <span className="serif-italic">Perfected</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-lg max-w-md mx-auto mb-10 font-light"
          >
            Expert cuts, color, and styling — tailored to you.
            Book your next appointment seamlessly.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/book')}>
              Book Appointment
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/services')}>
              View Services
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-muted-foreground/40" />
        </motion.div>
      </section>

      {/* Services Preview */}
      <section className="py-32 border-t border-border">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
          >
            <div>
              <p className="text-[13px] uppercase tracking-[0.3em] text-muted-foreground mb-4">What We Offer</p>
              <h2 className="font-display text-5xl md:text-6xl text-foreground">
                Our <span className="serif-italic">Services</span>
              </h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/services')}>
              View All <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
            {[
              { title: 'Cuts & Styling', desc: 'Precision cuts for men and women, from classic to contemporary.', label: 'From $35' },
              { title: 'Color & Highlights', desc: 'Full color, balayage, highlights, and creative color work.', label: 'From $80' },
              { title: 'Treatments', desc: 'Deep conditioning, keratin, scalp treatments, and more.', label: 'From $50' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="bg-background p-8 md:p-10 group cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate('/services')}
              >
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-display text-3xl text-foreground mt-4 mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{item.desc}</p>
                <span className="text-[13px] text-foreground font-medium">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 border-t border-border">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="font-display text-5xl md:text-7xl text-foreground mb-6">
              Ready for a
              <br />
              <span className="serif-italic">fresh look?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-sm mx-auto mb-10 font-light">
              Book your appointment today and let our experts transform your style.
            </p>
            <Button size="lg" onClick={() => navigate('/book')}>
              Book Now <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display text-lg text-foreground">
            Luxe <span className="serif-italic">Studio</span>
          </span>
          <p className="text-[13px] text-muted-foreground">© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
