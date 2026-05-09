import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { attendanceService } from '../services/attendanceService';
import { UserRole, SessionData } from '../types';
import { CheckCircle2, UserCircle, Hash, Store, LayoutGrid, Info } from 'lucide-react';


export function CheckIn() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<SessionData | undefined>();
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [boothNumber, setBoothNumber] = useState('');
  const [category, setCategory] = useState('');
  const [role, setRole] = useState<UserRole>('attendee');
  const [status, setStatus] = useState<'idle' | 'success' | 'duplicate' | 'error' | 'invalid_session'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sessionId) {
      const activeSession = attendanceService.getSession(sessionId);
      if (activeSession) {
        setSession(activeSession);
        // Set default role to the first allowed role
        if (activeSession.formConfig.allowedRoles.length > 0) {
          setRole(activeSession.formConfig.allowedRoles[0]);
        }
      } else {
        setStatus('invalid_session');
      }
    }
  }, [sessionId]);



  const categories = [
    'Technology',
    'Agriculture',
    'Education',
    'Healthcare',
    'Finance',
    'Retail',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role === 'exhibitor' && (!boothNumber.trim() || !category.trim())) {
      setStatus('error');
      return;
    }

    setIsSubmitting(true);

    // Simulate brief loading
    await new Promise(resolve => setTimeout(resolve, 300));

    const success = attendanceService.addAttendee(
      sessionId || 'default',
      name.trim(), 
      role, 
      idNumber.trim(),
      role === 'exhibitor' ? boothNumber.trim() : undefined,
      role === 'exhibitor' ? category.trim() : undefined
    );


    if (success) {
      setStatus('success');
      setName('');
      setIdNumber('');
      setBoothNumber('');
      setCategory('');

      // Reset success message after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } else {
      setStatus('duplicate');
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }

    setIsSubmitting(false);
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl mb-2">Checked In Successfully!</h1>
          <p className="text-muted-foreground">Thank you for attending</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-1 text-primary font-bold">Swift Attend</h1>
          {session ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Info className="w-4 h-4" />
              <p className="text-sm font-medium">{session.name}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">General Check-In</p>
          )}
        </div>

        {status === 'invalid_session' && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-center">
            <p className="font-bold">Invalid Session</p>
            <p className="text-sm">This check-in link is no longer active.</p>
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Toggle */}
          {session && session.formConfig.allowedRoles.length > 1 && (
            <div className="bg-muted rounded-lg p-1 grid grid-cols-2 gap-1 sm:grid-cols-4">
              {session.formConfig.allowedRoles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-2 rounded-md text-xs transition-colors font-bold ${
                    role === r
                      ? 'bg-background shadow-sm text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          )}


          {/* Name Input */}
          <div>
            <label className="block mb-2">Name</label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-3 bg-input-background rounded-lg outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>

          {/* ID Number Input */}
          {(!session || session.formConfig.requireIdNumber) && (
            <div>
              <label className="block mb-2 font-bold text-sm">
                {role === 'student' ? 'Matric Number' : 
                 role === 'lecturer' ? 'Lecturer ID' : 
                 role === 'exhibitor' ? 'Exhibition ID' : 'Registration ID'}
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="Enter unique ID"
                  className="w-full pl-10 pr-4 py-3 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-primary transition-all"
                  required={session?.formConfig.requireIdNumber}
                />
              </div>
            </div>
          )}


          {/* Exhibitor Specific Fields */}
          {role === 'exhibitor' && (!session || session.formConfig.collectBoothInfo) && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block mb-2 font-bold text-sm">Booth Number</label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={boothNumber}
                    onChange={(e) => setBoothNumber(e.target.value)}
                    placeholder="e.g., A12"
                    className="w-full pl-10 pr-4 py-3 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-bold text-sm">Category</label>
                <div className="relative">
                  <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-primary appearance-none transition-all"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}


          {/* Error Messages */}
          {status === 'duplicate' && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
              Already checked in
            </div>
          )}

          {status === 'error' && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
              Please fill in all fields
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? 'Checking In...' : 'CHECK-IN'}
          </button>
        </form>

        {/* Offline Indicator */}
        {!navigator.onLine && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            📡 Offline mode - data will sync when connected
          </div>
        )}
      </div>
    </div>
  );
}
