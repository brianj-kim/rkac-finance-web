import { lusitana } from "@/app/ui/fonts";
import CardWrapper from "@/app/ui/income/cards";
import LatestIncome from "@/app/ui/income/latest-income";
import YearSelect from "@/app/ui/income/year-select";

type IncomeDashProps = {
    searchParams: Promise<{
        year?: string;
    }>
}

const IncomeDash = async ({ searchParams }: IncomeDashProps) => {
    const params = await searchParams;
    const currentYear = new Date().getFullYear();

    const selectedYear = params?.year ? Number(params.year) : currentYear;

    const years = Array.from({ length: 5}, (_, idx) => currentYear - idx);
    
    return (
        <main>
            <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>Income Dashboard</h1>

            <div className='mb-4 flex items-center gap-2'>
                <label htmlFor='year' className='text-sm font-medium'>
                    Year:
                </label>
                <YearSelect selectedYear={selectedYear} years={years} />
            </div>
            
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                <CardWrapper selectedYear={selectedYear}/>
            </div>
            <div className='mt-6 '>
                <LatestIncome selectedYear={selectedYear} />    
            </div>
        </main>

    )
}

export default IncomeDash;