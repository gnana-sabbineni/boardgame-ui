export interface Friend {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  friendsSince: string; // ISO date string
}

// Mirrors BoardWalk.Api.Services.Models.Responses.RelationshipStatus exactly.
// No JsonStringEnumConverter is registered on the backend, so these travel
// as raw numbers, not strings — the values below MUST match the C# enum's
// declaration order. If that enum's order ever changes, update this to match.
export const RelationshipStatus = {
  None: 0,
  Friends: 1,
  PendingSentByMe: 2,
  PendingReceivedByMe: 3,
} as const;

export type RelationshipStatus = (typeof RelationshipStatus)[keyof typeof RelationshipStatus];

export interface UserSearchResult {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: RelationshipStatus;
}

export interface FriendRequest {
  requestId: string;
  fromUserId: string;
  fromFirstName: string;
  fromLastName: string;
  fromEmail: string;
  createdAt: string;
}

export interface SendFriendRequestPayload {
  targetUserId: string;
}