// Frontend never talks to Anthropic directly — only to our /api/roast route.
export async function requestRoast(picks) {
  const res = await fetch('/api/roast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(picks),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`)
  }
  return data // { roast, courageRating }
}
