import React, { useState } from 'react';
import { Clock, Car, Users, Star, MessageCircle, Plus } from 'lucide-react';
import Button from '../Components/ui/compatibility-button';
import CarpoolPost from '../Components/FindCarpool/CarpoolPost';
import CarpoolForm from '../Components/FindCarpool/CarpoolForm';
import { cn } from '../lib/utils';
import { useSelector } from 'react-redux';
import { AiOutlineExclamationCircle } from 'react-icons/ai';


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCarpoolForm, setShowCarpoolForm] = useState(false);
  const { userDetails, loading, error } = useSelector((state) => state.user);  // Get user details from Redux

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RingLoader color="#3498db" size={60} />
      </div> 
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center bg-red-200 p-8 rounded-lg shadow-md">
          <AiOutlineExclamationCircle size={40} className="text-red-600 mb-4" />
          <h2 className="text-xl text-red-600 font-semibold">{error}</h2>
          <p className="text-sm text-gray-600">Something went wrong. Please try again later.</p>
        </div>
      </div> 
    );
  }

  if (!userDetails) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center bg-yellow-100 p-8 rounded-lg shadow-md">
          <AiOutlineExclamationCircle size={40} className="text-yellow-600 mb-4" />
          <h2 className="text-xl text-yellow-600 font-semibold">No user details available</h2>
          <p className="text-sm text-gray-600">Please make sure you're logged in.</p>
        </div>
      </div> // Styled empty state message with an icon
    );
  }

  // Sample data for upcoming rides
  const upcomingRides = [
    {
      id: '1',
      driver: {
        name: 'Sara Malik',
        rating: 4.9,
        department: 'Electrical Engineering',
      },
      route: {
        pickup: 'North Nazimabad',
        dropoff: 'FAST NUCES Main Campus',
      },
      schedule: {
        date: 'Tomorrow',
        time: '8:15 AM',
      },
      seats: {
        total: 3,
        available: 0,
      },
      preferences: ['Female riders only'],
    },
  ];

  // Sample data for ride history
  const rideHistory = [
    {
      id: '2',
      driver: {
        name: 'Bilal Ahmed',
        rating: 4.7,
        department: 'Business Administration',
      },
      route: {
        pickup: 'DHA Phase 6',
        dropoff: 'FAST NUCES Main Campus',
      },
      schedule: {
        date: 'Last Friday',
        time: '9:00 AM',
      },
      seats: {
        total: 4,
        available: 0,
      },
    },
    {
      id: '3',
      driver: {
        name: 'Ayesha Tariq',
        rating: 4.6,
        department: 'Computer Science',
      },
      route: {
        pickup: 'FAST NUCES Main Campus',
        dropoff: 'Gulshan-e-Iqbal',
      },
      schedule: {
        date: 'Last Wednesday',
        time: '4:30 PM',
      },
      seats: {
        total: 3,
        available: 0,
      },
    },
  ];

  // Sample data for ride offers
  const rideOffers = [
    {
      id: '4',
      driver: {
        name: userDetails.fullName,  // Use fullName from userDetails
        rating: userDetails.rating,
        department: userDetails.department,
      },
      route: {
        pickup: 'FAST NUCES Main Campus',
        dropoff: 'Gulistan-e-Johar',
      },
      schedule: {
        date: 'Tomorrow',
        time: '4:30 PM',
      },
      seats: {
        total: 4,
        available: 2,
      },
      preferences: ['No smoking', 'Music lovers welcome'],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pt-20">
        {/* User Profile Section */}
        <section className="bg-muted/30 dark:bg-muted/5 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* User Avatar */}
              <div className="h-24 w-24 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0 border-4 border-white dark:border-black">
                <span className="text-4xl font-bold text-primary-600 dark:text-primary-300">
                  {userDetails.fullName.charAt(0)} {/* User's first character of full name */}
                </span>
              </div>

              {/* User Info */}
              <div className="md:flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{userDetails.fullName}</h1> {/* Display full name */}
                <p className="text-muted-foreground mb-2">{userDetails.department.toUpperCase()}</p> {/* Display department and batch */}
                <div className="flex items-center justify-center md:justify-start gap-1 mb-4">
                  <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                  <span className="font-medium">{userDetails.rating.toFixed(1)}</span> {/* Display rating */}
                  <span className="text-muted-foreground text-sm">({userDetails.rides_offered + userDetails.rides_taken} rides)</span> {/* Display number of rides */}
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold">{userDetails.rides_offered}</p> {/* Display rides offered */}
                    <p className="text-xs text-muted-foreground">Rides Offered</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{userDetails.rides_taken}</p> {/* Display rides taken */}
                    <p className="text-xs text-muted-foreground">Rides Taken</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  size="sm"
                  className="bg-blue-500 dark:bg-muted dark:hover:bg-button-hover dark:text-white text-white rounded-full px-4 py-1.5 text-sm hover:bg-blue-600 active:bg-blue-700"
                  variant="outline"
                  onClick={() => setShowCarpoolForm(!showCarpoolForm)}
                >
                  {showCarpoolForm ? (
                    <>Cancel</>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Offer Ride
                    </>
                  )}
                </Button>

                <Button>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Messages
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Carpool Form (Conditional) */}
        {showCarpoolForm && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <CarpoolForm />
            </div>
          </section>
        )}

        {/* Rides Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Tabs */}
            <div className="flex flex-wrap border-b border-border mb-8">
              <button
                className={cn(
                  "px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors",
                  activeTab === 'upcoming'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming Rides
              </button>
              <button
                className={cn(
                  "px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors",
                  activeTab === 'history'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTab('history')}
              >
                Ride History
              </button>
              <button
                className={cn(
                  "px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors",
                  activeTab === 'offers'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTab('offers')}
              >
                Pending Requests
              </button>
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
              {activeTab === 'upcoming' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Your Upcoming Rides</h2>
                  {upcomingRides.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {upcomingRides.map((ride) => (
                        <CarpoolPost key={ride.id} {...ride} activeTab={activeTab} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/50 dark:bg-muted/20 rounded-xl p-8 text-center">
                      <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No upcoming rides</h3>
                      <p className="text-muted-foreground mb-6">
                        You don't have any upcoming rides scheduled. Find a carpool or offer a ride!
                      </p>
                      <Button>Find a Carpool</Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Your Ride History</h2>
                  {rideHistory.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {rideHistory.map((ride) => (
                        <CarpoolPost key={ride.id} {...ride} activeTab={activeTab} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/50 dark:bg-muted/20 rounded-xl p-8 text-center">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No ride history</h3>
                      <p className="text-muted-foreground mb-6">
                        You haven't taken any rides yet. Start carpooling to build your history!
                      </p>
                      <Button>Find a Carpool</Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'offers' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Pending Requests</h2>
                  {rideOffers.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {rideOffers.map((ride) => (
                        <CarpoolPost key={ride.id} {...ride} offerRide={true} activeTab={activeTab} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/50 dark:bg-muted/20 rounded-xl p-8 text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No ride offers</h3>
                      <p className="text-muted-foreground mb-6">
                        You haven't offered any rides yet. Share your journey with others!
                      </p>
                      <Button onClick={() => setShowCarpoolForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Offer a Ride
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
