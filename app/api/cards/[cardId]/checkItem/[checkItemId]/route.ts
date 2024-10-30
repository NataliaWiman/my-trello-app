import { NextRequest, NextResponse } from "next/server";
import { updateCheckItem } from "@/lib/trello";

export async function PUT(
  request: NextRequest,
  { params }: { params: { cardId: string; checkItemId: string } }
) {
  const { cardId, checkItemId } = params;

  try {
    const { state } = await request.json();

    if (!state || (state !== "complete" && state !== "incomplete")) {
      return NextResponse.json({ message: "Invalid state" }, { status: 400 });
    }

    const data = await updateCheckItem(cardId, checkItemId, state);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error updating check item:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update check item" },
      { status: 500 }
    );
  }
}
