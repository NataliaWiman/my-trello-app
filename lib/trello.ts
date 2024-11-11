import { BoardType, CardType, ChecklistType, ListType } from "@/types";

const TRELLO_API_URL = "https://api.trello.com/1";
const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;

if (!TRELLO_API_KEY || !TRELLO_TOKEN) {
  throw new Error(
    "Trello API key and token must be set in environment variables."
  );
}

const cache: {
  boards: Record<string, string>;
  lists: Record<string, string>;
  checklists: Record<string, ChecklistType[]>;
} = {
  boards: {},
  lists: {},
  checklists: {},
};

export const getMyCards = async (): Promise<CardType[]> => {
  try {
    const response = await fetch(
      `${TRELLO_API_URL}/members/me/cards?fields=name,url,idBoard,idList,dateLastActivity,desc,due&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const cards: CardType[] = await response.json();

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const filteredCards = cards.filter((card: CardType) => {
      const cardDate = new Date(card.dateLastActivity);
      return cardDate >= threeMonthsAgo;
    });

    const boardIds: string[] = [
      ...new Set(filteredCards.map((card) => card.idBoard)),
    ];
    const listIds: string[] = [
      ...new Set(filteredCards.map((card) => card.idList)),
    ];

    const fetchInBatches = async <T>(urls: string[]): Promise<(T | null)[]> => {
      const chunkSize = 10;
      const urlChunks: string[][] = [];
      for (let i = 0; i < urls.length; i += chunkSize) {
        urlChunks.push(urls.slice(i, i + chunkSize));
      }

      let allData: (T | null)[] = [];
      for (const urlChunk of urlChunks) {
        const batchResponse = await fetch(
          `${TRELLO_API_URL}/batch?urls=${encodeURIComponent(
            urlChunk.join(",")
          )}&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
        );

        if (!batchResponse.ok) {
          throw new Error("Batch request failed");
        }

        const batchData: Array<{ [statusCode: string]: T }> =
          await batchResponse.json();

        allData = allData.concat(
          batchData.map((item) => {
            if (item["200"]) {
              return item["200"] as T;
            } else {
              return null;
            }
          })
        );
      }
      return allData;
    };

    const boardMap: Record<string, string> = {};
    const boardsToFetch: string[] = [];

    boardIds.forEach((id) => {
      if (cache.boards[id]) {
        boardMap[id] = cache.boards[id];
      } else {
        boardsToFetch.push(id);
      }
    });

    if (boardsToFetch.length > 0) {
      const boardUrls = boardsToFetch.map((id) => `/boards/${id}?fields=name`);
      const boardsData = await fetchInBatches<BoardType>(boardUrls);
      boardsData.forEach((board) => {
        if (board && board.id) {
          boardMap[board.id] = board.name;
          cache.boards[board.id] = board.name;
        }
      });
    }

    const listMap: Record<string, string> = {};
    const listsToFetch: string[] = [];

    listIds.forEach((id) => {
      if (cache.lists[id]) {
        listMap[id] = cache.lists[id];
      } else {
        listsToFetch.push(id);
      }
    });

    if (listsToFetch.length > 0) {
      const listUrls = listsToFetch.map((id) => `/lists/${id}?fields=name`);
      const listsData = await fetchInBatches<ListType>(listUrls);
      listsData.forEach((list) => {
        if (list && list.id) {
          listMap[list.id] = list.name;
          cache.lists[list.id] = list.name;
        }
      });
    }

    const checklistsMap: Record<string, ChecklistType[]> = {};
    const cardsToFetch: CardType[] = [];

    filteredCards.forEach((card) => {
      if (cache.checklists[card.id]) {
        checklistsMap[card.id] = cache.checklists[card.id];
      } else {
        cardsToFetch.push(card);
      }
    });

    if (cardsToFetch.length > 0) {
      const checklistUrls = cardsToFetch.map(
        (card) => `/cards/${card.id}/checklists`
      );
      const checklistsData = await fetchInBatches<ChecklistType[]>(
        checklistUrls
      );
      cardsToFetch.forEach((card, index) => {
        const checklists = checklistsData[index];
        checklistsMap[card.id] = checklists || [];
        cache.checklists[card.id] = checklists || [];
      });
    }

    const cardsWithDetails: CardType[] = filteredCards.map((card) => ({
      ...card,
      boardName: boardMap[card.idBoard] || "Unknown Board",
      listName: listMap[card.idList] || "Unknown List",
      checklists: checklistsMap[card.id] || [],
    }));

    const sortedCards = cardsWithDetails.sort((a, b) => {
      return (
        new Date(b.dateLastActivity).getTime() -
        new Date(a.dateLastActivity).getTime()
      );
    });

    return sortedCards;
  } catch (error) {
    console.error("Error fetching cards:", error);
    throw error;
  }
};

export const moveCard = async (cardId: string, newListId: string) => {
  const response = await fetch(
    `${TRELLO_API_URL}/cards/${cardId}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
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

  return response.json();
};

export const getBoardLists = async (boardId: string): Promise<ListType[]> => {
  const response = await fetch(
    `${TRELLO_API_URL}/boards/${boardId}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch lists");
  }

  const lists: ListType[] = await response.json();
  return lists;
};

export const updateCheckItem = async (
  cardId: string,
  checkItemId: string,
  state: "complete" | "incomplete"
) => {
  const response = await fetch(
    `${TRELLO_API_URL}/cards/${cardId}/checkItem/${checkItemId}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}&state=${state}`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update check item");
  }

  return response.json();
};
