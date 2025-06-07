
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TripList from '@/components/trips/TripList';
import Header from '@/components/Header';
import { Trip } from '@/types';
import { loadTrips, saveTrip } from '@/utils/supabaseStorage';
import { Button } from '@/components/ui/button';

const Trips = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      loadTrips(user.id).then(setTrips);
    }
  }, [user]);

  const handleAddTrip = async (newTrip: Omit<Trip, 'id' | 'dateCreated'>) => {
    if (!user) return;
    
    const savedTrip = await saveTrip(newTrip, user.id);
    if (savedTrip) {
      setTrips(prev => [...prev, savedTrip]);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (!isAuthenticated) {
    return null; // Will redirect due to useEffect
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <Header title="Your Trip Expenses" />
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>
      
      <TripList trips={trips} onAddTrip={handleAddTrip} />
    </div>
  );
};

export default Trips;
