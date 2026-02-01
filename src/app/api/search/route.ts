import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/supabase/products';

// Prevent caching so search always returns fresh prices/data (fixes Vercel showing old price in search)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 8;

  const noCache = { headers: { 'Cache-Control': 'no-store, max-age=0' } };
  if (!query || query.trim().length === 0) {
    return NextResponse.json({ products: [] }, noCache);
  }

  try {
    const products = await searchProducts(query.trim(), limit, 0);
    return NextResponse.json({ products }, noCache);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ products: [] }, { status: 500, ...noCache });
  }
}
