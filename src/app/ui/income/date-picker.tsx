"use client";

import * as React from "react";
import type { ChangeEvent, ChangeEventHandler } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";



type Props = {
  selectedYear: number;
  selectedMonth: number; // 0 or 1-12
  selectedDay: number;   // 0 or 1-31
};

const toDateOrUndefined = (y: number, m: number, d: number) => {
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
};

const makeFakeSelectEvent = (
  value: string | number,
  onChange: ChangeEventHandler<HTMLSelectElement>
) => {
  const fake = {
    target: { value: String(value) },
  } as ChangeEvent<HTMLSelectElement>;
  onChange(fake);
};

export default function IncomeDatePicker({
  selectedYear,
  selectedMonth,
  selectedDay,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(
    () => toDateOrUndefined(selectedYear, selectedMonth, selectedDay),
    [selectedYear, selectedMonth, selectedDay]
  );

  const [month, setMonth] = React.useState<Date>(
    selectedDate ?? new Date(selectedYear, 0, 1)
  );

  // sync month view when params/year change
  const selectedTime = selectedDate?.getTime() ?? 0;
  React.useEffect(() => {
    setMonth(selectedDate ?? new Date(selectedYear, 0, 1));
  }, [selectedYear, selectedTime]);

  const pushParams = (params: URLSearchParams) => {
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const setDayFilter = (date: Date | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(selectedYear));

    if (!date) {
      params.delete("month");
      params.delete("day");
      pushParams(params);
      setOpen(false);
      return;
    }

    params.set("month", String(date.getMonth() + 1));
    params.set("day", String(date.getDate()));
    pushParams(params);
    setOpen(false);
  };

  const buttonLabel = selectedDate ? format(selectedDate, "MM-dd") : "Pick a date";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{buttonLabel}</Button>
      </DialogTrigger>

      <DialogContent className="w-auto">
        <DialogHeader>
          <DialogTitle>Select Date</DialogTitle>
        </DialogHeader>

        

        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setDayFilter}
          month={month}
          onMonthChange={setMonth}
          captionLayout="dropdown-months"
          className="rounded-md border"
        />

        <div className="flex items-center justify-end">
          
          <Button variant="ghost" onClick={() => setDayFilter(undefined)}>
            Clear date
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
