import { getIncomeMethods, getIncomeTypes } from "@/src/app/lib/data";
import BatchIncomeForm from "@/src/app/ui/income/batch-income-form";


const IncomeBatchPage = async () => {
  const incomeTypes = await getIncomeTypes();
  const incomeMethods = await getIncomeMethods();

  return (
    <main>
      
      <BatchIncomeForm incomeTypes={incomeTypes} incomeMethods={incomeMethods} />
    </main>
  )
}

export default IncomeBatchPage;