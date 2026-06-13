/**
 * Generates a consistent, beautiful gradient class for a user avatar based on their name.
 */
export function getAvatarGradient(name?: string | null): string {
  if (!name) return "bg-gradient-to-br from-indigo-500 to-purple-600";
  const str = name.trim();
  if (!str) return "bg-gradient-to-br from-indigo-500 to-purple-600";

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const gradients = [
    "bg-gradient-to-br from-indigo-500 to-purple-600",
    "bg-gradient-to-br from-blue-500 to-indigo-600",
    "bg-gradient-to-br from-emerald-500 to-teal-600",
    "bg-gradient-to-br from-rose-500 to-pink-600",
    "bg-gradient-to-br from-orange-500 to-red-600",
    "bg-gradient-to-br from-violet-500 to-fuchsia-600",
  ];

  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}
