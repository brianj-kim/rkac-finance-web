import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import { toInt, formatCurrency } from '@/app/lib/utils';

import YearSelect from '@/app/ui/income/year-select';
import SearchBox from '@/app/ui/income/search-box';
import Pagination from '@/app/ui/income/pagination';

import { fetchReceipts } from '@/app/lib/receipt-manage-data';
import DeleteReceiptButton from '@/app/ui/receipt/delete-receipt-button';
//Bulk Generation of Receipts 
import GenerateYearReceiptsButton from '@/app/ui/receipt/generate-year-receipts-button';

const ManageReceiptsPage = async (props: {
  searchParams?: Promise<{ query?: string; page?: string; year?: string }>;
}) => {
  const searchParams = await props.searchParams;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, idx) => currentYear - idx);

  const selectedYear = toInt(searchParams?.year) ?? currentYear - 1;
  const query = (searchParams?.query ?? '').trim();
  const currentPage = Number(searchParams?.page) || 1;

  const { data, pagination } = await fetchReceipts({
    query,
    page: currentPage,
    taxYear: selectedYear,
  });

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>Manage Receipts</h1>

      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2'>
          <YearSelect selectedYear={selectedYear} years={years} />
          <div className='w-full sm:w-auto'>
            <SearchBox selectedYear={selectedYear} initialQuery={query}/>
          </div>
        </div>

        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end'>
          <GenerateYearReceiptsButton taxYear={selectedYear} />
          <Link
            href='/income/receipt'
            className='inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50'
          >
            Back
          </Link>
        </div>
      </div>

      <div className='mt-4 rounded-md border border-gray-200'>
        <div className='grid grid-cols-12 gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700'>
          <div className='col-span-2'>Issued</div>
          <div className='col-span-2'>Serial</div>
          <div className='col-span-4'>Donor</div>
          <div className='col-span-2 text-right'>Amount</div>
          <div className='col-span-1 text-right'>PDF</div>
          <div className='col-span-1 text-right'>Del</div>
        </div>

        {data.map((r) => (
          <div
            key={r.id}
            className='grid grid-cols-12 gap-2 px-3 py-2 border-b last:border-b-0 border-gray-100 text-sm items-center'
          >
            <div className='col-span-2'>{r.issueDateISO}</div>
            <div className='col-span-2'>
              {r.taxYear}-{String(r.serialNumber).padStart(5, '0')}
            </div>
            <div className='col-span-4 truncate'>{r.donorName}</div>
            <div className='col-span-2 text-right font-medium'>{formatCurrency(r.totalCents)}</div>
            <div className='col-span-1 text-right'>
              <a
                href={r.pdfUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 inline-flex justify-center'
              >
                Open
              </a>
            </div>
            <div className='col-span-1 text-right'>
              <DeleteReceiptButton receiptId={r.id} />
            </div>            
          </div>
        ))}

        {data.length === 0 && (
          <div className='p-4 text-sm text-gray-600'>No receipts found.</div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className='mt-5 flex w-full justify-center'>
          <Pagination totalPages={pagination.totalPages} />
        </div>
      )}
    </main>
  );
};

export default ManageReceiptsPage;