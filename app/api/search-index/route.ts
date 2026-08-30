import { NextResponse } from "next/server";
import { getSearchRecords } from "@/lib/content";

export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  return NextResponse.json(getSearchRecords(), {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
