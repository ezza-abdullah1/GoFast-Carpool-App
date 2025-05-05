import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Check } from 'lucide-react';

// Custom Button component
const CustomButton = ({ children, type = "button", variant = "default", onClick, disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-sm font-medium rounded-md ${
        variant === "outline"
          ? "border border-gray-300 bg-transparent hover:bg-gray-100"
          : "bg-blue-600 text-white hover:bg-blue-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
};

// Helper function to combine class names conditionally
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export default function CarpoolForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    date: '',
    time: '',
    seats: '1',
    preferences: [],
    notes: ''
  });

  // For debugging - log state changes
  useEffect(() => {
    console.log("Current step:", step);
    console.log("Form data:", formData);
  }, [step, formData]);

  const preferenceOptions = [
    'Female riders only',
    'Male riders only',
    'Same department preferred',
    'No smoking',
    'No food/drinks',
    'Mask required',
  ];

  const togglePreference = (pref) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter(p => p !== pref)
        : [...prev.preferences, pref]
    }));
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    console.log('Form submitted:', {
      type: 'offering',
      ...formData
    });

    // Reset form
    setStep(1);
    setFormData({
      pickup: '',
      dropoff: '',
      date: '',
      time: '',
      seats: '1',
      preferences: [],
      notes: ''
    });
  };

  const nextStep = () => {
    // Step-specific validation
    if (step === 1) {
      if (!formData.pickup || !formData.dropoff) {
        console.log("Step 1 validation failed - missing pickup or dropoff");
        return;
      }
    } else if (step === 2) {
      if (!formData.date || !formData.time) {
        console.log("Step 2 validation failed - missing date or time");
        return;
      }
    }
    
    console.log(`Moving from step ${step} to ${step + 1}`);
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden dark:bg-gray-800 dark:border-gray-700">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">Offer a Ride</h2>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium',
                    step === stepNumber
                      ? 'bg-blue-600 text-white'
                      : step > stepNumber
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  )}
                >
                  {step > stepNumber ? <Check className="h-4 w-4" /> : stepNumber}
                </div>
                <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                  {stepNumber === 1
                    ? 'Route'
                    : stepNumber === 2
                    ? 'Schedule'
                    : 'Preferences'}
                </span>
              </div>

              {stepNumber < 3 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2',
                    step > stepNumber ? 'bg-blue-200 dark:bg-blue-900/60' : 'bg-gray-200 dark:bg-gray-700'
                  )}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div>
          {/* Step 1: Route */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="pickup" className="text-sm font-medium">
                  Pickup Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <input
                    id="pickup"
                    type="text"
                    value={formData.pickup}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., FAST NUCES Main Campus"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="dropoff" className="text-sm font-medium">
                  Drop-off Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <input
                    id="dropoff"
                    type="text"
                    value={formData.dropoff}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Gulshan-e-Iqbal"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="seats" className="text-sm font-medium">
                  Available Seats
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Users className="h-5 w-5" />
                  </div>
                  <select
                    id="seats"
                    value={formData.seats}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} seat{num !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">
                  Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min={today}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="time" className="text-sm font-medium">
                  Departure Time
                </label>
                <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">                    <Clock className="h-5 w-5" />
                  </div>
                  <input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-3">Ride Preferences (Optional)</div>
                <div className="grid grid-cols-2 gap-3">
                  {preferenceOptions.map((pref) => (
                    <div
                      key={pref}
                      onClick={() => togglePreference(pref)}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                        formData.preferences.includes(pref)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700'
                          : 'border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700'
                      )}
                    >
                      <div
                        className={cn(
                          'h-5 w-5 rounded-full flex items-center justify-center',
                          formData.preferences.includes(pref)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700'
                        )}
                      >
                        {formData.preferences.includes(pref) && <Check className="h-3 w-3" />}
                      </div>
                      <span className="text-sm">{pref}</span>
                    </div>
                  ))}
                </div>
              </div>

             
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <CustomButton variant="outline" onClick={prevStep}>
                Back
              </CustomButton>
            ) : (
              <div></div>
            )}

            {step === 1 ? (
              <CustomButton
                onClick={nextStep}
                disabled={!formData.pickup || !formData.dropoff}
              >
                Continue to Schedule
              </CustomButton>
            ) : step === 2 ? (
              <CustomButton
                onClick={nextStep}
                disabled={!formData.date || !formData.time}
              >
                Continue to Preferences
              </CustomButton>
            ) : (
              <CustomButton onClick={handleSubmit}>Post Ride</CustomButton>
            )}
          </div>
          
         
        </div>
      </div>
    </div>
  );
}