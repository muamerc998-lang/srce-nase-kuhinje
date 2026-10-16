import type { Metadata } from 'next'
import { MealPage, mealMetadata } from '@/components/archive/MealPage'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return mealMetadata('dorucak', await searchParams)
}

export default async function Page({ searchParams }: Props) {
  return <MealPage meal="dorucak" searchParams={await searchParams} />
}
