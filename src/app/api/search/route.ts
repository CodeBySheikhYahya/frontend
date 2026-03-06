import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/supabase/products';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 8;

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await searchProducts(query.trim(), limit, 0);
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
