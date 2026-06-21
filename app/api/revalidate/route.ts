import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-token');

  if (!process.env.REVALIDATE_TOKEN || secret !== process.env.REVALIDATE_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Revalidate both locales
  revalidatePath('/ar', 'page');
  revalidatePath('/en', 'page');

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
