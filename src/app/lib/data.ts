'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from "next/cache"; // for save income entries

import { BatchEntry, BatchIncomeDTO, CATEGORY_NAMES, CategoryDTO, IncomeSummary } from '@/app/lib/definitions';
import { z } from 'zod';
import { normalizeName } from '@/lib/utils';
import { prisma } from './prisma';


const ITEMS_PER_PAGE = 30 as const;
const INCOME_LIST_PATH = '/income/list';

type ActionOK<T extends object = {}> = { success: true } & T;
type ActionFail = { success: false, message: string };
type ActionResult<T extends object = {}> = ActionOK<T> | ActionFail;

const isP2002 = (e: unknown) => 
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';

const tryParseYYYYMMDDRange = (value: string): { start: Date, end: Date } | null => {
    const m = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;

    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;

    const start = new Date(year, month - 1, day, 0, 0, 0, 0);
    const end = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    return { start, end }
}


const buildIncomeListWhere = (args: {
    selectedYear: number;
    selectedMonth?: number;
    selectedDay?: number;
    query?: string;
}): Prisma.IncomeListWhereInput => {
    const { selectedYear, selectedMonth, selectedDay, query } = args;

    const AND: Prisma.IncomeListWhereInput[] = [{ year: selectedYear }];

    if (selectedMonth && selectedMonth > 0) AND.push({ month: selectedMonth });
    if (selectedDay && selectedDay > 0) AND.push({ day: selectedDay });

    const q = query?.trim();
    if (q) {
        AND.push({ name: { contains: q, mode: 'insensitive'} });
    }

    return { AND };
};

export const fetchCardData = async (year: number): Promise<IncomeSummary> => {
    const grouped = await prisma.incomeList.groupBy({
        by: ['type'],
        _sum: { amount: true },
        where: {
            year,
            type: { in: [...CATEGORY_NAMES] }
        }
    });
    
    const sumMap = new Map(grouped.map((g) => [g.type, g._sum.amount ?? 0]));
    const byCategory = CATEGORY_NAMES.map((category) => ({
        category,
        sum: sumMap.get(category) ?? 0,
    }));

    const total = byCategory.reduce((acc, r) => acc + r.sum, 0);
    return { total, byCategory };
};

export const fetchLatestIncome = async (year: number) => {
    return prisma.incomeList.findMany({
        where: { year },
        orderBy: [{ month: 'desc'}, { day: 'desc' }, { created_at: 'desc' }],
        take: 5
    });
};

export const fetchFilteredIncome = async (
    query: string,
    currentPage: number,
    selectedYear: number,
    selectedMonth?: number,
    selectedDay?: number
) => {
    const page = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;
    const offset = (page -1) * ITEMS_PER_PAGE;

    const where = buildIncomeListWhere({
        selectedYear,
        selectedMonth,
        selectedDay,
        query
    });

    const [rows, totalCount] = await Promise.all([
        prisma.incomeList.findMany({
            where,
            orderBy: [{ year: 'desc' }, { month: 'desc' }, {day: 'desc' }],
            take: ITEMS_PER_PAGE,
            skip: offset
        }),
        prisma.incomeList.count({ where })
    ]);

    return {
        data: rows,
        pagination: {
            currentPage: page,
            pageSize: ITEMS_PER_PAGE,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE)
        }
    };
};

export const getMonthDayOptions = async (year: number) => {
    const rows = await prisma.incomeList.findMany({
        where: { year },
        select: { month: true, day: true },
        distinct: ['month', 'day'],
        orderBy: [{ month: 'asc' }, { day: 'asc' }]
    });

    return rows
        .filter((r) => r.month != null && r.day != null)
        .map((r) => ({ month: r.month as number, day: r.day as number }));
};

export const getDays = async (year: number, month: number) => {
    const rows = await prisma.incomeList.findMany({
        where: { year, month },
        select: { day: true },
        distinct: ['day'],
        orderBy: [{ day: 'asc' }]
    });

    return rows
        .filter((r) => r.day != null)
        .map((r) => ({ day: r.day as number }));
};

const getCategoriesByRange = async (range: 'inc' | 'imd'): Promise<CategoryDTO[]> => {
    const rows = await prisma.category.findMany({
        select: { ctg_id: true, name: true, detail: true },
        orderBy: { order: 'asc'},
        where: { range }        
    });

    return rows.map((row) => ({
        id: row.ctg_id,
        name: (row.name ?? '').trim(),
        detail: row.detail ?? null
    }));
};

export const getIncomeTypes = async (): Promise<CategoryDTO[]> => getCategoriesByRange('inc');
export const getIncomeMethods = async (): Promise<CategoryDTO[]> => getCategoriesByRange('imd');

export const saveBatchIncome = async (data: BatchIncomeDTO): Promise<ActionResult<{ count: number }>> => {
    try {
        const { year, month, day, entries } = data;

        const y = Number(year);
        const m = Number(month);
        const d = Number(day);

        if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
            return { success: false, message: 'Invalid date values.' };
        }

        const rowsToSave = entries
            .filter((entry: BatchEntry) => entry.name.trim() !== '' && entry.amount > 0)
            .map((entry: BatchEntry) => ({
                year: y,
                month: m,
                day: d,
                amount: Math.round(entry.amount),
                inc_type: entry.type,
                inc_method: entry.method,
                notes: entry.note?.trim() ? entry.note.trim() : null,
                qt: Math.ceil(m / 3)
            }));
        if (rowsToSave.length === 0) {
            return { success: false, message: 'No valid entries were provided.' };
        }

        await prisma.income.createMany({ 
            data: rowsToSave,
            skipDuplicates: true
        });

        revalidatePath(INCOME_LIST_PATH);
        return { success: true, count: rowsToSave.length };
    } catch (e) {
        console.error('Batch Save Error:', e);
        return { success: false, message: 'Database failure. Pleases try again'};
    }
};


// For update Income Entry
const UpdateIncomeSchema = z.object({
    incId: z.coerce.number().int().positive(),
    year: z.coerce.number().int(),
    month: z.coerce.number().int().min(1).max(12),
    day: z.coerce.number().int().min(1).max(31),
    name: z.string().trim().min(1),
    amount: z.coerce.number().int().positive(),
    typeId: z.coerce.number().int().positive(),
    methodId: z.coerce.number().int().positive(),
    note: z.string().trim().optional().nullable()
});

export const updateIncome = async (input: unknown): Promise<ActionResult<{ memberId: number }>> => {
    const parsed = UpdateIncomeSchema.safeParse(input);
    if (!parsed.success) {
        return { success: false, message: 'Invalid form values.' };
    }

    const { incId, year, month, day, name, amount, typeId, methodId, note } = parsed.data;
    const qt = Math.ceil(month / 3);
    const cleanName = normalizeName(name);

    try {
        const result = await prisma.$transaction(async (tx) => {
            const existing = await tx.member.findFirst({
                where: { name_kFull: cleanName },
                select: { mbr_id: true }
            });

            let memberId = existing?.mbr_id;

            if (!memberId) {
                try {
                    const created = await tx.member.create({
                        data: { name_kFull: cleanName },
                        select: { mbr_id: true }
                    });

                    memberId = created.mbr_id;
                } catch (e) {
                    if(isP2002(e)) {
                        const again = await tx.member.findFirst({
                            where: { name_kFull: cleanName },
                            select: { mbr_id: true }
                        });
                        if (!again?.mbr_id) throw e;
                        memberId = again.mbr_id;
                    } else {
                        throw e;
                    }
                }
            }

            await tx.income.update({
                where: { inc_id: incId },
                data: {
                    year,
                    month,
                    day,
                    qt,
                    amount,
                    inc_type: typeId,
                    inc_method: methodId,
                    notes: note?.trim() ? note.trim() : null,
                    member: memberId
                }
            });

            return { memberId };
        });

        revalidatePath(INCOME_LIST_PATH);
        return { success: true, ...result };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Failed to update income.' };
    }
};

// Income Deletion - server action
export const deleteIncome = async (incId: number): Promise<ActionResult> => {
    try {
        await prisma.income.delete({ where: { inc_id: incId } });
        revalidatePath(INCOME_LIST_PATH);
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Failed to delete.' };
    }
};

// Member list page actions
const MEMBERS_PER_PAGE = 24 as const;

export const fetchFilteredMembers = async (query: string, currentPage: number) => {
    const page = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;
    const offset = (page - 1) * MEMBERS_PER_PAGE;

    const q = query.trim();

    const where: Prisma.MemberWhereInput =
        q.length > 0
            ? {
                OR: [
                    { name_kFull: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                    { address: { contains: q, mode: 'insensitive' } }
                ]
            }
            : {};
    
    const [rows, totalCount] = await Promise.all([
        prisma.member.findMany({
            where,
            orderBy: { created_at: 'desc' },
            select: {
                mbr_id: true,
                name_kFull: true,
                name_eFirst: true,
                name_eLast: true,
                email: true,
                city: true,
                postal: true
            },
            take: MEMBERS_PER_PAGE,
            skip: offset
        }),
        prisma.member.count({ where })
    ]);

    return {
        data: rows,
        pagination: {
            currentPage: page,
            pageSize: MEMBERS_PER_PAGE,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / MEMBERS_PER_PAGE)
        }
    };
};
// Member list page actions - end