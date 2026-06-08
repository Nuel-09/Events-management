import React, { useEffect, useState } from 'react';
import { format, parse, isValid } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface DateTimePickerProps {
  value: string;
  onChange: (isoValue: string) => void;
  label?: string;
  id?: string;
}

function toLocalDatetimeValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

function parseInput(value: string): Date | null {
  if (!value) return null;
  const parsed = parse(value, "yyyy-MM-dd'T'HH:mm", new Date());
  return isValid(parsed) ? parsed : null;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label = 'Date & Time',
  id = 'datetime-picker',
}) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => parseInput(value) || new Date());
  const [timeValue, setTimeValue] = useState(() => format(parseInput(value) || new Date(), 'HH:mm'));

  useEffect(() => {
    const parsed = parseInput(value);
    if (parsed) {
      setSelectedDate(parsed);
      setTimeValue(format(parsed, 'HH:mm'));
    }
  }, [value]);

  const emitChange = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours || 0, minutes || 0, 0, 0);
    onChange(toLocalDatetimeValue(combined));
  };

  const handleDateSelect = (day: Date) => {
    setSelectedDate(day);
    emitChange(day, timeValue);
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);
    emitChange(selectedDate, time);
  };

  const displayValue = (() => {
    const parsed = parseInput(value);
    return parsed ? format(parsed, 'dd/MM/yyyy HH:mm') : '';
  })();

  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const startDay = monthStart.getDay();
  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const days: (Date | null)[] = Array(startDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), d));
  }

  const shiftMonth = (delta: number) => {
    const next = new Date(selectedDate);
    next.setMonth(next.getMonth() + delta);
    setSelectedDate(next);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          readOnly
          value={displayValue}
          placeholder="Select date and time"
          onClick={() => setOpen(true)}
          className="bg-background border-border text-foreground flex-1 cursor-pointer"
        />
        <Button
          type="button"
          variant="outline"
          className="border-border shrink-0"
          aria-label="Open date and time picker"
          onClick={() => setOpen((prev) => !prev)}
        >
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </div>

      {open && (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <Button type="button" variant="ghost" size="sm" onClick={() => shiftMonth(-1)}>
              ‹
            </Button>
            <span className="text-sm font-semibold text-foreground">
              {format(selectedDate, 'MMMM yyyy')}
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={() => shiftMonth(1)}>
              ›
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) =>
              day ? (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`h-8 w-8 rounded-md text-sm ${
                    format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  {day.getDate()}
                </button>
              ) : (
                <span key={i} />
              ),
            )}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
};
