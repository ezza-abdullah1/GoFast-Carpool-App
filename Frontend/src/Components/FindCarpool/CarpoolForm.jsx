import React, { useState } from 'react';
import { CalendarIcon, Clock, Car, Users, MapPin, Plus, Check } from 'lucide-react';
import Button from '../ui/compatibility-button';
import { cn } from '../../lib/utils';

const CarpoolForm = () => {
  const [step, setStep] = useState(1);
  const [offeringRide, setOfferingRide] = useState(true);
  
  // Form state
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('1');
  const [recurring, setRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState([]);
  const [preferences, setPreferences] = useState([]);
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const preferenceOptions = [
    'Female riders only',
    'Male riders only',
    'Same department preferred',
    'No smoking',
    'No food/drinks',
    'Mask required'
  ];
  
  const toggleRecurringDay = (day) => {
    setRecurringDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };
  
  const togglePreference = (pref) => {
    setPreferences(prev => 
      prev.includes(pref) 
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, this would handle form submission to backend
    console.log('Form submitted:', {
      type: offeringRide ? 'offering' : 'requesting',
      pickup,
      dropoff,
      date,
      time,
      seats: parseInt(seats),
      recurring,
      recurringDays: recurring ? recurringDays : [],
      preferences
    });
    
    // Reset form
    setStep(1);
    setPickup('');
    setDropoff('');
    setDate('');
    setTime('');
    setSeats('1');
    setRecurring(false);
    setRecurringDays([]);
    setPreferences([]);
  };
  
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">{offeringRide ? 'Offer a Ride' : 'Request a Ride'}</h2>
        
        {/* Ride type selection */}
        <div className="flex gap-3 mb-6">
          <Button
            variant={offeringRide ? "primary" : "outline"}
            className="flex-1"
            onClick={() => setOfferingRide(true)}
          >
            <Car className="mr-2 h-5 w-5" />
            Offer a Ride
          </Button>
          <Button
            variant={!offeringRide ? "primary" : "outline"}
            className="flex-1"
            onClick={() => setOfferingRide(false)}
          >
            <Users className="mr-2 h-5 w-5" />
            Request a Ride
          </Button>
        </div>
        
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step === stepNumber
                      ? "bg-primary text-white"
                      : step > stepNumber
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step > stepNumber ? <Check className="h-4 w-4" /> : stepNumber}
                </div>
                <span className="text-xs mt-1 text-muted-foreground">
                  {stepNumber === 1 ? 'Route' : stepNumber === 2 ? 'Schedule' : 'Preferences'}
                </span>
              </div>
              
              {stepNumber < 3 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2",
                    step > stepNumber ? "bg-primary-200 dark:bg-primary-900/60" : "bg-muted"
                  )}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Step 1: Route */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label htmlFor="pickup" className="text-sm font-medium">
                  Pickup Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <input
                    id="pickup"
                    type="text"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="input-base pl-10"
                    placeholder="e.g., FAST NUCES Main Campus"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="dropoff" className="text-sm font-medium">
                  Drop-off Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <input
                    id="dropoff"
                    type="text"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    className="input-base pl-10"
                    placeholder="e.g., Gulshan-e-Iqbal"
                    required
                  />
                </div>
              </div>
              
              {offeringRide && (
                <div className="space-y-2">
                  <label htmlFor="seats" className="text-sm font-medium">
                    Available Seats
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      <Users className="h-5 w-5" />
                    </div>
                    <select
                      id="seats"
                      value={seats}
                      onChange={(e) => setSeats(e.target.value)}
                      className="input-base pl-10"
                      required
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>
                          {num} seat{num !== 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Step 2: Schedule */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">
                  Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-base pl-10"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="time" className="text-sm font-medium">
                  Departure Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <Clock className="h-5 w-5" />
                  </div>
                  <input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="input-base pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center mb-4">
                  <input
                    id="recurring"
                    type="checkbox"
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                    className="h-4 w-4 rounded border-input bg-transparent text-primary focus:ring-primary focus:ring-offset-background"
                  />
                  <label htmlFor="recurring" className="ml-2 text-sm font-medium">
                    This is a recurring ride
                  </label>
                </div>
                
                {recurring && (
                  <div className="pl-6 animate-fade-in">
                    <div className="text-sm font-medium mb-2">Select days of the week:</div>
                    <div className="flex flex-wrap gap-2">
                      {days.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleRecurringDay(day)}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                            recurringDays.includes(day)
                              ? "bg-primary text-white"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          {day.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <div className="text-sm font-medium mb-3">Ride Preferences (Optional)</div>
                <div className="grid grid-cols-2 gap-3">
                  {preferenceOptions.map((pref) => (
                    <div 
                      key={pref}
                      onClick={() => togglePreference(pref)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                        preferences.includes(pref)
                          ? "border-primary bg-primary-50 dark:bg-primary-900/20"
                          : "border-border hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center",
                        preferences.includes(pref)
                          ? "bg-primary text-white"
                          : "bg-muted"
                      )}>
                        {preferences.includes(pref) && <Check className="h-3 w-3" />}
                      </div>
                      <span className="text-sm">{pref}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Additional Notes (Optional)</div>
                <textarea
                  className="input-base min-h-[100px]"
                  placeholder="Add any additional information about your ride..."
                ></textarea>
              </div>
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
            ) : (
              <div></div>
            )}
            
            {step < 3 ? (
              <Button 
                type="button" 
                onClick={nextStep}
                disabled={
                  (step === 1 && (!pickup || !dropoff)) || 
                  (step === 2 && (!date || !time || (recurring && recurringDays.length === 0)))
                }
              >
                Continue
              </Button>
            ) : (
              <Button type="submit">
                {offeringRide ? 'Post Ride' : 'Request Ride'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarpoolForm;