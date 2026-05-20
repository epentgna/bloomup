export const GAME_KEYWORDS = [
  'game', 'minecraft', 'roblox', 'steam', 'fortnite', 'valorant',
  'call of duty', 'league of legends', 'apex legends', 'overwatch',
  'fifa', 'nba 2k', 'grand theft auto', 'warzone', 'counter-strike',
  'dota', 'world of warcraft', 'zelda', 'mario', 'pokemon', 'xbox',
  'playstation', 'elden ring', 'cyberpunk', 'battlefield', 'rocket league',
  'among us', 'fall guys', 'terraria', 'stardew', 'sims', 'baldurs gate',
  'diablo', 'subway surfers', 'clash royale', 'brawl stars', 'clash of clans',
  'candy crush', 'angry birds', 'temple run', 'fruit ninja', 'geometry dash',
  'mobile legends', 'free fire', 'honor of kings', 'garena', 'pubg',
  'stumble guys', 'my talking tom', 'dragon city', 'hay day', 'boom beach',
  'coin master', 'slither', 'agar', '8 ball pool', 'mini militia',
  'shadow fight', 'hill climb', 'crossy road', 'jetpack joyride', 'cut the rope',
  'plants vs zombies', 'tower defense', 'bubble shooter',
]

export function looksLikeGame(name) {
  const lower = name.toLowerCase()
  return GAME_KEYWORDS.some(k => lower.includes(k))
}
