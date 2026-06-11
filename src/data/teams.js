// All 48 qualified teams for the 2026 tournament (final list, post March-2026 playoffs).
// Team identity = name + flag + kit colors only. No crests/badges (legal guardrail).
// flag: emoji (fallback). iso: flagcdn.com country code for the flag image
//   (subdivisions use flagcdn's gb-eng / gb-sct codes).
// primary/secondary are approximate home-kit hex colors, used for share-card backgrounds.
// isBigTeam marks the curated "first big team eliminated" picker subset — tune freely.

export const teams = [
  // Hosts
  { id: 'usa', name: 'USA', flag: '🇺🇸', iso: 'us', primary: '#002868', secondary: '#BF0A30', confederation: 'CONCACAF' },
  { id: 'mexico', name: 'Mexico', flag: '🇲🇽', iso: 'mx', primary: '#006847', secondary: '#CE1126', confederation: 'CONCACAF', isBigTeam: true },
  { id: 'canada', name: 'Canada', flag: '🇨🇦', iso: 'ca', primary: '#C8102E', secondary: '#FFFFFF', confederation: 'CONCACAF' },

  // UEFA
  { id: 'england', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', iso: 'gb-eng', primary: '#FFFFFF', secondary: '#C8102E', confederation: 'UEFA', isBigTeam: true },
  { id: 'france', name: 'France', flag: '🇫🇷', iso: 'fr', primary: '#002654', secondary: '#ED2939', confederation: 'UEFA', isBigTeam: true },
  { id: 'germany', name: 'Germany', flag: '🇩🇪', iso: 'de', primary: '#FFFFFF', secondary: '#000000', confederation: 'UEFA', isBigTeam: true },
  { id: 'spain', name: 'Spain', flag: '🇪🇸', iso: 'es', primary: '#C60B1E', secondary: '#FFC400', confederation: 'UEFA', isBigTeam: true },
  { id: 'portugal', name: 'Portugal', flag: '🇵🇹', iso: 'pt', primary: '#DA291C', secondary: '#046A38', confederation: 'UEFA', isBigTeam: true },
  { id: 'netherlands', name: 'Netherlands', flag: '🇳🇱', iso: 'nl', primary: '#F36C21', secondary: '#21468B', confederation: 'UEFA', isBigTeam: true },
  { id: 'belgium', name: 'Belgium', flag: '🇧🇪', iso: 'be', primary: '#E30613', secondary: '#FDDA24', confederation: 'UEFA', isBigTeam: true },
  { id: 'croatia', name: 'Croatia', flag: '🇭🇷', iso: 'hr', primary: '#ED1C24', secondary: '#FFFFFF', confederation: 'UEFA', isBigTeam: true },
  { id: 'austria', name: 'Austria', flag: '🇦🇹', iso: 'at', primary: '#ED2939', secondary: '#FFFFFF', confederation: 'UEFA' },
  { id: 'switzerland', name: 'Switzerland', flag: '🇨🇭', iso: 'ch', primary: '#DA291C', secondary: '#FFFFFF', confederation: 'UEFA' },
  { id: 'norway', name: 'Norway', flag: '🇳🇴', iso: 'no', primary: '#C8102E', secondary: '#00205B', confederation: 'UEFA' },
  { id: 'scotland', name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', iso: 'gb-sct', primary: '#00205B', secondary: '#FFFFFF', confederation: 'UEFA' },
  { id: 'bosnia', name: 'Bosnia & Herzegovina', flag: '🇧🇦', iso: 'ba', primary: '#002F6C', secondary: '#FECB00', confederation: 'UEFA' },
  { id: 'sweden', name: 'Sweden', flag: '🇸🇪', iso: 'se', primary: '#FFCD00', secondary: '#004B87', confederation: 'UEFA' },
  { id: 'turkiye', name: 'Türkiye', flag: '🇹🇷', iso: 'tr', primary: '#E30A17', secondary: '#FFFFFF', confederation: 'UEFA' },
  { id: 'czechia', name: 'Czechia', flag: '🇨🇿', iso: 'cz', primary: '#D7141A', secondary: '#11457E', confederation: 'UEFA' },

  // CONMEBOL
  { id: 'argentina', name: 'Argentina', flag: '🇦🇷', iso: 'ar', primary: '#75AADB', secondary: '#FFFFFF', confederation: 'CONMEBOL', isBigTeam: true },
  { id: 'brazil', name: 'Brazil', flag: '🇧🇷', iso: 'br', primary: '#FFDC02', secondary: '#179B3F', confederation: 'CONMEBOL', isBigTeam: true },
  { id: 'uruguay', name: 'Uruguay', flag: '🇺🇾', iso: 'uy', primary: '#55B5E5', secondary: '#000000', confederation: 'CONMEBOL', isBigTeam: true },
  { id: 'colombia', name: 'Colombia', flag: '🇨🇴', iso: 'co', primary: '#FCD116', secondary: '#003893', confederation: 'CONMEBOL' },
  { id: 'ecuador', name: 'Ecuador', flag: '🇪🇨', iso: 'ec', primary: '#FFD100', secondary: '#034EA2', confederation: 'CONMEBOL' },
  { id: 'paraguay', name: 'Paraguay', flag: '🇵🇾', iso: 'py', primary: '#D52B1E', secondary: '#0038A8', confederation: 'CONMEBOL' },

  // CAF
  { id: 'morocco', name: 'Morocco', flag: '🇲🇦', iso: 'ma', primary: '#C1272D', secondary: '#006233', confederation: 'CAF' },
  { id: 'senegal', name: 'Senegal', flag: '🇸🇳', iso: 'sn', primary: '#00853F', secondary: '#FDEF42', confederation: 'CAF' },
  { id: 'egypt', name: 'Egypt', flag: '🇪🇬', iso: 'eg', primary: '#CE1126', secondary: '#FFFFFF', confederation: 'CAF' },
  { id: 'algeria', name: 'Algeria', flag: '🇩🇿', iso: 'dz', primary: '#FFFFFF', secondary: '#006233', confederation: 'CAF' },
  { id: 'tunisia', name: 'Tunisia', flag: '🇹🇳', iso: 'tn', primary: '#E70013', secondary: '#FFFFFF', confederation: 'CAF' },
  { id: 'ghana', name: 'Ghana', flag: '🇬🇭', iso: 'gh', primary: '#CE1126', secondary: '#FCD116', confederation: 'CAF' },
  { id: 'ivory-coast', name: 'Ivory Coast', flag: '🇨🇮', iso: 'ci', primary: '#FF8200', secondary: '#009A44', confederation: 'CAF' },
  { id: 'cape-verde', name: 'Cape Verde', flag: '🇨🇻', iso: 'cv', primary: '#003DA5', secondary: '#F7D116', confederation: 'CAF' },
  { id: 'south-africa', name: 'South Africa', flag: '🇿🇦', iso: 'za', primary: '#FFB81C', secondary: '#007749', confederation: 'CAF' },
  { id: 'dr-congo', name: 'DR Congo', flag: '🇨🇩', iso: 'cd', primary: '#007FFF', secondary: '#F7D618', confederation: 'CAF' },

  // AFC
  { id: 'japan', name: 'Japan', flag: '🇯🇵', iso: 'jp', primary: '#002FA7', secondary: '#E60012', confederation: 'AFC' },
  { id: 'south-korea', name: 'South Korea', flag: '🇰🇷', iso: 'kr', primary: '#CD2E3A', secondary: '#0047A0', confederation: 'AFC' },
  { id: 'iran', name: 'Iran', flag: '🇮🇷', iso: 'ir', primary: '#239F40', secondary: '#DA0000', confederation: 'AFC' },
  { id: 'australia', name: 'Australia', flag: '🇦🇺', iso: 'au', primary: '#FFB81C', secondary: '#00843D', confederation: 'AFC' },
  { id: 'saudi-arabia', name: 'Saudi Arabia', flag: '🇸🇦', iso: 'sa', primary: '#006C35', secondary: '#FFFFFF', confederation: 'AFC' },
  { id: 'qatar', name: 'Qatar', flag: '🇶🇦', iso: 'qa', primary: '#8A1538', secondary: '#FFFFFF', confederation: 'AFC' },
  { id: 'jordan', name: 'Jordan', flag: '🇯🇴', iso: 'jo', primary: '#CE1126', secondary: '#007A3D', confederation: 'AFC' },
  { id: 'uzbekistan', name: 'Uzbekistan', flag: '🇺🇿', iso: 'uz', primary: '#0099B5', secondary: '#1EB53A', confederation: 'AFC' },
  { id: 'iraq', name: 'Iraq', flag: '🇮🇶', iso: 'iq', primary: '#007A3D', secondary: '#CE1126', confederation: 'AFC' },

  // CONCACAF (qualifiers)
  { id: 'panama', name: 'Panama', flag: '🇵🇦', iso: 'pa', primary: '#D21034', secondary: '#005293', confederation: 'CONCACAF' },
  { id: 'curacao', name: 'Curaçao', flag: '🇨🇼', iso: 'cw', primary: '#002B7F', secondary: '#F9E814', confederation: 'CONCACAF' },
  { id: 'haiti', name: 'Haiti', flag: '🇭🇹', iso: 'ht', primary: '#00209F', secondary: '#D21034', confederation: 'CONCACAF' },

  // OFC
  { id: 'new-zealand', name: 'New Zealand', flag: '🇳🇿', iso: 'nz', primary: '#FFFFFF', secondary: '#000000', confederation: 'OFC' },
]

export const bigTeams = teams.filter((t) => t.isBigTeam)

export const getTeam = (id) => teams.find((t) => t.id === id)
