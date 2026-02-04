import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { STYLES } from './styles';
import { DoorOpen, DoorClosed, Presentation, Clock, Instagram } from 'lucide-react';
import type { AvailabilityData, GridSlot } from './types';
import { formatTime } from './utils';

// Components
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { RoomCard } from './components/RoomCard';
import { QRCodeCard } from './components/QRCodeCard';
import { HelpWidget } from './components/HelpWidget';
import { LoadingScreen, ErrorScreen, AfterHoursScreen } from './components/StatusScreens';

function App() {
  const [data, setData] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isAfterHours, setIsAfterHours] = useState(false);
  const [operationHours, setOperationHours] = useState('');
  
  // Navigation State
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number>(-1);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: responseData, error: responseError } = await supabase.functions.invoke('slots-available-', {
        body: { date: new Date().toISOString().split('T')[0] },
      });

      if (responseError) throw responseError;
      
      setData(responseData);
      setLastUpdated(new Date());

      // On initial load, find the current time slot
      if (responseData?.grid && responseData.grid.length > 0) {
        const now = formatTime(new Date());
        let index = responseData.grid.findIndex((slot: GridSlot) => now >= slot.start && now < slot.end);

        const firstStart = responseData.grid[0].start;
        const lastEnd = responseData.grid[responseData.grid.length - 1].end;
        setOperationHours(`${firstStart} - ${lastEnd}`);

        if (now < firstStart || now >= lastEnd) {
           setIsAfterHours(true);
        } else {
           setIsAfterHours(false);
           // If we are in operation hours but not in a specific slot (gap), find next slot
           if (index === -1) {
             const nextSlotIndex = responseData.grid.findIndex((slot: GridSlot) => slot.start > now);
             index = nextSlotIndex !== -1 ? nextSlotIndex : 0;
           }
           setCurrentSlotIndex(index);
        }
      }

    } catch (err: any) {
      console.error('Error fetching availability:', err);
      setError(err.message || 'Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Keyboard Polling Toggle (Ctrl + L)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Control + L (case insensitive)
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsLiveMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live Mode Polling (Every 15s)
  useEffect(() => {
    if (!isLiveMode) return;
    
    // Refresh immediately on toggle
    fetchData();

    const interval = setInterval(() => {
       fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [isLiveMode]);

  // Handlers
  const handleNext = () => {
    if (data && currentSlotIndex < data.grid.length - 1) {
      setCurrentSlotIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlotIndex > 0) {
      setCurrentSlotIndex(prev => prev - 1);
    }
  };

  // Derived state for the currently displayed slot
  const currentSlot = data?.grid[currentSlotIndex];
  
  // Determine if nav buttons should be disabled
  const isPrevDisabled = currentSlotIndex <= 0;
  const isNextDisabled = !data || currentSlotIndex >= data.grid.length - 1;

  if (loading && !data) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={fetchData} />;
  }

  if (isAfterHours) {
    return <AfterHoursScreen hours={operationHours} />;
  }

  return (
    <div className={STYLES.pageContainer}>
      
      {/* A. Header Section */}
      <Header 
        isLiveMode={isLiveMode}
        currentSlot={currentSlot}
        onPrev={handlePrev}
        onNext={handleNext}
        isPrevDisabled={isPrevDisabled}
        isNextDisabled={isNextDisabled}
        lastUpdated={lastUpdated}
        onRefresh={fetchData}
        loading={loading}
      />

      <main className={STYLES.mainContent}>
        
        {/* B. Mobile Navigation Bar (The Time Box) - Hidden on Desktop */}
        <MobileNav 
          currentSlot={currentSlot}
          onPrev={handlePrev}
          onNext={handleNext}
          isPrevDisabled={isPrevDisabled}
          isNextDisabled={isNextDisabled}
        />

        {/* C. The Cards - Mobile Stack / Desktop Grid */}
        {currentSlot && data ? (
          <div className={STYLES.layout.gridContainer}>
            
            {/* 1. Open Rooms (Top Left) */}
            <RoomCard 
              title="Open rooms"
              subtitle="Min 2 People"
              icon={<DoorOpen className="w-5 h-5 lg:w-12 lg:h-12" />}
              counts={currentSlot.availability['open room']}
              totalCapacity={data.totals['open room']}
              className="lg:h-full"
            />

            {/* 2. Closed Rooms (Top Right) */}
            <RoomCard 
              title="Closed Rooms"
              subtitle="Min 4 Person"
              icon={<DoorClosed className="w-5 h-5 lg:w-12 lg:h-12" />}
              counts={currentSlot.availability['closed room']}
              totalCapacity={data.totals['closed room']}
              className="lg:h-full"
            />

            {/* 3. Boardrooms (Bottom Left) */}
            <RoomCard 
              title="Boardrooms"
              subtitle="Min 6 Person"
              icon={<Presentation className="w-5 h-5 lg:w-12 lg:h-12" />}
              counts={currentSlot.availability['boardroom']}
              totalCapacity={data.totals['boardroom']}
              className="lg:h-full"
            />

             {/* 4. QR Code (Bottom Right for Desktop) */}
             <QRCodeCard />

          </div>
        ) : (
          <div className="py-20 text-center text-slate-400">
             <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
             <p>No availability data found.</p>
          </div>
        )}

      </main>

      {/* Floating Help Button & Modal */}
      <HelpWidget />
      
      {/* Footer Info Link - Hidden in Live/TV Mode */}
      <div className="w-full flex justify-center py-6 pb-24 lg:hidden z-10">
         <a 
           href={import.meta.env.VITE_INSTAGRAM_URL}
           target="_blank"
           rel="noreferrer"
           className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-slate-200 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all hover:scale-105 active:scale-95"
         >
           <Instagram className="w-3.5 h-3.5" />
           <span>Find latest operational info on Instagram</span>
         </a>
       </div>
    </div>
  );
}

export default App;