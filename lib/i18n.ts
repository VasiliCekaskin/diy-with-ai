import type { Locale } from './types';
export const locales: Locale[] = ['de', 'en'];
export const isLocale = (value: string): value is Locale => value === 'de' || value === 'en';
export const tr = (locale: Locale, de: string, en: string) => locale === 'de' ? de : en;
export const copy = {
  de: {
    guides: 'Die Anleitungen', how: 'So funktioniert’s', about: 'Von mir für dich', start: 'Website selbst bauen',
    eyebrow: 'Weniger Technikfrust. Mehr selbst geschafft.', title: 'Das kriegst du', titleEnd: 'selbst hin.',
    intro: 'Praktische Cheatsheets. Klare KI-Anweisungen. Löse echte Business-Probleme – ohne die Agenturrechnung.',
    description: 'Meine Schritt-für-Schritt-Anleitungen machen aus „Wo fange ich an?“ ein „Hab ich gemacht.“ Deine KI übernimmt die Technik. Du behältst die Kontrolle.',
    ownership: 'Deine Konten. Dein Code. Dein Ergebnis.', guideTitle: 'Dein nächstes „Hab ich gemacht.“',
    guideIntro: 'Ein echtes Problem, ein klarer Weg. Wir starten mit deiner eigenen Business-Website.',
    website: 'Eine Website für dein Business.', websiteSub: 'Von der ersten Idee bis zur eigenen Internetadresse. Mit KI, verständlichen Schritten und dir am Steuer.',
    websiteDetail: 'Sag, wo du stehst. Kopiere dann bei jedem Schritt einen fertigen Prompt in deine KI. Sie installiert, baut, prüft und stellt alles online.',
    available: 'Die vollständige Anleitung', three: '6 kurze Schritte', time: 'In deinem Tempo', guideCta: 'Anleitung öffnen',
    soon: 'Für später geplant', appointments: 'Weniger Termin-Pingpong.', appointmentsSub: 'Buchungen und Bestätigungen endlich einfacher organisieren.',
    sheets: 'Ordnung ins Zahlenchaos.', sheetsSub: 'Aus unübersichtlichen Tabellen werden nützliche Berichte.',
    howTitle: 'Du musst nicht alles verstehen.', howEnd: 'Nur den nächsten Schritt.',
    phases: ['Sag, wo du stehst.', 'Prompt kopieren.', 'Deine KI macht den Rest.'],
    phaseDescriptions: ['Welcher Computer, welche KI, schon etwas installiert? Vier Klicks, dann passt alles zu dir.', 'Bei jedem Schritt gibt es einen fertigen Text. Kopieren, bei deiner KI einfügen, Enter.', 'Sie installiert, fragt dich nach deinem Business, baut, zeigt dir alles und stellt es erst nach deinem OK online.'],
    aboutTitle: 'Ein bisschen Hilfe zur Selbsthilfe.', aboutText: 'Ich baue praktische Software und Automatisierungen. Hier teile ich meine Cheatsheets und konkreten KI-Anweisungen, damit du die Dinge selbst in die Hand nehmen kannst.',
    contact: 'Lieber machen lassen?', contactSub: 'Wenn du feststeckst oder deine Zeit anders nutzen möchtest: Lass uns sprechen.', portfolio: 'Zu meinem Portfolio',
    footer: 'Praktische Lösungen. Selbst gemacht. Mit KI.', privacy: 'Deine Auswahl bleibt in diesem Browser. Keine Kontenverknüpfung. Keine Analyse-Tracker.',
  },
  en: {
    guides: 'The guides', how: 'How it works', about: 'From me to you', start: 'Build your own website',
    eyebrow: 'Less tech frustration. More “I did that.”', title: 'You can do', titleEnd: 'this yourself.',
    intro: 'Practical cheatsheets. Clear AI instructions. Solve real business problems without the agency bill.',
    description: 'My step-by-step guides turn “Where do I start?” into “Done that.” Your AI handles the technical work. You stay in control.',
    ownership: 'Your accounts. Your code. Your result.', guideTitle: 'Your next “I did that.”',
    guideIntro: 'A real problem. A clear path. Starting with your own business website.',
    website: 'A website for your business.', websiteSub: 'From your first idea to your own web address. With AI, clear steps, and you in the driving seat.',
    websiteDetail: 'Tell us where you stand. Then copy one ready-made prompt into your AI at each step. It installs, builds, checks and publishes everything.',
    available: 'The complete guide', three: '6 short steps', time: 'At your own pace', guideCta: 'Open the guide',
    soon: 'Planned for later', appointments: 'Less appointment ping-pong.', appointmentsSub: 'Make bookings and confirmations easier to manage.',
    sheets: 'Make sense of your numbers.', sheetsSub: 'Turn messy spreadsheets into reports you can actually use.',
    howTitle: 'You don’t need to understand it all.', howEnd: 'Just the next step.',
    phases: ['Say where you stand.', 'Copy a prompt.', 'Your AI does the rest.'],
    phaseDescriptions: ['Which computer, which AI, anything installed yet? Four clicks and everything fits you.', 'Every step has a ready-made text. Copy it, paste it into your AI, press Enter.', 'It installs, asks about your business, builds, shows you everything and only goes live after your OK.'],
    aboutTitle: 'A little help to help yourself.', aboutText: 'I build practical software and automations. Here I share my cheatsheets and specific AI instructions so you can take things into your own hands.',
    contact: 'Prefer someone to handle it?', contactSub: 'If you get stuck or would rather spend your time elsewhere, let’s talk.', portfolio: 'Visit my portfolio',
    footer: 'Practical solutions. Made by you. With AI.', privacy: 'Your choices stay in this browser. No account connections. No analytics trackers.',
  },
};
