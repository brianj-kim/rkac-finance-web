import { fetchCardData } from "../../lib/data";
import { formatCurrency } from "../../lib/utils";
import { lusitana } from "../fonts";

type CardWrapperProps = {
    selectedYear: number;
}

const CardWrapper = async ({ selectedYear }: CardWrapperProps) => {
    const { total, byCategory } = await fetchCardData(selectedYear)

    return (
        <>
            <Card title="Total Income" value={total} />

            {byCategory.map((item) => (
                <Card 
                    key={item.category}
                    title={item.category}
                    value={item.sum}
                />
            ))}
        </>
    );
}

export const Card = ({
    title,
    value,
    type
}: {
    title: string;
    value: number | null;
    type?: string 
}) => {
    return (
        <div className='rounded-xl bg-gray-50 p-2 shadow-sm'>
            <div className='flex p-4'>
                <h3 className='ml-2 text-sm font-medium'>{title}</h3>
            </div>
            <p
                className={`${lusitana.className}
                truncate rounded-xl bg-white px-4 py-8 text-center text-xl`}
            >
                {formatCurrency(value!/100)}
            </p>
        </div>
    )
}


export default CardWrapper;