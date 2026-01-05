import { useState, useEffect } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Flame, Trophy } from 'lucide-react';
import { attendance } from '../services/api';

const CalendarStreak = ({ totalXp }: { totalXp?: number }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [stats, setStats] = useState<{ date: string; count: number }[]>([]);
    const [streak, setStreak] = useState(0);

    // Initial fetch
    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await attendance.getStats();
            // Ensure dates are compared correctly as YYYY-MM-DD
            const cleanStats = res.data.map((d: any) => ({
                date: d.date.split('T')[0],
                count: d.count
            }));
            setStats(cleanStats);
            calculateStreak(cleanStats);
        } catch (error) {
            console.error('Failed to fetch attendance stats', error);
        }
    };

    const calculateStreak = (data: { date: string; count: number }[]) => {
        // Simple streak logic
        let currentStreak = 0;
        const sortedDates = [...data]
            .filter(d => d.count > 0)
            .map(d => d.date)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (sortedDates.includes(today)) {
            currentStreak++;
            let checkDate = new Date(Date.now() - 86400000);
            while (sortedDates.includes(checkDate.toISOString().split('T')[0])) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        } else if (sortedDates.includes(yesterday)) {
            currentStreak++;
            let checkDate = new Date(Date.now() - 86400000 * 2);
            while (sortedDates.includes(checkDate.toISOString().split('T')[0])) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }
        setStreak(currentStreak);
    };

    // Calendar Grid Logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    // Styling helpers
    const getDayClass = (day: Date) => {
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isTodayDate = isToday(day);
        const dateStr = format(day, 'yyyy-MM-dd');
        const isActive = stats.find(s => s.date === dateStr && s.count > 0);

        let baseClass = "h-8 w-8 rounded-full flex items-center justify-center text-sm relative group transition-all duration-200 cursor-pointer ";

        if (!isCurrentMonth) {
            return baseClass + "text-slate-600";
        }

        if (isTodayDate) {
            // Match the orange circle from the image
            return baseClass + "bg-[#FF8A65] text-slate-900 font-bold shadow-lg shadow-orange-500/20";
        }

        if (isActive) {
            // Active streak days styling (Subtle green dot or similar)
            return baseClass + "text-white font-medium hover:bg-white/10";
        }

        return baseClass + "text-slate-300 hover:bg-white/5";
    };

    return (
        <div className="bg-[#1E293B] border border-slate-700/50 p-6 rounded-3xl shadow-2xl max-w-sm">
            {/* Header: Month Year + Arrows */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold text-lg tracking-wide">
                    {format(currentDate, 'MMMM, yyyy')}
                </h3>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-1 hover:text-white text-slate-400 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={nextMonth} className="p-1 hover:text-white text-slate-400 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-4">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-4 justify-items-center">
                {calendarDays.map((day) => {
                    // Check for active streak to render small dot indicator
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isActive = stats.find(s => s.date === dateStr && s.count > 0);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isTodayDate = isToday(day);

                    return (
                        <div key={day.toString()} className={getDayClass(day)}>
                            {format(day, 'd')}
                            {/* Dot indicator for active days that are NOT today */}
                            {isActive && !isTodayDate && isCurrentMonth && (
                                <div className="absolute -bottom-1 w-1 h-1 bg-emerald-500 rounded-full" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Stats Footer (Optional, keeping it subtle if user wants just calendar) */}
            <div className="mt-8 pt-6 border-t border-slate-700/50">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Flame className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                        </div>
                        <div>
                            <p className="text-emerald-500 font-bold text-sm">Active Streak</p>
                            <p className="text-white font-bold">{streak} days</p>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-slate-700/50"></div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FF8A65]/10 flex items-center justify-center border border-[#FF8A65]/20">
                            <Trophy className="w-5 h-5 text-[#FF8A65]" />
                        </div>
                        <div>
                            <p className="text-[#FF8A65] font-bold text-sm">Total XP</p>
                            <p className="text-white font-bold">{totalXp || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarStreak;
