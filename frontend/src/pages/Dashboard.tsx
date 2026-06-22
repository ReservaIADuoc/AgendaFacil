import { useState } from "react";
import { Link } from "react-router";
import { Calendar as CalendarIcon, Menu, Search, HelpCircle, Settings, ChevronLeft, ChevronRight, Plus, Users } from "lucide-react";
import { format, addDays, subDays, startOfWeek, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const PRIMARY = "#C0987A";

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Generate week days starting from Sunday
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  const hours = Array.from({ length: 23 }).map((_, i) => i + 1); // 1 to 23

  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const handlePrevWeek = () => setCurrentDate(subDays(currentDate, 7));
  const handleToday = () => setCurrentDate(new Date());

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden text-[#2C2A29]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top Navbar */}
      <header className="h-16 border-b border-gray-200 flex items-center px-4 justify-between shrink-0 bg-white">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: PRIMARY }}>
              <CalendarIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-[20px] font-medium text-[#2C2A29]" style={{ fontFamily: "'Fraunces', serif" }}>
              Agenda Fácil
            </span>
          </Link>
          
          <div className="flex items-center gap-4 ml-8">
            <button onClick={handleToday} className="px-4 py-2 border border-gray-300 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors">
              Hoy
            </button>
            <div className="flex items-center gap-1">
              <button onClick={handlePrevWeek} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={handleNextWeek} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <h2 className="text-xl font-normal capitalize">
              {format(currentDate, "MMMM 'de' yyyy", { locale: es })}
            </h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><Search className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><HelpCircle className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><Settings className="w-5 h-5" /></button>
          <div className="ml-2 border border-gray-300 rounded-md px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-gray-50">
            <span className="text-sm font-medium">Semana</span>
            <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-600"></div>
          </div>
          <div className="w-8 h-8 ml-4 rounded-full bg-[#A9B3A2] flex items-center justify-center text-white font-bold text-sm">
            VR
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 flex-shrink-0 flex flex-col p-4 overflow-y-auto bg-white border-r border-gray-100">
            <button className="flex items-center gap-3 bg-white border border-gray-300 shadow-sm rounded-full py-3 px-5 hover:shadow-md hover:bg-gray-50 transition-all w-max mb-6">
              <Plus className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-sm">Crear</span>
            </button>
            
            <div className="mb-6 flex justify-center transform scale-90 origin-top-left">
              <DayPicker 
                mode="single"
                selected={currentDate}
                onSelect={(d) => d && setCurrentDate(d)}
                locale={es}
                modifiersClassNames={{
                  selected: "bg-[#C0987A] text-white hover:bg-[#C0987A]",
                  today: "font-bold text-[#C0987A]"
                }}
                styles={{
                  day: { borderRadius: '50%', width: '36px', height: '36px', fontSize: '13px' },
                  head_cell: { fontSize: '11px', fontWeight: 'normal', color: '#666', textTransform: 'capitalize' }
                }}
              />
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md cursor-pointer text-sm">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="font-medium">Buscar a gente</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm font-medium text-gray-600 mb-2 px-2">
                <span>Páginas de reserva</span>
                <Plus className="w-4 h-4 cursor-pointer hover:text-gray-900" />
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md cursor-pointer text-sm">
                <CalendarIcon className="w-4 h-4 text-[#C0987A]" />
                <span className="truncate">30 min con Valentina</span>
              </div>
            </div>
          </aside>
        )}

        {/* Calendar Grid Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          
          {/* Days Header */}
          <div className="flex border-b border-gray-200">
            <div className="w-16 flex-shrink-0 flex items-end justify-center pb-2">
              <span className="text-[10px] text-gray-500">GMT-04</span>
            </div>
            <div className="flex-1 grid grid-cols-7">
              {weekDays.map((day, i) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div key={i} className="flex flex-col items-center py-3 border-l border-gray-100 relative">
                    <span className={`text-[11px] font-medium mb-1 uppercase ${isToday ? 'text-[#C0987A]' : 'text-gray-500'}`}>
                      {format(day, "E", { locale: es })}
                    </span>
                    <div className={`w-11 h-11 flex items-center justify-center rounded-full text-2xl ${isToday ? 'bg-[#C0987A] text-white' : 'text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors'}`}>
                      {format(day, "d")}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="w-3 flex-shrink-0 border-l border-gray-100"></div> {/* Scrollbar compensation */}
          </div>

          {/* All Day Events Area */}
          <div className="flex border-b border-gray-200 min-h-[36px]">
            <div className="w-16 flex-shrink-0 border-r border-gray-200"></div>
            <div className="flex-1 grid grid-cols-7">
              <div className="border-l border-gray-100 p-1">
                <div className="bg-[#A9B3A2] text-white text-[11px] px-2 py-1 rounded-md truncate cursor-pointer hover:opacity-90 font-medium">
                  Día Nacional de los Pueblos
                </div>
              </div>
              <div className="border-l border-gray-100"></div>
              <div className="border-l border-gray-100"></div>
              <div className="border-l border-gray-100"></div>
              <div className="border-l border-gray-100"></div>
              <div className="border-l border-gray-100"></div>
              <div className="border-l border-gray-100"></div>
            </div>
            <div className="w-3 border-l border-gray-100"></div>
          </div>

          {/* Time Grid Scrollable */}
          <div className="flex-1 overflow-y-auto flex relative scroll-smooth">
            {/* Time Labels */}
            <div className="w-16 flex-shrink-0 relative">
              {hours.map(hour => (
                <div key={hour} className="h-12 relative flex justify-end pr-2">
                  <span className="text-[10px] text-gray-500 relative -top-2">
                    {hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </span>
                </div>
              ))}
            </div>

            {/* Grid Area */}
            <div className="flex-1 grid grid-cols-7 relative border-l border-gray-200">
              
              {/* Background horizontal lines for hours */}
              <div className="absolute inset-0 pointer-events-none">
                 {hours.map(hour => (
                    <div key={hour} className="h-12 border-t border-gray-100 w-full"></div>
                 ))}
                 <div className="h-12 border-t border-gray-100 w-full"></div>
              </div>

              {/* Day Columns */}
              {Array.from({ length: 7 }).map((_, dayIndex) => (
                <div key={dayIndex} className="border-r border-gray-200 relative h-[1152px]"> {/* 24 hours * 48px */}
                  
                  {/* Event on Monday 10:00 AM (Index 1) */}
                  {dayIndex === 1 && (
                    <div className="absolute top-[480px] left-1 right-1 h-[48px] bg-[#C0987A] text-white rounded-md p-1.5 shadow-sm text-xs overflow-hidden hover:shadow-md cursor-pointer border border-[#b38a5e] transition-shadow">
                      <div className="font-semibold">Consulta - María García</div>
                      <div>10:00 - 11:00 AM</div>
                    </div>
                  )}

                  {/* Event on Monday 2:00 PM */}
                  {dayIndex === 1 && (
                    <div className="absolute top-[672px] left-1 right-1 h-[72px] bg-[#C0987A] text-white rounded-md p-1.5 shadow-sm text-xs overflow-hidden hover:shadow-md cursor-pointer border border-[#b38a5e] transition-shadow">
                      <div className="font-semibold">Terapia de pareja</div>
                      <div>2:00 - 3:30 PM</div>
                    </div>
                  )}

                  {/* Event on Wednesday 4:00 PM */}
                  {dayIndex === 3 && (
                    <div className="absolute top-[768px] left-1 right-1 h-[48px] bg-[#A9B3A2] text-white rounded-md p-1.5 shadow-sm text-xs overflow-hidden hover:shadow-md cursor-pointer border border-[#9ca794] transition-shadow">
                      <div className="font-semibold">Evaluación inicial</div>
                      <div>4:00 - 5:00 PM</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
