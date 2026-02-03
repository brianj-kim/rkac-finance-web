import Link from 'next/link';
import { formatCurrency } from '@/app/lib/utils';
import type { ReceiptMemberSummary } from '@/app/lib/definitions';

const ReceiptMemberGrid = (props: {
  members: ReceiptMemberSummary[];
  taxYear: number;
}) => {
  const { members, taxYear } = props;

  return (
    <div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-3'>
      {members.map((m) => (
        <Link 
          key={m.memberId}
          href={`/income/receipt/${m.memberId}?year=${taxYear}`}
          className='rounded-md border border-gray-200 p-4 hover:bg-grey-50'
        >
          <div className='flex items-center justify-between'>
            <div className='font-medium'>{m.name}</div>
            <div className='text-base font-medium'>{formatCurrency(m.totalCents)}</div>
          </div>

          <div className='mt-1 text-sm text-gray-500'>
            Donations: <span className='font-medium text-base text-gray-700'>{m.donationCount}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default ReceiptMemberGrid;