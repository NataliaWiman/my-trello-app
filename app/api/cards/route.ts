import { NextResponse } from "next/server";
import { getMyCards } from "@/lib/trello";

export async function GET() {
  try {
    const cards = await getMyCards();
    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}
