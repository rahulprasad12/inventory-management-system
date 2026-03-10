import prisma from '@/lib/prisma';

export interface AppSettings {
    gst_enabled: boolean;
}

export async function getSettings(): Promise<AppSettings> {
    const rows = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return {
        gst_enabled: map['gst_enabled'] !== 'false', // default ON
    };
}
