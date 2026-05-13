import * as React from 'react';
import { CalendarIcon } from 'lucide-react';

import { cn } from '../../lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface DatePickerProps {
  date?: Date;
  label?: string;
  placeholder?: string;
  className?: string;
  onSelect?: (date: Date | undefined) => void;
}

function formatDate(date: Date | undefined): string {
  if (!date) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function DatePicker({
  date,
  label = 'Pick a date',
  placeholder = 'Select date',
  className,
  onSelect,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          data-slot="date-picker-trigger"
          variant="outline"
          className={cn(
            'w-[240px] justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon />
          <span>{date ? formatDate(date) : placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent data-slot="date-picker-content" className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={nextDate => {
            onSelect?.(nextDate);
            setOpen(false);
          }}
          aria-label={label}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
