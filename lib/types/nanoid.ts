export function nanoid(size = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const arr = new Uint8Array(size);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
    for (let i = 0; i < arr.length; i++) result += chars[arr[i] % chars.length];
  } else {
    for (let i = 0; i < size; i++) result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
