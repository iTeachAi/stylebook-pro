import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Trash2, Calendar, Settings, Package, Layers } from 'lucide-react';
import { format } from 'date-fns';
import { Navigate } from 'react-router-dom';

type Tab = 'bookings' | 'services' | 'addons' | 'schedule';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('bookings');
  const queryClient = useQueryClient();

  // Service form state
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [sName, setSName] = useState('');
  const [sDesc, setSDesc] = useState('');
  const [sPrice, setSPrice] = useState('');
  const [sDuration, setSDuration] = useState('30');
  const [sGender, setSGender] = useState('unisex');
  const [sLength, setSLength] = useState('medium');

  // Add-on form state
  const [showAddonForm, setShowAddonForm] = useState(false);
  const [aName, setAName] = useState('');
  const [aPrice, setAPrice] = useState('');

  // Blocked date
  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const tabs: { key: Tab; label: string; icon: typeof Calendar }[] = [
    { key: 'bookings', label: 'Bookings', icon: Calendar },
    { key: 'services', label: 'Services', icon: Package },
    { key: 'addons', label: 'Add-ons', icon: Layers },
    { key: 'schedule', label: 'Schedule', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-16">
        <h1 className="text-3xl font-display font-bold text-foreground mb-6">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-surface-hover'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'bookings' && <BookingsTab />}
        {tab === 'services' && (
          <ServicesTab
            showForm={showServiceForm}
            setShowForm={setShowServiceForm}
            formState={{ sName, setSName, sDesc, setSDesc, sPrice, setSPrice, sDuration, setSDuration, sGender, setSGender, sLength, setSLength }}
          />
        )}
        {tab === 'addons' && (
          <AddonsTab
            showForm={showAddonForm}
            setShowForm={setShowAddonForm}
            formState={{ aName, setAName, aPrice, setAPrice }}
          />
        )}
        {tab === 'schedule' && (
          <ScheduleTab blockDate={blockDate} setBlockDate={setBlockDate} blockReason={blockReason} setBlockReason={setBlockReason} />
        )}
      </div>
    </div>
  );
}

function BookingsTab() {
  const queryClient = useQueryClient();
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, services(name)')
        .order('booking_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-bookings'] }); toast.success('Status updated'); },
  });

  if (isLoading) return <div className="text-muted-foreground">Loading bookings...</div>;

  return (
    <div className="space-y-4">
      {bookings && bookings.length > 0 ? bookings.map(b => (
        <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-card-foreground">{b.client_name}</h3>
              <p className="text-sm text-muted-foreground">{b.client_email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(b.services as any)?.name} · {format(new Date(b.booking_date), 'MMM d, yyyy')} at {b.start_time}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                b.status === 'confirmed' ? 'bg-primary/10 text-primary' :
                b.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                b.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                'bg-muted text-muted-foreground'
              }`}>
                {b.status}
              </span>
              <select
                value={b.status}
                onChange={e => updateStatus.mutate({ id: b.id, status: e.target.value })}
                className="text-sm bg-secondary text-secondary-foreground border border-border rounded-lg px-2 py-1"
              >
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
              <span className="text-primary font-semibold">${b.total_price}</span>
            </div>
          </div>
        </motion.div>
      )) : <p className="text-muted-foreground text-center py-8">No bookings yet</p>}
    </div>
  );
}

function ServicesTab({ showForm, setShowForm, formState }: any) {
  const queryClient = useQueryClient();
  const { data: services } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const addService = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('services').insert({
        name: formState.sName,
        description: formState.sDesc,
        price: parseFloat(formState.sPrice),
        duration_minutes: parseInt(formState.sDuration),
        category_gender: formState.sGender,
        category_length: formState.sLength,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      setShowForm(false);
      formState.setSName(''); formState.setSDesc(''); formState.setSPrice('');
      toast.success('Service added');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-services'] }); toast.success('Service deleted'); },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-display font-semibold text-foreground">Services</h2>
        <Button variant="gold" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Add Service
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl border border-border bg-card p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Service name" value={formState.sName} onChange={e => formState.setSName(e.target.value)} />
            <Input placeholder="Price" type="number" value={formState.sPrice} onChange={e => formState.setSPrice(e.target.value)} />
            <Input placeholder="Duration (min)" type="number" value={formState.sDuration} onChange={e => formState.setSDuration(e.target.value)} />
            <select value={formState.sGender} onChange={e => formState.setSGender(e.target.value)} className="bg-input text-foreground border border-border rounded-lg px-3 py-2 text-sm">
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
            </select>
            <select value={formState.sLength} onChange={e => formState.setSLength(e.target.value)} className="bg-input text-foreground border border-border rounded-lg px-3 py-2 text-sm">
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
          <Textarea placeholder="Description" className="mt-3" value={formState.sDesc} onChange={e => formState.setSDesc(e.target.value)} />
          <Button variant="gold" size="sm" className="mt-3" onClick={() => addService.mutate()} disabled={!formState.sName || !formState.sPrice}>
            Save Service
          </Button>
        </motion.div>
      )}

      <div className="space-y-3">
        {services?.map(s => (
          <div key={s.id} className="rounded-xl border border-border bg-card p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-card-foreground">{s.name}</h3>
              <p className="text-sm text-muted-foreground">{s.category_gender} · {s.category_length} · {s.duration_minutes}min · ${s.price}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteService.mutate(s.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddonsTab({ showForm, setShowForm, formState }: any) {
  const queryClient = useQueryClient();
  const { data: addons } = useQuery({
    queryKey: ['admin-addons'],
    queryFn: async () => {
      const { data, error } = await supabase.from('add_ons').select('*');
      if (error) throw error;
      return data;
    },
  });

  const addAddon = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('add_ons').insert({
        name: formState.aName,
        price: parseFloat(formState.aPrice),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-addons'] });
      setShowForm(false);
      formState.setAName(''); formState.setAPrice('');
      toast.success('Add-on created');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteAddon = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('add_ons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-addons'] }); toast.success('Add-on deleted'); },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-display font-semibold text-foreground">Add-ons</h2>
        <Button variant="gold" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Add Add-on
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-4 mb-4 flex gap-3">
          <Input placeholder="Name" value={formState.aName} onChange={e => formState.setAName(e.target.value)} />
          <Input placeholder="Price" type="number" value={formState.aPrice} onChange={e => formState.setAPrice(e.target.value)} className="w-32" />
          <Button variant="gold" size="sm" onClick={() => addAddon.mutate()} disabled={!formState.aName || !formState.aPrice}>Save</Button>
        </motion.div>
      )}

      <div className="space-y-3">
        {addons?.map(a => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-4 flex justify-between items-center">
            <div>
              <span className="font-semibold text-card-foreground">{a.name}</span>
              <span className="text-primary ml-3">${a.price}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteAddon.mutate(a.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleTab({ blockDate, setBlockDate, blockReason, setBlockReason }: any) {
  const queryClient = useQueryClient();
  const { data: schedule } = useQuery({
    queryKey: ['admin-schedule'],
    queryFn: async () => {
      const { data, error } = await supabase.from('schedule_settings').select('*').order('day_of_week');
      if (error) throw error;
      return data;
    },
  });

  const { data: blockedDates } = useQuery({
    queryKey: ['admin-blocked'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blocked_dates').select('*').order('blocked_date');
      if (error) throw error;
      return data;
    },
  });

  const toggleDay = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('schedule_settings').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-schedule'] }),
  });

  const updateSchedule = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: string }) => {
      const { error } = await supabase.from('schedule_settings').update({ [field]: value }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-schedule'] }),
  });

  const addBlocked = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('blocked_dates').insert({ blocked_date: blockDate, reason: blockReason || null });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blocked'] });
      setBlockDate(''); setBlockReason('');
      toast.success('Date blocked');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removeBlocked = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-blocked'] }); toast.success('Unblocked'); },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-display font-semibold text-foreground mb-4">Weekly Schedule</h2>
        <div className="space-y-3">
          {schedule?.map(s => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 min-w-[140px]">
                <button
                  onClick={() => toggleDay.mutate({ id: s.id, is_active: !s.is_active })}
                  className={`w-10 h-6 rounded-full transition-colors ${s.is_active ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${s.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <span className="font-medium text-card-foreground">{dayNames[s.day_of_week]}</span>
              </div>
              {s.is_active && (
                <div className="flex items-center gap-2 text-sm">
                  <Input
                    type="time"
                    value={s.start_time}
                    onChange={e => updateSchedule.mutate({ id: s.id, field: 'start_time', value: e.target.value })}
                    className="w-32"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={s.end_time}
                    onChange={e => updateSchedule.mutate({ id: s.id, field: 'end_time', value: e.target.value })}
                    className="w-32"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-display font-semibold text-foreground mb-4">Blocked Dates</h2>
        <div className="flex gap-3 mb-4">
          <Input type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)} className="w-48" />
          <Input placeholder="Reason (optional)" value={blockReason} onChange={e => setBlockReason(e.target.value)} />
          <Button variant="gold" size="sm" onClick={() => addBlocked.mutate()} disabled={!blockDate}>Block</Button>
        </div>
        <div className="space-y-2">
          {blockedDates?.map(b => (
            <div key={b.id} className="rounded-lg border border-border bg-card p-3 flex justify-between items-center">
              <div>
                <span className="text-card-foreground font-medium">{format(new Date(b.blocked_date), 'MMM d, yyyy')}</span>
                {b.reason && <span className="text-muted-foreground text-sm ml-2">— {b.reason}</span>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeBlocked.mutate(b.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
