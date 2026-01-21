'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';

type Props = {
  initialQuery?: string;
}

const MemberSearch = ({ initialQuery = '' }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = React.useState(initialQuery);

  React.useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  const apply = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = q.trim();

    params.set('page', '1');

    if (trimmed) params.set('query', trimmed);
    else params.delete('query');

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form
      className='flex items-center gap-2'
      onSubmit={(e) => {
        e.preventDefault();
        apply(value);        
      }}
    >
      <Input 
        className='w-[260px]'
        placeholder='Search name, email, address...'
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
          apply('')
        }}
      >
        Clear
      </Button>
    </form>
  );
}


export default MemberSearch;