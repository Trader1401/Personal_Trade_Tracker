import { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTrades } from "@/hooks/use-trades";
import { calculateTotalPnL } from "@/lib/calculations";

export default function TradingCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { trades } = useTrades();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const getTradeDataForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const dayTrades = trades.filter(trade => trade.tradeDate === dateString);
    const pnl = calculateTotalPnL(dayTrades);
    return { count: dayTrades.length, pnl };
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Trading Calendar</CardTitle>
          <Button variant="ghost" size="sm">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h3>
          <Button variant="ghost" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === month;
            const isToday = day.toDateString() === new Date().toDateString();
            const tradeData = getTradeDataForDate(day);
            
            return (
              <button
                key={index}
                className={`
                  text-center text-sm py-2 rounded transition-colors relative
                  ${isCurrentMonth 
                    ? 'hover:bg-gray-100 cursor-pointer' 
                    : 'text-gray-400 cursor-default'
                  }
                  ${isToday ? 'bg-primary text-white font-medium' : ''}
                `}
              >
                {day.getDate()}
                {tradeData.count > 0 && (
                  <div className={`
                    absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full
                    ${tradeData.pnl >= 0 ? 'bg-green-500' : 'bg-red-500'}
                  `} />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Calendar Legend */}
        <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Profit</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Loss</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
