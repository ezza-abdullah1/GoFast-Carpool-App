import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CarpoolPost from './Components/FindCarpool/CarpoolPost'
import CarpoolPage from './Components/FindCarpool/CarpoolPage'

function App() {
  const [count, setCount] = useState(0)
  const carpools = [
    {
      id: '1',
      driver: {
        name: 'Ahmed Khan',
        rating: 4.8,
        department: 'Computer Science',
      },
      route: {
        pickup: 'FAST NUCES Main Campus',
        dropoff: 'Gulistan-e-Johar',
      },
      schedule: {
        date: 'Tomorrow',
        time: '4:30 PM',
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
        name: 'Bilal Ahmed',
        rating: 4.7,
        department: 'Business Administration',
      },
      route: {
        pickup: 'DHA Phase 6',
        dropoff: 'FAST NUCES Main Campus',
      },
      schedule: {
        date: 'Friday',
        time: '9:00 AM',
        recurring: ['Friday'],
      },
      seats: {
        total: 4,
        available: 3,
      },
    },
    {
      id: '4',
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
        date: 'Tomorrow',
        time: '4:30 PM',
        recurring: ['Monday', 'Wednesday', 'Friday'],
      },
      seats: {
        total: 3,
        available: 2,
      },
      preferences: ['Female riders only', 'No smoking'],
    },
    {
      id: '5',
      driver: {
        name: 'Usman Ali',
        rating: 4.5,
        department: 'Software Engineering',
      },
      route: {
        pickup: 'Clifton',
        dropoff: 'FAST NUCES Main Campus',
      },
      schedule: {
        date: 'Tomorrow',
        time: '8:00 AM',
        recurring: ['Monday', 'Wednesday', 'Friday'],
      },
      seats: {
        total: 4,
        available: 3,
      },
    },
    {
      id: '6',
      driver: {
        name: 'Farah Khan',
        rating: 4.7,
        department: 'Electrical Engineering',
      },
      route: {
        pickup: 'FAST NUCES Main Campus',
        dropoff: 'Defense Phase 2',
      },
      schedule: {
        date: 'Tomorrow',
        time: '5:00 PM',
        recurring: ['Tuesday', 'Thursday'],
      },
      seats: {
        total: 3,
        available: 1,
      },
      preferences: ['Music lovers welcome'],
    }
  ];
  return (
    <>
      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
      {/* {carpools.map((carpool) => (
                  <CarpoolPost key={carpool.id} {...carpool} />
                ))} */}
                {/* <div className="bg-red-500 text-white p-4">
      If this text has a red background, Tailwind is working!
    </div> */}
    <CarpoolPage/>
    </>
  )
}

export default App
