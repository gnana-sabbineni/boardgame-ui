import { apiFetch } from "./client";
import type {
  Friend,
  UserSearchResult,
  FriendRequest,
  SendFriendRequestPayload,
} from "../types/friend";

export function getFriends() {
  return apiFetch<Friend[]>("/friends");
}

export function searchUsers(query: string) {
  return apiFetch<UserSearchResult[]>(`/friends/users/search?query=${encodeURIComponent(query)}`);
}

export function sendFriendRequest(payload: SendFriendRequestPayload) {
  return apiFetch<{ requestId: string }>("/friends/requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getIncomingRequests() {
  return apiFetch<FriendRequest[]>("/friends/requests");
}

export function acceptFriendRequest(requestId: string) {
  return apiFetch<null>(`/friends/requests/${requestId}/accept`, { method: "POST" });
}

export function declineFriendRequest(requestId: string) {
  return apiFetch<null>(`/friends/requests/${requestId}/decline`, { method: "POST" });
}

export function removeFriend(friendUserId: string) {
  return apiFetch<null>(`/friends/${friendUserId}`, { method: "DELETE" });
}