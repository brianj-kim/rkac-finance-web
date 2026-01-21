import { UserPlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { fetchFilteredMembers } from "../../lib/data";
import { lusitana } from "../../ui/fonts";
import MemberSearch from "../../ui/income/member-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { formatEnglishName } from "../../lib/utils";
import MemberCardActions from "../../ui/income/member-card-actions";
import Pagination from "../../ui/income/pagination";

const formatValue = (v: string | null) => (v?.trim() ? v.trim() : '-');

const MemberList = async (props: {
  searchParams?: Promise<{ query?: string; page?: string }>;
}) => {
  const searchParams = await props.searchParams;
  const query = (searchParams?.query ?? '').trim();
  const currentPage = Number(searchParams?.page) || 1;

  const { data: members, pagination } = await fetchFilteredMembers(query, currentPage);  

  return (
    <main className='space-y-4'>      
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>Member Admin</h1>
        <MemberSearch initialQuery={query} />
        <Link
          href="/income/member/create"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <UserPlusIcon className="h-5 w-5" />
          New Member
        </Link>        
      </div>

      {query ? (
        <div className='text-sm text-muted-foreground'>
          Showing results for: <span className='font-medium text-foreground'>{query}</span>
          <span className='ml-2'>({members.length})</span>
        </div>
      ) : (
        <div className='text-sm text-muted-foreground'>
          Total members: <span className='font-medium text-foreground'>{members.length}</span>
        </div>
      )}

      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
        {members.map((m: any) => (
          <Card key={m.mbr_id} className='shadow-sm'>
            <CardHeader className='pb-2'>
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <CardTitle className='text-base'>{formatValue(m.name_kFull)}</CardTitle>
                  <div className='text-sm text-muted-foreground'>
                    {formatEnglishName(m.name_eFirst, m.name_eLast)}
                  </div>
                </div>
                <MemberCardActions mbrId={m.mbr_id} />
              </div>              
            </CardHeader>

            <CardContent className='space-y-2 text-sm'>
              <div>
                <div className='text-muted-foreground'>Email</div>
                <div className='truncate'>{formatValue(m.email)}</div>
              </div>

              <div className='flex gap-6'>
                <div className='min-w-0'>
                  <div className='text-muted-foreground'>City</div>
                  <div className='truncate'>{formatValue(m.city)}</div>
                </div>

                <div className='shrink-0'>
                  <div className='text-muted-foreground'>Postal</div>
                  <div>{formatValue(m.postal)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {members.length === 0 && (
        <div className='rounded-md border p-4 text-sm text-muted-foreground'>
          No members found.
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className='mt-5 flex w-full justify-center'>
          <Pagination totalPages={pagination.totalPages} />
        </div>
      )}
    </main>
  );
}

export default MemberList;