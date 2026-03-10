import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    // Defaults
    if (!('gst_enabled' in map)) map['gst_enabled'] = 'true';
    return NextResponse.json(map);
}

export async function POST(request: Request) {
    const { key, value } = await request.json();
    const setting = await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    });
    return NextResponse.json(setting);
}
