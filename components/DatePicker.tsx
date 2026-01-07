import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const YEARS = Array.from({ length: 120 }, (_, i) => new Date().getFullYear() - i);

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = "Select Date" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isYearOpen, setIsYearOpen] = useState(false);

    // View state for the calendar navigation
    const [viewDate, setViewDate] = useState(new Date());

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Initialize viewDate from value if present
    useEffect(() => {
        if (value) {
            const [y, m, d] = value.split('-').map(Number);
            // Handle time zone issues by setting time to noon
            setViewDate(new Date(y, m - 1, d, 12, 0, 0));
        }
    }, [isOpen]); // Reset when opening/value changes logic could be improved but simple reset on open is okay-ish or just init

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleDateClick = (day: number) => {
        const year = viewDate.getFullYear();
        const month = String(viewDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        onChange(`${year}-${month}-${dayStr}`);
        setIsOpen(false);
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setViewDate(newDate);
    };

    const changeYear = (year: number) => {
        const newDate = new Date(viewDate);
        newDate.setFullYear(year);
        setViewDate(newDate);
    };

    // Calendar Grid Logic
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderCalendarGrid = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const blanks = Array.from({ length: firstDay }, (_, i) => <div key={`blank-${i}`} className="h-8 w-8" />);
        const days = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isSelected = value === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            return (
                <button
                    key={day}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    className={`
                        h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                        ${isSelected ? 'bg-orange-500 text-white shadow-md transform scale-105' : 'text-gray-700 hover:bg-orange-100'}
                        ${isToday && !isSelected ? 'border border-orange-200 text-orange-600' : ''}
                    `}
                >
                    {day}
                </button>
            );
        });

        return [...blanks, ...days];
    };

    return (
        <div className="relative" ref={wrapperRef}>
            {/* Input Trigger */}
            <div
                onClick={toggleOpen}
                className={`
                    w-full pl-10 pr-3 py-3 border rounded-xl flex items-center cursor-pointer transition-all duration-200
                    ${isOpen ? 'ring-2 ring-orange-500 border-transparent bg-white' : 'border-gray-200 hover:border-orange-300 bg-white'}
                `}
            >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <CalendarIcon size={18} className={isOpen ? "text-orange-500" : ""} />
                </div>
                <span className={value ? "text-gray-900" : "text-gray-400"}>
                    {value || placeholder}
                </span>
            </div>

            {/* Calendar Popover */}
            {isOpen && (
                <div className="absolute top-full mt-2 left-0 z-50 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 w-72 animate-fade-in-up origin-top-left">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-orange-600 transition-colors">
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex items-center space-x-1">
                            <span className="text-sm font-semibold text-gray-800">{MONTH_NAMES[viewDate.getMonth()]}</span>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsYearOpen(!isYearOpen)}
                                    className="flex items-center space-x-0.5 text-sm font-bold text-gray-900 hover:text-orange-600 transition-colors focus:outline-none"
                                >
                                    <span>{viewDate.getFullYear()}</span>
                                    <ChevronRight size={14} className={`transform transition-transform ${isYearOpen ? 'rotate-90' : 'rotate-0'}`} />
                                </button>

                                {isYearOpen && (
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-24 max-h-48 overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-100 touch-pan-y z-50 no-scrollbar">
                                        {YEARS.map(y => (
                                            <button
                                                key={y}
                                                type="button"
                                                onClick={() => {
                                                    changeYear(y);
                                                    setIsYearOpen(false);
                                                }}
                                                className={`w-full text-center py-2 text-sm font-medium hover:bg-orange-50 transition-colors ${viewDate.getFullYear() === y ? 'text-orange-600 bg-orange-50' : 'text-gray-700'}`}
                                            >
                                                {y}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-orange-600 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Weekday Labels */}
                    <div className="grid grid-cols-7 mb-2 text-center">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <span key={d} className="text-xs font-semibold text-gray-400 uppercase">{d}</span>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 place-items-center">
                        {renderCalendarGrid()}
                    </div>
                </div>
            )}
        </div>
    );
};
