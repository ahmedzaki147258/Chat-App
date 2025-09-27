const userSocketIdMap: Record<string, string> = {};

export function addUserSocket(userId: number, socketId: string) {
  userSocketIdMap[`user_${userId}`] = socketId;
}

export function removeUserSocket(userId: number) {
  delete userSocketIdMap[`user_${userId}`];
}

export function getUserSocket(userId: number) {
  return userSocketIdMap[`user_${userId}`];
}

export function getAllSockets() {
  return userSocketIdMap;
}