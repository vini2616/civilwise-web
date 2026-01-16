import React, { useState } from 'react';

const CalendarWidget = ({ onClose }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
        setCurrentDate(new Date(newDate));
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for days before start of month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday =
                i === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

            days.push(
                <div key={i} className={`calendar-day ${isToday ? 'today' : ''}`}>
                    {i}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content calendar-popup">
                <div className="popup-header">
                    <h3>Calendar</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                <div className="calendar-controls">
                    <button onClick={() => changeMonth(-1)} className="btn-icon">←</button>
                    <h4>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                    <button onClick={() => changeMonth(1)} className="btn-icon">→</button>
                </div>
                <div className="calendar-grid">
                    <div className="day-name">Sun</div>
                    <div className="day-name">Mon</div>
                    <div className="day-name">Tue</div>
                    <div className="day-name">Wed</div>
                    <div className="day-name">Thu</div>
                    <div className="day-name">Fri</div>
                    <div className="day-name">Sat</div>
                    {renderCalendarDays()}
                </div>
            </div>
        </div>
    );
};

export default CalendarWidget;
