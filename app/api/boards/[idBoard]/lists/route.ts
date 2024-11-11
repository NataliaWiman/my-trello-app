import { NextRequest, NextResponse } from "next/server";
import { getBoardLists } from "@/lib/trello";

export async function GET(
  request: NextRequest,
  { params }: { params: { idBoard: string } }
) {
  try {
    const { idBoard } = params;

    if (!idBoard) {
      return NextResponse.json(
        { message: "Missing board ID" },
        { status: 400 }
      );
    }

    const lists = await getBoardLists(idBoard);
    return NextResponse.json(lists);
  } catch (error) {
    console.error("Error fetching board lists:", error);
    return NextResponse.json(
      { message: "Failed to fetch board lists" },
      { status: 500 }
    );
  }
}
