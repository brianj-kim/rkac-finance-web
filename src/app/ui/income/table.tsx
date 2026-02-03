import type { IncomeList } from '@prisma/client';
import { CategoryDTO } from '@/app/lib/definitions';
import { formatCurrency } from '@/app/lib/utils';
import ListActions from './list-actions';


type IncomeTableProps = {
  incomeList: IncomeList[];
  incomeTypes: CategoryDTO[];
  incomeMethods: CategoryDTO[];
}

const IncomeTable = async ({ incomeList, incomeTypes, incomeMethods }: IncomeTableProps) => {
    
  return (
    <div className="mt-6 flow-root">
      <div className="w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {incomeList?.map((income) => (
              <div
                key={income.inc_id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      
                      <p>{income.name}</p>
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      {formatCurrency(income.amount!)}
                    </p>
                    <p>{`${income.year}-${income.month}-${income.day}`}</p>
                  </div>
                  <div className="flex justify-end gap-2">

                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden w-full table-auto text-gray-900 md:table">
            <thead className="rounded-md text-left text-sm font-normal">
              <tr>
                <th scope="col" className="w-[1%] whitespace-nowrap px-4 py-5 font-medium sm:pl-6">
                  Name
                </th>
                <th scope="col" className="w-[1%] whitespace-nowrap px-3 py-5 font-medium">
                  Date
                </th>
                <th scope="col" className="w-[1%] whitespace-nowrap px-3 py-5 font-medium">
                  Amount
                </th>
                <th scope="col" className="w-[1%] whitespace-nowrap px-3 py-5 font-medium">
                  Type
                </th>
                <th scope="col" className="w-[1%] whitespace-nowrap px-3 py-5 font-medium">
                  Method
                </th>
                <th scope="col" className="w-full px-3 py-5 font-medium">
                  Note
                </th>                
                <th scope="col" className="w-[1%] whitespace-nowrap px-3 py-5 font-medium text-right sm:pr-6">
                  <span className="">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {incomeList?.map((income) => (
                <tr
                  key={income.inc_id}
                  className="w-full border-b border-gray-100 py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">                                       
                    {income.name}                    
                  </td>
                  <td className="w-[1%] whitespace-nowrap px-3 py-3">
                    {`${income.year}-${income.month}-${income.day}`}
                  </td>   
                  <td className="w-[1%] whitespace-nowrap px-3 py-3 text-right">
                    {formatCurrency(income.amount!)}
                  </td>
                  <td className="w-[1%] whitespace-nowrap px-3 py-3">
                    {income.type}
                  </td>
                  <td className="w-[1%] whitespace-nowrap px-3 py-3">
                    {income.method}
                  </td>
                  <td className="w-full px-3 py-3">
                    {income.notes}
                  </td>                                
                  <td className="w-[1%] whitespace-nowrap py-3 pr-2 text-right ms:pr-6">
                    <div className='flex justify-end gap-2'>
                      <ListActions 
                        income={income}
                        incomeTypes={incomeTypes}
                        incomeMethods={incomeMethods}                    
                      />
                    </div>                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


export default IncomeTable;