import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { toast } from 'sonner';

type Step = 'service' | 'addons' | 'datetime' | 'details' | 'confirm';
const steps: Step[] = ['service', 'addons', 'datetime', 'details', 'confirm'];
const stepLabels = ['Service', 'Add-ons', 'Date & Time', 'Your Details', 'Confirm'];

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<string>(searchParams.get('service') || '');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If service pre-selected, skip to addons
  useEffect(() => {
    if (searchParams.get('service')) setCurrentStep('addons');
  }, []);

  const { data: services } = useQuery({
    queryKey: ['services-booking'],
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('*').eq('is_active', true).order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: addons } = useQuery({
    queryKey: ['addons'],
    queryFn: async () => {
      const { data, error } = await supabase.from('add_ons').select('*').eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const { data: schedule } = useQuery({
    queryKey: ['schedule'],
    queryFn: async () => {
      const { data, error } = await supabase.from('schedule_settings').select('*').eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const { data: blockedDates } = useQuery({
    queryKey: ['blocked-dates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blocked_dates').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: existingBookings } = useQuery({
    queryKey: ['bookings-date', selectedDate],
    enabled: !!selectedDate,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('booking_date', selectedDate)
        .neq('status', 'cancelled');
      if (error) throw error;
      return data;
    },
  });

  const service = services?.find(s => s.id === selectedService);
  const blockedSet = new Set(blockedDates?.map(b => b.blocked_date) || []);

  // Generate available dates (next 30 days)
  const availableDates = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i + 1))
    .filter(date => {
      const dayOfWeek = date.getDay();
      const dateStr = format(date, 'yyyy-MM-dd');
      if (blockedSet.has(dateStr)) return false;
      return schedule?.some(s => s.day_of_week === dayOfWeek);
    });

  // Generate time slots for selected date
  const getTimeSlots = () => {
    if (!selectedDate || !schedule || !service) return [];
    const date = new Date(selectedDate);
    const daySchedule = schedule.find(s => s.day_of_week === date.getDay());
    if (!daySchedule) return [];

    const slots: string[] = [];
    const [startH, startM] = daySchedule.start_time.split(':').map(Number);
    const [endH, endM] = daySchedule.end_time.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const slotDuration = daySchedule.slot_duration_minutes;

    for (let m = startMinutes; m + service.duration_minutes <= endMinutes; m += slotDuration) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

      // Check overlap with existing bookings
      const slotEnd = m + service.duration_minutes;
      const slotEndStr = `${String(Math.floor(slotEnd / 60)).padStart(2, '0')}:${String(slotEnd % 60).padStart(2, '0')}`;
      const isBooked = existingBookings?.some(b => {
        const bStart = b.start_time;
        const bEnd = b.end_time;
        return timeStr < bEnd && slotEndStr > bStart;
      });

      if (!isBooked) slots.push(timeStr);
    }
    return slots;
  };

  const timeSlots = getTimeSlots();

  const totalPrice = (service?.price || 0) +
    (addons?.filter(a => selectedAddons.includes(a.id)).reduce((sum, a) => sum + a.price, 0) || 0);

  const handleSubmit = async () => {
    if (!user || !service) {
      toast.error('Please sign in to book an appointment.');
      navigate('/auth');
      return;
    }
    setSubmitting(true);
    try {
      const endMinutes = selectedTime.split(':').map(Number).reduce((h, m) => h * 60 + m) + service.duration_minutes;
      const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

      const { data: booking, error } = await supabase.from('bookings').insert({
        user_id: user.id,
        service_id: selectedService,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone || null,
        booking_date: selectedDate,
        start_time: selectedTime,
        end_time: endTime,
        total_price: totalPrice,
        status: 'confirmed',
      }).select().single();

      if (error) throw error;

      // Insert add-ons
      if (selectedAddons.length > 0) {
        const addonInserts = selectedAddons.map(addonId => {
          const addon = addons?.find(a => a.id === addonId);
          return { booking_id: booking.id, addon_id: addonId, price: addon?.price || 0 };
        });
        await supabase.from('booking_addons').insert(addonInserts);
      }

      setCurrentStep('confirm');
      toast.success('Appointment booked successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'service': return !!selectedService;
      case 'addons': return true;
      case 'datetime': return !!selectedDate && !!selectedTime;
      case 'details': return clientName.trim() && clientEmail.trim();
      default: return false;
    }
  };

  const goNext = () => {
    const idx = steps.indexOf(currentStep);
    if (currentStep === 'details') {
      handleSubmit();
    } else if (idx < steps.length - 1) {
      setCurrentStep(steps[idx + 1]);
    }
  };

  const goBack = () => {
    const idx = steps.indexOf(currentStep);
    if (idx > 0) setCurrentStep(steps[idx - 1]);
  };

  const stepIndex = steps.indexOf(currentStep);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-16 max-w-2xl">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                i < stepIndex ? 'bg-primary text-primary-foreground' :
                i === stepIndex ? 'bg-primary text-primary-foreground' :
                'bg-secondary text-secondary-foreground'
              }`}>
                {i < stepIndex ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${i === stepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
              {i < stepLabels.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Service Selection */}
            {currentStep === 'service' && (
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">Choose a Service</h2>
                <div className="grid gap-3">
                  {services?.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedService(s.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedService === s.id
                          ? 'border-primary bg-primary/5 shadow-gold'
                          : 'border-border bg-card hover:border-primary/30'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-card-foreground">{s.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.duration_minutes} min</span>
                            <span className="uppercase text-primary">{s.category_gender}</span>
                          </div>
                        </div>
                        <span className="text-xl font-display font-bold text-primary">${s.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {currentStep === 'addons' && (
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">Add Extras</h2>
                <p className="text-muted-foreground mb-6">Optional enhancements for your appointment</p>
                {addons && addons.length > 0 ? (
                  <div className="grid gap-3">
                    {addons.map(a => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedAddons(prev =>
                          prev.includes(a.id) ? prev.filter(id => id !== a.id) : [...prev, a.id]
                        )}
                        className={`p-4 rounded-xl border text-left transition-all flex justify-between items-center ${
                          selectedAddons.includes(a.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card hover:border-primary/30'
                        }`}
                      >
                        <span className="font-medium text-card-foreground">{a.name}</span>
                        <span className="text-primary font-semibold">+${a.price}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No add-ons available</p>
                )}
              </div>
            )}

            {/* Date & Time */}
            {currentStep === 'datetime' && (
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">Pick a Date & Time</h2>

                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-3 block">Select Date</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                    {availableDates.map(date => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      return (
                        <button
                          key={dateStr}
                          onClick={() => { setSelectedDate(dateStr); setSelectedTime(''); }}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            selectedDate === dateStr
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border bg-card text-card-foreground hover:border-primary/30'
                          }`}
                        >
                          <div className="text-xs text-muted-foreground">{format(date, 'EEE')}</div>
                          <div className="font-semibold">{format(date, 'MMM d')}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Select Time</label>
                    {timeSlots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {timeSlots.map(time => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-3 rounded-lg border text-center transition-all ${
                              selectedTime === time
                                ? 'border-primary bg-primary/10 text-foreground'
                                : 'border-border bg-card text-card-foreground hover:border-primary/30'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No available slots for this date</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Details */}
            {currentStep === 'details' && (
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">Your Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Name *</label>
                    <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
                    <Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Phone (optional)</label>
                    <Input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="Phone number" />
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl border border-border bg-card p-4 mt-6">
                    <h3 className="font-display font-semibold text-card-foreground mb-3">Booking Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="text-card-foreground">{service?.name}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-card-foreground">{selectedDate && format(new Date(selectedDate), 'MMM d, yyyy')}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="text-card-foreground">{selectedTime}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="text-card-foreground">{service?.duration_minutes} min</span></div>
                      {selectedAddons.length > 0 && addons && (
                        <div className="flex justify-between"><span className="text-muted-foreground">Add-ons</span><span className="text-card-foreground">{addons.filter(a => selectedAddons.includes(a.id)).map(a => a.name).join(', ')}</span></div>
                      )}
                      <div className="border-t border-border pt-2 flex justify-between font-semibold">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary text-lg">${totalPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation */}
            {currentStep === 'confirm' && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
                  <Check className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground mb-3">Booking Confirmed!</h2>
                <p className="text-muted-foreground mb-2">Your appointment has been booked successfully.</p>
                <div className="rounded-xl border border-border bg-card p-6 max-w-sm mx-auto mt-6 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="text-card-foreground font-medium">{service?.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-card-foreground">{selectedDate && format(new Date(selectedDate), 'MMM d, yyyy')}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="text-card-foreground">{selectedTime}</span></div>
                    <div className="flex justify-between font-semibold pt-2 border-t border-border"><span className="text-foreground">Total</span><span className="text-primary">${totalPrice}</span></div>
                  </div>
                </div>
                <Button variant="default" className="mt-8" onClick={() => navigate('/')}>Back to Home</Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {currentStep !== 'confirm' && (
          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={goBack} disabled={stepIndex === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button variant="default" onClick={goNext} disabled={!canProceed() || submitting}>
              {currentStep === 'details' ? (submitting ? 'Booking...' : 'Confirm Booking') : 'Next'}
              {currentStep !== 'details' && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
