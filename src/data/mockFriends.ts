import type { Friend } from "../types/friend";

// TEMPORARY: no friends endpoint exists yet.
// Replace this with a real api/friends.ts call (e.g. GET /api/friends) later.
export const mockFriends: Friend[] = [
  { id: "1", firstName: "Sam", lastName: "Kim", isOnline: true },
  { id: "2", firstName: "Priya", lastName: "Thakur", isOnline: true },
  { id: "3", firstName: "Marcus", lastName: "Diaz", isOnline: false },
  { id: "4", firstName: "Elena", lastName: "Lopez", isOnline: true },
  { id: "5", firstName: "Theo", lastName: "Novak", isOnline: false },
];