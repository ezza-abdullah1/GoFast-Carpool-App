import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, MapPin, Users, Check, Loader2 } from 'lucide-react';
import axiosInstance from "../Authentication/redux/axiosInstance";
import { fetchUpcomingRides } from '../Authentication/redux/upcomingRidesSlice'; 
import { useDispatch, useSelector } from 'react-redux';
import { getLocationName } from '../UtilsFunctions/LocationName';
const CustomButton = ({ children, type = "button", variant = "default", onClick, disabled = false, isLoading = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`px-4 py-2 text-sm font-medium rounded-md flex items-center space-x-2 ${variant === "outline"
        ? "border border-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-blue-700"
        : "bg-blue-600 text-white hover:bg-blue-700"
        } ${(disabled || isLoading) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      <span>{children}</span>
    </button>
  );
};

const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};


const LocationSelector = ({ id, label, placeholder, value, onChange, onLocationSelect }) => {
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmEnabled, setConfirmEnabled] = useState(false);
  const [selectedLatLng, setSelectedLatLng] = useState(null);
  const L = window.L; 

  useEffect(() => {
    if (!showMap || !mapRef.current || !L) return; 

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (err) { }
      mapInstanceRef.current = null;
    }

    if (mapRef.current.childNodes.length > 0) {
      while (mapRef.current.firstChild) {
        mapRef.current.removeChild(mapRef.current.firstChild);
      }
    }

    const map = L.map(mapRef.current).setView([31.52, 74.3], 10);
    mapInstanceRef.current = map;

    try {
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
      }).addTo(map);
    } catch (err) {
      setError(true);
      setErrorMsg("Failed to load map tiles");
      return;
    }

    if (L.Control.geocoder) {
      try {
        const geocoder = L.Control.geocoder({
          collapsed: false,
          placeholder: "Search for a location",
          geocoder: L.Control.Geocoder.nominatim(),
          defaultMarkGeocode: false,
        });

        geocoder.on('markgeocode', (e) => {
          const { center, name } = e.geocode;
          if (name) {
            const parts = name.split(',').map(p => p.trim());
            const shortName = name.split(',').slice(0, 2).join(', ').trim();
            const district = parts.find(p => p.toLowerCase().includes('district'))?.split(' ')[0];
            const displayName = shortName + (district ? ", " + district : "");
            if (markerRef.current) {
              try {
                if (map.hasLayer(markerRef.current)) {
                  map.removeLayer(markerRef.current);
                }
              } catch (err) { }
            }
            try {
              markerRef.current = L.marker([center.lat, center.lng]);
              markerRef.current.addTo(map).bindPopup(`📍 ${displayName}`).openPopup();
              setSelectedLatLng({ lat: center.lat, lng: center.lng, name: displayName });
              setConfirmEnabled(true);
              map.setView([center.lat, center.lng], 14);
            } catch (err) {
              setError(true);
              setErrorMsg("Failed to add marker");
            }
          } else if (center) {
            getLocationName(center.lat, center.lng)
              .then(displayName => {
                setSelectedLatLng({ lat: center.lat, lng: center.lng, name: displayName });
                setConfirmEnabled(true);
                if (markerRef.current) {
                  try {
                    if (map.hasLayer(markerRef.current)) {
                      map.removeLayer(markerRef.current);
                    }
                  } catch (err) { }
                }
                try {
                  markerRef.current = L.marker([center.lat, center.lng]).addTo(map).bindPopup(`📍 ${displayName}`).openPopup();
                  map.setView([center.lat, center.lng], 14);
                } catch (err) {
                  setError(true);
                  setErrorMsg("Failed to add marker");
                }
              })
              .catch(error => {
                console.error("Error getting location name:", error);
                setSelectedLatLng({ lat: center.lat, lng: center.lng, name: `Coordinates (${center.lat.toFixed(5)}, ${center.lng.toFixed(5)})` });
                setConfirmEnabled(true);
                if (markerRef.current) {
                  try {
                    if (map.hasLayer(markerRef.current)) {
                      map.removeLayer(markerRef.current);
                    }
                  } catch (err) { }
                }
                try {
                  markerRef.current = L.marker([center.lat, center.lng]).addTo(map).bindPopup(`📍 Coordinates (${center.lat.toFixed(5)}, ${center.lng.toFixed(5)})`).openPopup();
                  map.setView([center.lat, center.lng], 14);
                } catch (err) {
                  setError(true);
                  setErrorMsg("Failed to add marker");
                }
              });
          }
        });

        geocoder.addTo(map);

        setTimeout(() => {
          try {
            const input = document.querySelector(".leaflet-control-geocoder-form input");
            if (input) {
              input.className = "px-3 py-2 rounded border border-input shadow-sm w-64 text-sm text-black";
            }
          } catch (err) { }
        }, 300);
      } catch (err) {
        setError(true);
        setErrorMsg("Geocoder failed to initialize");
      }
    }

    const handleMapClick = async (e) => {
      const { lat, lng } = e.latlng;

      getLocationName(lat, lng)
        .then(displayName => {
          setSelectedLatLng({ lat, lng, name: displayName });
          setConfirmEnabled(true);

          if (markerRef.current) {
            try {
              if (map.hasLayer(markerRef.current)) {
                map.removeLayer(markerRef.current);
              }
            } catch (err) { }
          }
          try {
            markerRef.current = L.marker([lat, lng]).addTo(map).bindPopup(`📍 ${displayName}`).openPopup();
          } catch (err) {
            setError(true);
            setErrorMsg("Failed to add marker");
          }
        })
        .catch(error => {
          console.error("Error getting location name:", error);
          setSelectedLatLng({ lat, lng, name: `Pinned Location (${lat.toFixed(5)}, ${lng.toFixed(5)})` });
          setConfirmEnabled(true);
          if (markerRef.current) {
            try {
              if (map.hasLayer(markerRef.current)) {
                map.removeLayer(markerRef.current);
              }
            } catch (err) { }
          }
          try {
            markerRef.current = L.marker([lat, lng]).addTo(map).bindPopup(`📍 Pinned Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`).openPopup();
          } catch (err) {
            setError(true);
            setErrorMsg("Failed to add marker");
          }
        });
    };

    if (map) {
      map.on('click', handleMapClick);

      return () => {
        map.off('click', handleMapClick);
      };
    }

    setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (err) { }
    }, 400);

  }, [showMap, L]); 

  const confirmLocation = () => {
    if (selectedLatLng) {
      onChange({
        target: {
          id,
          value: selectedLatLng.name || value
        }
      });

      if (onLocationSelect) {
        onLocationSelect(id, selectedLatLng);
      }

      setShowMap(false);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
          <MapPin className="h-5 w-5" />
        </div>
        <input
          id={id}
          type="text"
          value={value}
          onChange={onChange}
          onClick={() => setShowMap(true)}
          className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
          placeholder={placeholder}
          readOnly
        />
      </div>

      {showMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 dark:bg-gray-800">
            <h3 className="text-lg font-medium mb-4">Select {label}</h3>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 dark:bg-red-900 dark:text-red-200">
                {errorMsg}
              </div>
            )}

            <div ref={mapRef} className="w-full h-96 rounded-lg border mb-4"></div>

            <div className="flex justify-between">
              <CustomButton variant="outline" onClick={() => setShowMap(false)}>
                Cancel
              </CustomButton>

              <CustomButton onClick={confirmLocation} disabled={!confirmEnabled}>
                Confirm Location
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const createRideOffer = async (rideData) => {
  try {
    const response = await axiosInstance.post('/carpools/rides', rideData);
    return response.data;
  } catch (error) {
    console.error('Error in createRideOffer service:', error);
    throw error;
  }
};

export default function CarpoolForm({ userId }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    pickup: '',
    pickupLocation: null,
    dropoff: '',
    dropoffLocation: null,
    date: '',
    time: '',
    numberOfSeats: '1',
    preferences: [],
    notes: ''
  });
  const [submitStatus, setSubmitStatus] = useState({
    isSubmitting: false,
    error: null,
    success: false
  });
   const dispatch = useDispatch(); 
  const { userDetails } = useSelector((state) => state.user); 


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

  const handleLocationSelect = (id, locationData) => {
    if (id === 'pickup') {
      setFormData(prev => ({
        ...prev,
        pickupLocation: {
          name: locationData.name,
          lat: locationData.lat,
          lng: locationData.lng
        }
      }));
    } else if (id === 'dropoff') {
      setFormData(prev => ({
        ...prev,
        dropoffLocation: {
          name: locationData.name,
          lat: locationData.lat,
          lng: locationData.lng
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setSubmitStatus({
      isSubmitting: true,
      error: null,
      success: false
    });
     
    try {
      if (!userId) {
        setSubmitStatus({
          isSubmitting: false,
          error: 'User ID is missing. Please log in.',
          success: false
        });
        return;
      }

      if (!formData.pickupLocation?.lat || !formData.pickupLocation?.lng) {
        setSubmitStatus({
          isSubmitting: false,
          error: 'Please select a pickup location from the map.',
          success: false
        });
        return;
      }

      if (!formData.dropoffLocation?.lat || !formData.dropoffLocation?.lng) {
        setSubmitStatus({
          isSubmitting: false,
          error: 'Please select a drop-off location from the map.',
          success: false
        });
        return;
      }

      const rideData = {
        userId: userId,
        pickup: {
          name: formData.pickup,
          latitude: parseFloat(formData.pickupLocation.lat),
          longitude: parseFloat(formData.pickupLocation.lng)
        },
        dropoff: {
          name: formData.dropoff,
          latitude: parseFloat(formData.dropoffLocation.lat),
          longitude: parseFloat(formData.dropoffLocation.lng)
        },
        numberOfSeats: parseInt(formData.numberOfSeats),
        date: formData.date,
        time: formData.time,
        preferences: formData.preferences
      };

      const result = await createRideOffer(rideData);
      if (userDetails?.id && result?.data) { 
        dispatch(addUpcomingRide(result.data));
      } else if (userDetails?.id) {
        dispatch(fetchUpcomingRides(userDetails.id));
      }

      setSubmitStatus({
        isSubmitting: false,
        error: null,
        success: true
      });

      setTimeout(() => {
        setStep(1);
        setFormData({
          pickup: '',
          pickupLocation: null,
          dropoff: '',
          dropoffLocation: null,
          date: '',
          time: '',
          numberOfSeats: '1',
          preferences: [],
          notes: ''
        });
        setSubmitStatus(prev => ({ ...prev, success: false }));
      }, 2000);

    } catch (error) {
      console.error('Error creating ride:', error);

      setSubmitStatus({
        isSubmitting: false,
        error: error.response?.data?.message || error.message || 'Failed to create ride',
        success: false
      });
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.pickup || !formData.dropoff || !formData.pickupLocation || !formData.dropoffLocation) {
        console.error("Step 1 validation failed - missing pickup or dropoff location data");
        return;
      }
    } else if (step === 2) {
      if (!formData.date || !formData.time) {
        console.error("Step 2 validation failed - missing date or time");
        return;
      }
    }

    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

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

        {submitStatus.success && (
          <div className="mb-4 p-4 rounded-md bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-2" />
              <span>Ride offer posted successfully!</span>
            </div>
          </div>
        )}

        {submitStatus.error && (
          <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
            <div className="flex items-start">
              <span className="mr-2">⚠️</span>
              <span>{submitStatus.error}</span>
            </div>
          </div>
        )}

        <div>
          {/* Step 1: Route */}
          {step === 1 && (
            <div className="space-y-4">
              <LocationSelector
                id="pickup"
                label="Pickup Location"
                placeholder="e.g., FAST NUCES Main Campus"
                value={formData.pickup}
                onChange={handleInputChange}
                onLocationSelect={handleLocationSelect}
              />

              <LocationSelector
                id="dropoff"
                label="Drop-off Location"
                placeholder="e.g., Gulshan-e-Iqbal"
                value={formData.dropoff}
                onChange={handleInputChange}
                onLocationSelect={handleLocationSelect}
              />

              <div className="space-y-2">
                <label htmlFor="numberOfSeats" className="text-sm font-medium">
                  Available Seats
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Users className="h-5 w-5" />
                  </div>
                  <select
                    id="numberOfSeats"
                    value={formData.numberOfSeats}
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
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <Clock className="h-5 w-5" />
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

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <CustomButton variant="outline" onClick={prevStep} disabled={submitStatus.isSubmitting}>
                Back
              </CustomButton>
            ) : (
              <div></div>
            )}

            {step === 1 ? (
              <CustomButton
                onClick={nextStep}
                disabled={!formData.pickup || !formData.dropoff || !formData.pickupLocation || !formData.dropoffLocation || submitStatus.isSubmitting}
              >
                Continue to Schedule
              </CustomButton>
            ) : step === 2 ? (
              <CustomButton
                onClick={nextStep}
                disabled={!formData.date || !formData.time || submitStatus.isSubmitting}
              >
                Continue to Preferences
              </CustomButton>
            ) : (
              <CustomButton onClick={handleSubmit} isLoading={submitStatus.isSubmitting} disabled={submitStatus.isSubmitting}>
                Post Ride
              </CustomButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}