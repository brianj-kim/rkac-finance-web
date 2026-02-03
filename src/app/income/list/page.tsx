
import { RectangleStackIcon } from "@heroicons/react/24/outline";
import Link from "next/link"; 
import { fetchFilteredIncome, getIncomeMethods, getIncomeTypes } from "@/app/lib/data";
import { lusitana } from "@/app/ui/fonts";

import SearchBox from "@/app/ui/income/search-box";
import Pagination from "@/app/ui/income/pagination";
import Table from "@/app/ui/income/table";
import { toInt } from "@/app/lib/utils";
import DateFilters from "@/app/ui/income/date-filters";

const IncomeList = async (props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    year?: string;
    month?: string;
    day?: string;
  }>;
}) => {  
  const searchParams = await props.searchParams;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, idx) => currentYear - idx);

  const selectedYear = toInt(searchParams?.year) ?? currentYear;
  const selectedMonth = toInt(searchParams?.month) ?? 0;
  const selectedDay = toInt(searchParams?.day) ?? 0;

  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const [{ data, pagination }, incomeTypes, incomeMethods] = await Promise.all([
    fetchFilteredIncome(query, currentPage, selectedYear, selectedMonth, selectedDay),
    getIncomeTypes(),
    getIncomeMethods(),
  ]);

   const totalPages = pagination.totalPages;

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>Income List</h1>
      <div className='flex justify-between'>
        <div className='flex space-x-2'>      
          <DateFilters 
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            selectedDay={selectedDay}
            years={years}
          />  
          
          <SearchBox 
            selectedYear={selectedYear} 
            initialQuery={query} 
            clearKeys={['month', 'day', 'query', 'page']}
            placeholder='Search Member...'
          />
        </div>
        
        <div>
          <Link href='/income/list/create' className='flex items-center rounded-md bg-blue-500 px-4 py-2 font-medium text-sm text-white'>
            <RectangleStackIcon width={24} height={24}  className='pr-2' />
            Create Batch Income
          </Link>
        </div>

      </div>
      <Table 
        incomeList={data} 
        incomeTypes={incomeTypes}
        incomeMethods={incomeMethods}
      />
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </main>
  )
}

export default IncomeList;