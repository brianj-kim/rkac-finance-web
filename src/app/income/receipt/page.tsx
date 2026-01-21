import { lusitana } from "../../ui/fonts";


const IncomeReceipt = () => {
  return (
    <main>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>Donation Receipt</h1>
      </div>
    </main>
  )
}

export default IncomeReceipt;