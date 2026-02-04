'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import EditMemberDialog from '@/app/ui/income/edit-member-dialog';

type Props = {
  mbrId: number;
};

const MemberCardActions = ({ mbrId }: Props) => {
  const [openEdit, setOpenEdit] = React.useState(false);
  // const [deleting, setDeleting] = React.useState(false);

  // const onDelete = async () => {
  //   const ok = window.confirm(
  //     "Delete this member?\n\nIf the member has income records, deletion may fail."
  //   );
  //   if (!ok) return;

  //   setDeleting(true);
  //   const res = await deleteMember(mbrId);
  //   setDeleting(false);

  //   if (!res.success) {
  //     toast.error(res.message);
  //     return;
  //   }

  //   toast.success('Member deleted.');
  // };

  return (
    <>
      <div className='flex items-center justify-end gap-2'>
        <Button asChild size='sm' variant='secondary'>
          <Link href={`/income/member/${mbrId}/receipts`}>Receipts</Link>
        </Button>

        <Button size='sm' variant='outline' onClick={() => setOpenEdit(true)}>
          Edit
        </Button>

        {/* <Button size='sm' variant='secondary' onClick={onDelete} disabled={deleting} >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button> */}
      </div>

      <EditMemberDialog open={openEdit} onOpenChange={setOpenEdit} mbrId={mbrId} />
    </>
  )
}

export default MemberCardActions;