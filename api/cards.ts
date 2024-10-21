// Define the Trello API URL
const TRELLO_API_URL = "https://api.trello.com/1";

// Represents a Trello card
interface CardType {
  id: string;
  name: string;
  url: string;
  idBoard: string;
  idList: string;
  dateLastActivity: string;
  desc?: string;
  due?: string | null;
  boardName?: string;
  listName?: string;
  checklists?: ChecklistType[];
}

// Represents a Trello board
interface BoardType {
  id: string;
  name: string;
}

// Represents a Trello list
interface ListType {
  id: string;
  name: string;
}

// Represents a Trello checklist
interface ChecklistType {
  id: string;
  name: string;
  checkItems: CheckItemType[];
}

// Represents an item within a Trello checklist
interface CheckItemType {
  id: string;
  name: string;
  state: string;
  due?: string | null;
}

// Cache structure to store fetched data
const cache: {
  boards: Record<string, string>;
  lists: Record<string, string>;
  checklists: Record<string, ChecklistType[]>;
} = {
  boards: {},
  lists: {},
  checklists: {},
};

// The getMyCards function rewritten in TypeScript
export const getMyCards = async (): Promise<CardType[]> => {
  try {
    // Fetch cards assigned to the authenticated user
    const response = await fetch(
      `${TRELLO_API_URL}/members/me/cards?fields=name,url,idBoard,idList,dateLastActivity,desc,due&key=${process.env.NEXT_PUBLIC_TRELLO_API_KEY}&token=${process.env.NEXT_PUBLIC_TRELLO_TOKEN}`
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    // Parse the response as an array of cards
    const cards: CardType[] = await response.json();

    // Filter out cards older than 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const filteredCards = cards.filter((card: CardType) => {
      const cardDate = new Date(card.dateLastActivity);
      return cardDate >= threeMonthsAgo;
    });

    // Extract unique board and list IDs
    const boardIds: string[] = [
      ...new Set(filteredCards.map((card) => card.idBoard)),
    ];
    const listIds: string[] = [
      ...new Set(filteredCards.map((card) => card.idList)),
    ];

    // Function to fetch data in batches
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
          )}&key=${process.env.NEXT_PUBLIC_TRELLO_API_KEY}&token=${
            process.env.NEXT_PUBLIC_TRELLO_TOKEN
          }`
        );

        if (!batchResponse.ok) {
          throw new Error("Batch request failed");
        }

        // The batch response is an array of objects with status codes as keys
        const batchData: Array<{ [statusCode: string]: T }> =
          await batchResponse.json();

        // Map over the batch data to extract successful responses
        allData = allData.concat(
          batchData.map((item) => {
            if (item["200"]) {
              return item["200"] as T;
            } else {
              // Handle errors or non-200 responses as needed
              return null;
            }
          })
        );
      }
      return allData;
    };

    // Fetch board names using batch requests
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
          cache.boards[board.id] = board.name; // Update cache
        }
      });
    }

    // Fetch list names using batch requests
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
          cache.lists[list.id] = list.name; // Update cache
        }
      });
    }

    // Fetch checklists for each card using batch requests
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
        cache.checklists[card.id] = checklists || []; // Update cache
      });
    }

    // Combine all data into cardsWithDetails
    const cardsWithDetails: CardType[] = filteredCards.map((card) => ({
      ...card,
      boardName: boardMap[card.idBoard] || "Unknown Board",
      listName: listMap[card.idList] || "Unknown List",
      checklists: checklistsMap[card.id] || [],
    }));

    // Sort the cards by dateLastActivity, most recent first
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
