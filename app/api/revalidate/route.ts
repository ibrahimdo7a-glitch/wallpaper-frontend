import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-token');

  if (!process.env.REVALIDATE_TOKEN || secret !== process.env.REVALIDATE_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Clear all data caches by tag
  revalidateTag('site-content');
  revalidateTag('wallpapers');
  revalidateTag('categories');

  // Also revalidate all pages (layout level = everything)
  revalidatePath('/', 'layout');

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
