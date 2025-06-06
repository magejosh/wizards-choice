import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, error: 'Not allowed in production.' }, { status: 403 });
  }
  try {
    const xml = await req.text();
    if (!xml || !xml.trim().startsWith('<spells')) {
      return NextResponse.json({ success: false, error: 'Invalid XML.' }, { status: 400 });
    }
    const filePath = path.join(process.cwd(), 'public', 'data', 'spell_data.xml');
    fs.writeFileSync(filePath, xml, 'utf-8');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
} 