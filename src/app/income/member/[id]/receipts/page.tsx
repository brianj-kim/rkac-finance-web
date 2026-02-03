import { prisma } from '@/app/lib/prisma';
import GenerateReceiptForm from '@/app/ui/receipt/generate-receipt-form';
import Link from 'next/link';

const MemberReceiptsPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await props.params;
  const memberId = Number(id);

  const member = await prisma.member.findUnique({
    where: { mbr_id: memberId },
    select: {
      mbr_id: true,
      name_kFull: true,
      name_eFirst: true,
      name_eLast: true,
      address: true,
      city: true,
      province: true,
      postal: true,
      email: true
    }
  });

  if (!member) {
    return <main className='p-6'>Member not found.</main>;
  }

  const receipts = await prisma.receipt.findMany({
    where: { memberId },
    orderBy: [{ taxYear: 'desc' }, { serialNumber: 'desc' }],
    select: {
      id: true,
      taxYear: true,
      issueDate: true,
      serialNumber: true,
      totalCents: true,
      eligibleCents: true,
      pdfUrl: true
    }
  });

  return (
    <main className='space-y-4'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl font-sesmibold md:text-2xl'>Donation Receipts</h1>
          <div className='text-sm text-muted-foreground'>
            {member.name_kFull} ({[member.name_eFirst, member.name_eLast].filter(Boolean).join(' ') || "-"})
          </div>
        </div>

        <Link className='text-sm underline' href='/income/member'>
          Back to members
        </Link>

        <GenerateReceiptForm memberId={memberId} />

        <div className='rounded-md border'>
          <div className='grid grid-cols-5 gap-2 border-b bg-muted px-3 py-2 text-xs font-medium'>
            <div>Tax Year</div>
            <div>Serial</div>
            <div>Issued</div>
            <div className='text-right'>Eligible</div>
            <div className='text-right'>PDF</div>
          </div>

          {receipts.length === 0 ? (
            <div className='p-4 text-sm text-muted-foreground'>No receipts yet.</div>
          ) : (
            receipts.map((r) => (
              <div key={r.id} className='grid grid-cols-5 gap-2 px-3 py-2 text-sm border-b last:border-b-0'>
                <div>{r.taxYear}</div>
                <div>{r.serialNumber}</div>
                <div>{new Date(r.issueDate).toLocaleDateString()}</div>
                <div className='text.right'>${(r.eligibleCents / 100).toFixed(2)}</div>
                <div className='text-right'>
                  <a className='underline' href={r.pdfUrl} target='_blank' rel='noreferrer'>
                    Open
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

export default MemberReceiptsPage;