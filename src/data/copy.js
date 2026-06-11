// All user-facing text lives here so non-code copy edits are trivial.

export const copy = {
  titles: {
    home: 'The Banter Toolbox — World Cup 2026',
    roast: 'AI Roasts Your Predictions — The Banter Toolbox',
    excuse: 'Fan Excuse Generator — The Banter Toolbox',
  },

  nav: {
    brand: 'The Banter Toolbox',
    roast: 'Roast',
    excuse: 'Excuse',
    soon: 'Soon',
  },

  home: {
    headline: 'The Banter Toolbox',
    promise: 'AI-powered ammunition for the group chat, all tournament long.',
    roastTool: {
      name: 'AI Roasts Your Predictions',
      pitch: 'Call the champion, the dark horse, the first big flop — and get torn apart by a pundit who has seen it all since 1970.',
      sample: '“England as champion AND dark horse — sixty years of hurt and you’ve pre-ordered another summer of it.”',
      cta: 'Get roasted →',
    },
    excuseTool: {
      name: 'Fan Excuse Generator',
      pitch: 'Lost? Robbed by the ref? Didn’t even qualify? Get your official, certified excuse — with a Denial Level to match.',
      sample: '“The grass was simply too horizontal for our style of play.”',
      badge: 'In build — coming soon',
    },
    emailSlot: {
      title: 'One email per matchday banter drop',
      note: 'Email capture coming soon — no spam, just new tools and lore.',
      placeholder: 'you@example.com',
      button: 'Notify me',
    },
  },

  app: {
    title: 'AI Roasts Your Predictions',
    tagline: 'Call the tournament. Get destroyed for it.',
  },

  steps: {
    one: {
      title: 'Step 1 — The Final',
      championLabel: 'Who lifts the trophy?',
      runnerUpLabel: 'Who loses the final?',
    },
    two: {
      title: 'Step 2 — The Bold Calls',
      topScorerLabel: 'Top scorer',
      topScorerPlaceholder: 'e.g. Mbappé, Haaland, that guy from your five-a-side…',
      darkHorseLabel: 'Dark horse (your sneaky semifinalist)',
      firstBigOutLabel: 'First big team to crash out',
    },
    three: {
      title: 'Step 3 — Face the Music',
      summaryTitle: 'Your predictions',
      championChip: 'Champion',
      runnerUpChip: 'Runner-up',
      topScorerChip: 'Top scorer',
      darkHorseChip: 'Dark horse',
      firstBigOutChip: 'First big exit',
    },
  },

  buttons: {
    next: 'Next →',
    back: '← Back',
    roastMe: 'Roast me 🔥',
    roastAgain: 'Roast me again',
    startOver: 'Start over',
    tryAgain: 'Try again',
    downloadPng: 'Download PNG',
    share: 'Share 📤',
  },

  errors: {
    roastFailed: 'The pundit lost his train of thought.',
  },

  loading: {
    line: 'The pundit is reviewing your picks…',
  },

  result: {
    placeholderRoast:
      '[Placeholder] The pundit will tear into these picks once the roast API is wired up.',
    courageLabel: 'Courage Rating',
  },

  shareCard: {
    header: 'MY WORLD CUP 2026 PREDICTIONS',
    courageLabel: 'COURAGE RATING',
    watermark: 'bantertoolbox.com',
    shareText: 'The AI pundit rated my tournament predictions. Get roasted yourself:',
    copied: 'Card copied to clipboard 📋',
    shareFailed: 'Could not share — try Download instead.',
    downloading: 'Rendering…',
  },

  excuse: {
    title: 'Fan Excuse Generator',
    tagline: "No defeat is ever your team's fault.",
    steps: {
      one: {
        title: 'Step 1 — Your Team',
        label: 'Who are you defending today?',
      },
      two: {
        title: 'Step 2 — What Happened?',
        situationLabel: 'The crime',
        opponentLabel: 'Optional: the perpetrator',
        opponentSkip: 'Clear opponent',
      },
    },
    buttons: {
      defend: 'Defend my team',
      defendAgain: 'Defend again',
      startOver: 'Start over',
    },
    loading: { line: 'The Advocate is preparing your defence…' },
    errors: { failed: 'The Advocate has been temporarily disbarred.' },
    result: {
      denialLabel: 'Denial Level',
    },
  },

  excuseCard: {
    shareText: 'My team has been officially defended. Get your excuse:',
  },

  footer: {
    disclaimer: 'Not affiliated with FIFA. Just here for the banter.',
    kofi: 'Buy us a coffee ☕ (coming soon)',
    socialsLabel: 'More banter on YouTube →',
    youtube: { label: 'Maton Football', url: 'https://www.youtube.com/@MatonFootball' },
    affiliateFallbackLabel: 'Our partner →',
  },
}
