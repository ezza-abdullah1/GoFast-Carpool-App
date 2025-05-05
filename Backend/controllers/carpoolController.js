let carpools = [
  {
    id: '1',
    driver: {
      name: 'Ahmed Khan',
      gender: 'male',
      rating: 4.8,
      department: 'Computer Science',
    },
    route: {
      pickup: 'FAST NUCES Main Campus',
      dropoff: 'Gulistan-e-Johar',
    },
    schedule: {
      date: '2025-05-21',
      time: '4:30 pm',
      recurring: ['Monday', 'Wednesday', 'Friday'],
    },
    seats: {
      total: 4,
      available: 2,
    },
    preferences: ['No smoking', 'Music lovers welcome'],
  },
  {
    id: '2',
    driver: {
      name: 'Sara Malik',
      gender: 'female',
      rating: 4.9,
      department: 'Electrical Engineering',
    },
    route: {
      pickup: 'North Nazimabad',
      dropoff: 'FAST NUCES Main Campus',
    },
    schedule: {
      date: '2025-05-22',
      time: '8:15 am',
      recurring: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    },
    seats: {
      total: 3,
      available: 1,
    },
    preferences: ['Female riders only'],
  },
  {
    id: '3',
    driver: {
      name: 'Bilal Haider',
      gender: 'male',
      rating: 3.2,
      department: 'Business Administration',
    },
    route: {
      pickup: 'Gulshan-e-Iqbal',
      dropoff: 'FAST NUCES Main Campus',
    },
    schedule: {
      date: '2025-05-23',
      time: '9:00 am',
      recurring: ['Tuesday'],
    },
    seats: {
      total: 4,
      available: 0,
    },
    preferences: ['No smoking'],
  },
  {
    id: '4',
    driver: {
      name: 'Zoya Rehman',
      gender: 'female',
      rating: 5.0,
      department: 'Software Engineering',
    },
    route: {
      pickup: 'DHA Phase 6',
      dropoff: 'FAST NUCES Main Campus',
    },
    schedule: {
      date: '2025-05-21',
      time: '8:00 am',
      recurring: ['Friday'],
    },
    seats: {
      total: 2,
      available: 2,
    },
    preferences: [],
  },
  {
    id: '5',
    driver: {
      name: 'Usman Tariq',
      gender: 'male',
      rating: 2.5,
      department: 'Civil Engineering',
    },
    route: {
      pickup: 'Gulistan-e-Johar',
      dropoff: 'FAST NUCES Main Campus',
    },
    schedule: {
      date: '2025-04-22',
      time: '8:30 am',
      recurring: ['Monday', 'Wednesday'],
    },
    seats: {
      total: 3,
      available: 1,
    },
    preferences: ['Music lovers welcome'],
  },
  {
    id: '6',
    driver: {
      name: 'Ayesha Tariq',
      gender: 'female',
      rating: 4.4,
      department: 'Mathematics',
    },
    route: {
      pickup: 'FAST NUCES Main Campus',
      dropoff: 'Clifton',
    },
    schedule: {
      date: '2025-04-22',
      time: '5:00 pm',
      recurring: ['Monday', 'Thursday'],
    },
    seats: {
      total: 3,
      available: 3,
    },
    preferences: ['No smoking', 'Female riders only'],
  },
  {
    id: '7',
    driver: {
      name: 'Faraz Siddiqui',
      gender: 'male',
      rating: 3.9,
      department: 'Computer Science',
    },
    route: {
      pickup: 'Gulshan-e-Iqbal Block 5',
      dropoff: 'FAST NUCES Main Campus',
    },
    schedule: {
      date: '2025-04-23',
      time: '8:00 am',
      recurring: ['Tuesday', 'Thursday'],
    },
    seats: {
      total: 4,
      available: 2,
    },
    preferences: [],
  },
  {
    id: '8',
    driver: {
      name: 'Hania Qureshi',
      gender: 'female',
      rating: 4.6,
      department: 'Architecture',
    },
    route: {
      pickup: 'FAST NUCES Main Campus',
      dropoff: 'Bahadurabad',
    },
    schedule: {
      date: '2025-04-21',
      time: '4:30 pm',
      recurring: ['Wednesday'],
    },
    seats: {
      total: 2,
      available: 2,
    },
    preferences: ['No smoking'],
  }
];

// Get all carpools
exports.getAllCarpools = (req, res) => {
  try {
    res.status(200).json(carpools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single carpool
exports.getCarpoolById = (req, res) => {
  try {
    const carpool = carpools.find(c => c.id === req.params.id);
    if (!carpool) {
      return res.status(404).json({ message: 'Carpool not found' });
    }
    res.status(200).json(carpool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new carpool
exports.createCarpool = (req, res) => {
  try {
    const newCarpool = {
      id: Date.now().toString(),
      ...req.body
    };
    carpools.push(newCarpool);
    res.status(201).json(newCarpool);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a carpool
exports.updateCarpool = (req, res) => {
  try {
    const index = carpools.findIndex(c => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Carpool not found' });
    }
    carpools[index] = { ...carpools[index], ...req.body };
    res.status(200).json(carpools[index]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a carpool
exports.deleteCarpool = (req, res) => {
  try {
    const index = carpools.findIndex(c => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Carpool not found' });
    }
    const deletedCarpool = carpools[index];
    carpools = carpools.filter(c => c.id !== req.params.id);
    res.status(200).json(deletedCarpool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search carpools with filters
exports.searchCarpools = (req, res) => {
  try {
    const { pickup, dropoff, date, time, minSeats, filters } = req.body;

    let filteredCarpools = [...carpools];

    // Filter by pickup location
    if (pickup) {
      filteredCarpools = filteredCarpools.filter(c =>
        c.route.pickup.toLowerCase().includes(pickup.toLowerCase())
      );
    }

    // Filter by dropoff location
    if (dropoff) {
      filteredCarpools = filteredCarpools.filter(c =>
        c.route.dropoff.toLowerCase().trim().includes(dropoff.toLowerCase().trim())
      );
    }

    // Filter by date
    if (date) {
      filteredCarpools = filteredCarpools.filter(c =>
        c.schedule.date === date
      );
    }

    // Helper to convert "4:00 pm" to minutes since midnight
    function convert12HourToMinutes(time12h) {
      const [time, modifier] = time12h.toLowerCase().split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'pm' && hours !== 12) hours += 12;
      if (modifier === 'am' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }

    // Helper to convert "HH:mm" (like 08:30) to minutes since midnight
    function convert24HourToMinutes(time24h) {
      const [hours, minutes] = time24h.split(':').map(Number);
      return hours * 60 + minutes;
    }

    // Filter by time (within ±30 minutes range)
    if (time) {
      const targetMinutes = convert24HourToMinutes(time);
      filteredCarpools = filteredCarpools.filter(c => {
        const carpoolMinutes = convert12HourToMinutes(c.schedule.time);
        return Math.abs(carpoolMinutes - targetMinutes) <= 30;
      });
    }

    // Filter by minimum seats
    if (minSeats) {
      filteredCarpools = filteredCarpools.filter(c =>
        c.seats.available >= minSeats
      );
    }

    // Apply additional filters
    if (filters && filters.length > 0) {
      filteredCarpools = filteredCarpools.filter(c => {
        if (filters.includes('Female drivers only') && c.driver.gender !== 'female') {
          return false;
        }

        if (filters.includes('Male drivers only') && c.driver.gender !== 'male') {
          return false;
        }

        if (filters.includes('No smoking') &&
          (!c.preferences || !c.preferences.includes('No smoking'))) {
          return false;
        }

        return true;
      });
    }

    res.status(200).json(filteredCarpools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};