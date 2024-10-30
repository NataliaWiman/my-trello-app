import { NextRequest, NextResponse } from "next/server";
import { moveCard } from "@/lib/trello";

export async function PUT(request: NextRequest) {
  try {
    const { cardId, newListId } = await request.json();

    if (!cardId || !newListId) {
      return NextResponse.json(
        { message: "Missing cardId or newListId" },
        { status: 400 }
      );
    }

    const data = await moveCard(cardId, newListId);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error moving card:", error);
    return NextResponse.json(
      { message: error.message || "Failed to move card" },
      { status: 500 }
    );
  }
}
