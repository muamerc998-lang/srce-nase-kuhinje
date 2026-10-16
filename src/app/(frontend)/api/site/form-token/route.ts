import { NextResponse } from 'next/server'
import { formToken } from '@/lib/forms/protect'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({ token: formToken() }, { headers: { 'Cache-Control': 'no-store' } })
}
