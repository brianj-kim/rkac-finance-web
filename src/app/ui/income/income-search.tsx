'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';

type Props = {
  selectedYear: number;
  initialQuery: string;
};

const IncomeSearch = ({ selectedYear, initialQuery = '' }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = React.useState<string>(initialQuery);

  React.useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  const applySearch = (nextQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set('year', String(selectedYear));
    params.set('page', '1');

    const q = nextQuery.trim();
    if (q) {
      params.set('query', q);

      params.delete('month');
      params.delete('day');
    } else {
      params.delete('query');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form
      className='flex items-center gap-2'
      onSubmit={(e) => {
        e.preventDefault();
        applySearch(value);
      }}
    >
      <Input 
        className='w-[220px]'
        placeholder='Search member name...'
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button type='submit' variant='outline'>
        Search
      </Button>

      <Button 
        type='button'
        variant='ghost'
        onClick={() => {
          setValue('');
          applySearch('');
        }}
      >
        Clear
      </Button>
    </form>
  )
}

export default IncomeSearch;