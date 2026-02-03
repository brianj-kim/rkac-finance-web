'use client';


import { useMemo, useState } from "react";
import { Control, useWatch } from "react-hook-form";

import { cn } from "@/src/lib/utils";
import CalendarIcon from "@heroicons/react/24/outline/CalendarIcon";
import { BatchFormValues, CategoryDTO } from "../../lib/definitions";
import { formatCurrency } from "../../lib/utils";
import { Card, CardContent } from "@/src/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";


type Props = {
  control: Control<BatchFormValues>;
  incomeTypes: CategoryDTO[];
  incomeMethods: CategoryDTO[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
};

// Showing Statiscis - grand total, group by type, and group by method
const safeCents = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.trunc(n);
}

type TotRow = { id: number; label: string; total: number }; 
const TotalList = ({ rows }: { rows: TotRow[]}) => {
  if (rows.length === 0) {
    return <div className='text-sm font-semibold tabular-nums'>$0.00</div>;
  }

  const top = rows.slice(0, 3);
  const rest = rows.slice(3);
  const other = rest.reduce((sum, r) => sum + r.total, 0);

  return (
    <div className='space-y-1'>
      {top.map((r) => (
        <div key={r.id} className='flex items-center justify-between gap-1 text-sm'>
          <div className='text-[11px] font-semibold text-muted-foreground'>{r.label}</div>
          <div className='text-sm font-semibold tabular-nums'>{formatCurrency(r.total)}</div>
        </div>
      ))}
      {other > 0 && (
        <div className='flex itemss-center justify-between gap-1 text-lg text-muted-foreground'>
          <div className='text-[11px] font-semibold text-muted-foreground'>Other</div>
          <div className='text-sm font-semibold tabular-nums'>{formatCurrency(other)}</div>
        </div>
      )}
    </div>
  );
}

const BatchTotalSummary = ({ control, incomeTypes, incomeMethods, selectedDate, onDateChange }: Props) => {
  const entries = useWatch({ control, name: "entries" }) ?? [];

  const [open, setOpen] = useState<boolean>(false);

  const typeNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const t of incomeTypes) m.set(t.id, t.name);
    return m;
   }, [incomeTypes]);

   const methodNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const t of incomeMethods) m.set(t.id, t.name);
    return m;
   },[incomeMethods]);

   const { grandTotal, byType, byMethod } = useMemo(() => {
    let grand = 0;
    
    const typeTotals = new Map<number, number>();
    const methodTotals = new Map<number, number>();

    for (const e of entries) {
      const name = (e?.name ?? "").toString().trim();
      const amount = safeCents(e?.amount);

      if (!name || amount <= 0) continue;

      grand += amount;

      const typeId = Number(e?.typeId ?? 0);
      if (Number.isFinite(typeId) && typeId > 0) {
        typeTotals.set(typeId, (typeTotals.get(typeId) ?? 0) + amount);
      }

      const methodId = Number(e?.methodId ?? 0);
      if(Number.isFinite(methodId) && methodId > 0) {
        methodTotals.set(methodId, (methodTotals.get(methodId) ?? 0) + amount);
      }
    }

    const toSortedArray = (m: Map<number, number>, nameMap: Map<number, string>) => 
      Array.from(m.entries())
        .map(([id, total]) => ({
          id,
          label: nameMap.get(id) ?? `Unknown (${id})`,
          total
        }))
        .sort((a, b) => b.total - a.total);

        return {
          grandTotal: grand,
          byType: toSortedArray(typeTotals, typeNameById),
          byMethod: toSortedArray(methodTotals, methodNameById)
        };
   }, [entries, typeNameById, methodNameById]);

   return (
    
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full'>
      
        {/* Date Picker */}
        <Card className='bg-white'>
          <CardContent className='flex flex-col gap-2 p-3 h-full items-start'>
            <div className='text-sm font-medium text-muted-foreground py-1'>Date Picker</div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      onDateChange(date);
                      setOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      
        <Card className='bg-white'>
          <CardContent className='p-3'>
            <div className='text-sm font-medium text-muted-foreground py-1'>Batch total</div>
            <div className='text-sm font-semibold tabular-nums'>{formatCurrency(grandTotal)}</div>
            <div className='text-[11px] text-muted-foreground'>Valid rows only</div>
          </CardContent>
        </Card>

        <Card className='bg-white'>       
          <CardContent className='p-3'>
            <div className='text-sm font-medium text-muted-foreground py-1'>By type</div>
            <TotalList rows={byType} />
          </CardContent>
        </Card>

        <Card className='bg-white'>
          <CardContent className='p-3'>
            <div className='text-sm font-medium text-muted-foreground py-1'>By method</div>
            <TotalList rows={byMethod} />
          </CardContent>
        </Card>

    </div>
  );
}



export default BatchTotalSummary;