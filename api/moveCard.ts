import type { NextApiRequest, NextApiResponse } from "next";

const TRELLO_API_URL = "https://api.trello.com/1";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { cardId, newListId } = req.body;

  if (!cardId || !newListId) {
    return res.status(400).json({ message: "Missing cardId or newListId" });
  }

  try {
    const response = await fetch(
      `${TRELLO_API_URL}/members/me/cards/${cardId}?key=${process.env.NEXT_PUBLIC_TRELLO_API_KEY}&token=${process.env.NEXT_PUBLIC_TRELLO_TOKEN}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idList: newListId }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to move card");
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Error moving card:", error);
    return res.status(500).json({ message: error.message });
  }
};
