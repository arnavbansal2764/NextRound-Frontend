'use client';

import { Calendar as ReactCalendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface CalendarProps {
    value: Date | undefined;
    onChange: (date: Date) => void;
    disabledDates?: Date[];
}

const Calendar: React.FC<CalendarProps> = ({
    value,
    onChange,
    disabledDates
}) => {
    return (
        <ReactCalendar
            date={value}
            onChange={(date) => onChange(date as Date)}
            maxDate={new Date()} // Disable all future dates
            disabledDates={disabledDates}
            color="#262626"
        />
    );
};

export default Calendar;
