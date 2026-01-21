'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';

type Props = {
  selectedYear: number;
  years: number[];
};

const YearSelect = ({ selectedYear, years }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (value: string) => {
    const y = Number(value);
    const params = new URLSearchParams(searchParams.toString());

    params.set('year', String(y));
    params.delete('month');
    params.delete('day');
    params.set('page', '1');

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={String(selectedYear)} onValueChange={onChange}>
      <SelectTrigger className='w=[140px]'>
        <SelectValue placeholder='Year' />
      </SelectTrigger>
      <SelectContent>
        {years.map((y) => (
          <SelectItem key={y} value={String(y)}>
            {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default YearSelect;