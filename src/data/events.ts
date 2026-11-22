import type { BankAccount, FaqItem, LineupSlot, MainEvent, VenueZone } from '../types';

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'tbc',
    bankName: 'თიბისი ბანკი',
    shortName: 'თიბისი (TBC)',
    iban: 'GE39TB7722145061100160',
  },
  {
    id: 'bog',
    bankName: 'საქართველოს ბანკი',
    shortName: 'საქართველოს ბანკი (BOG)',
    iban: 'GE33BG0000000610977511',
  },
];

export const MAIN_EVENT: MainEvent = {
  id: 'wannabe-dec-11',
  title: 'WANNABE EVENTS • ბარი „წრე“',
  subtitle: 'პარასკევის ცოცხალი როკ საღამო — Metrono, stringless და დიჯეი Nosse',
  dateLabel: '11 დეკემბერი, 2026',
  shortDate: '11.12.26',
  doorsTime: '20:00',
  dayTimeLabel: 'პარასკევი • კარის გახსნა 20:00',
  isoTargetDate: '2026-12-11T20:00:00+04:00',
  venueName: 'ბარი „წრე“',
  address: 'მიხეილ წინამძღვრიშვილის 133, თბილისი',
  onlinePrice: 25,
  doorPrice: 30,
  image: '/images/hero-concert.jpg',
  manifesto:
    '11 დეკემბერს ბარ „წრეში“ ორი ცოცხალი ბენდის სრული სეტი და ღამის ფინალი დიჯეი Nosse-სთან ერთად — ერთი ბილეთით მთელი ღამე.',
};

export const LINEUP_SLOTS: LineupSlot[] = [
  {
    id: 'doors',
    time: '20:00',
    timeRange: '20:00',
    artist: 'კარის გახსნა',
    role: 'ბარი „წრე“',
    description: 'სტუმრების მიღება, ბილეთების შემოწმება და ბარი 20:00-დან',
    image: '/images/venue-hall.jpg',
    isDoors: true,
  },
  {
    id: 'metrono',
    time: '21:00',
    timeRange: '21:00 – 22:00',
    artist: 'Metrono',
    role: 'ბენდი',
    description: '21:00-დან 22:00-მდე • ცოცხალი როკ სეტი',
    image: '/images/artist-metrono.jpg',
    isHeadliner: true,
  },
  {
    id: 'stringless',
    time: '22:30',
    timeRange: '22:30 – 00:30',
    artist: 'stringless',
    role: 'ბენდი',
    description: '22:30-დან 00:30-მდე • ორსაათიანი ლაივ პროგრამა',
    image: '/images/artist-stringless.jpg',
    isHeadliner: true,
  },
  {
    id: 'nosse',
    time: '01:00',
    timeRange: '01:00 – till end',
    artist: 'Nosse',
    role: 'დიჯეი',
    description: '01:00-დან till end • ღამის სეტი დასრულებამდე',
    image: '/images/artist-nosse.jpg',
    isDj: true,
  },
];

export const HERO_CAROUSEL_SLIDES = [
  {
    id: 'main-night',
    badge: '11.12.26',
    tag: 'LIVE',
    eyebrow: 'TBILISI // TSINAMDZGVRISHVILI 133',
    title: 'WANNABE • ბარი „წრე“',
    meta: 'თბილისი, 20:00 | მიხეილ წინამძღვრიშვილის 133',
    image: '/images/hero-concert.jpg',
  },
  {
    id: 'metrono-slide',
    badge: '21:00 – 22:00',
    tag: 'BAND',
    eyebrow: 'LIVE PERFORMANCE',
    title: 'ბენდი Metrono',
    meta: '21:00-დან 22:00-მდე • ბარი „წრე“',
    image: '/images/artist-metrono.jpg',
  },
  {
    id: 'stringless-slide',
    badge: '22:30 – 00:30',
    tag: 'BAND',
    eyebrow: 'LIVE PERFORMANCE',
    title: 'ბენდი stringless',
    meta: '22:30-დან 00:30-მდე • ბარი „წრე“',
    image: '/images/artist-stringless.jpg',
  },
  {
    id: 'nosse-slide',
    badge: '01:00 – till end',
    tag: 'DJ SET',
    eyebrow: 'LATE NIGHT SESSION',
    title: 'დიჯეი Nosse',
    meta: '01:00-დან till end • ბარი „წრე“',
    image: '/images/artist-nosse.jpg',
  },
];

export const HOW_TO_BUY_STEPS = [
  {
    step: '01',
    title: 'აირჩიე ბილეთის რაოდენობა',
    description:
      'მოქმედებს მხოლოდ 1 ტიპის ბილეთი — ონლაინ ყიდვისას ფასია 25 ₾, ხოლო კარზე (ივენთის დღეს) 30 ₾.',
    meta: 'ონლაინ 25 ₾ • კარზე 30 ₾',
  },
  {
    step: '02',
    title: 'შეიყვანე შენი მონაცემები',
    description:
      'მიუთითე სახელი, გვარი, ელ-ფოსტა და ტელეფონის ნომერი. ბილეთი ფორმდება შენს სახელზე.',
    meta: '11 დეკემბერი, 20:00',
  },
  {
    step: '03',
    title: 'გადმორიცხე თიბისიზე ან საქართველოზე',
    description:
      'დააკოპირე სასურველი ბანკის ანგარიში (TBC ან BOG), გადმორიცხე თანხა და დანიშნულებაში ჩაწერე სახელი და გვარი.',
    meta: 'TBC & საქართველოს ბანკი',
  },
  {
    step: '04',
    title: 'მოდი ბარ „წრეში“',
    description:
      'მიიღე ციფრული QR ჯავშანი ეკრანზე და მოდი 11 დეკემბერს 20:00 საათიდან მიხეილ წინამძღვრიშვილის 133-ში.',
    meta: 'მ. წინამძღვრიშვილის 133',
  },
];

export const VENUE_INFO = {
  name: 'ბარი „წრე“',
  district: 'ჩუღურეთი • თბილისი',
  address: 'მიხეილ წინამძღვრიშვილის 133, თბილისი',
  coordsText: '41.7197° N, 44.7937° E',
  coordsCopy: '41.7197019, 44.7937026',
  lat: 41.7197019,
  lng: 44.7937026,
  mapsUrl: 'https://maps.app.goo.gl/V3FtfgoAEfKXqWN79',
  logistics: [
    { label: 'მისამართი', value: 'მიხეილ წინამძღვრიშვილის 133' },
    { label: 'თარიღი და დრო', value: '11 დეკემბერი, 2026 • კარის გახსნა 20:00' },
    { label: 'მეტრო', value: 'მ. სადგურის მოედანი (6–8 წთ ფეხით)' },
    { label: 'ბილეთის ფასი', value: '25 ₾ ონლაინ წინასწარ • 30 ₾ კარზე' },
    { label: 'პროგრამა', value: 'Metrono • stringless • დიჯეი Nosse (till end)' },
  ],
};

export const VENUE_ZONES: VenueZone[] = [
  {
    id: 'stage',
    name: 'სცენა (Live Stage)',
    tag: '21:00 – 00:30',
    capacityNote: 'Metrono & stringless',
    description:
      'ცოცხალი ბენდების მთავარი სცენა: 21:00–22:00 Metrono, ხოლო 22:30–00:30 stringless.',
  },
  {
    id: 'hall',
    name: 'ბარი „წრე“ — მთავარი დარბაზი',
    tag: 'ერთიანი ბილეთი',
    capacityNote: '25 ₾ ონლაინ / 30 ₾ კარზე',
    description:
      'ერთიანი საკონცერტო სივრცე ბარიერების გარეშე — თითოეული ბილეთი იძლევა სრულ წვდომას მთელ ღამეზე.',
  },
  {
    id: 'dj',
    name: 'DJ პულტი • Nosse',
    tag: '01:00 – till end',
    capacityNote: 'ღამის გაგრძელება',
    description:
      'ბენდების დასრულების შემდეგ, 01:00-დან იწყება დიჯეი Nosse-ს სეტი დასრულებამდე (till end).',
  },
  {
    id: 'bar',
    name: 'ბარის დახლი',
    tag: 'BAR AREA',
    capacityNote: 'ღიაა 20:00-დან',
    description: 'სასმელების მთავარი ბარი დარბაზის გვერდით, მუდმივი წვდომით მთელი ღამის განმავლობაში.',
  },
  {
    id: 'entrance',
    name: 'შესასვლელი (წინამძღვრიშვილის 133)',
    tag: 'DOORS 20:00',
    capacityNote: 'ონლაინ QR / კარზე 30 ₾',
    description:
      'კარი იხსნება 20:00-ზე. ონლაინ შეძენილი 25 ₾ ბილეთების შემოწმება და კარზე ბილეთის შეძენა 30 ₾-ად.',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'ბილეთები',
    question: 'რა ღირს ბილეთი და არის თუ არა სხვადასხვა კატეგორია?',
    answer:
      'არის მხოლოდ 1 ტიპის ერთიანი ბილეთი. ონლაინ წინასწარ ყიდვისას ბილეთი ღირს 25 ₾, ხოლო კარზე (11 დეკემბერს) — 30 ₾.',
  },
  {
    id: 'faq-2',
    category: 'ბილეთები',
    question: 'როგორ გადავიხადო ბილეთის თანხა ონლაინ?',
    answer:
      'საიტზე აირჩიე ბილეთების რაოდენობა (25 ₾ თითო), შეიყვანე შენი სახელი, გვარი, მეილი და ნომერი, და გადმორიცხე თანხა თიბისის (GE39TB7722145061100160) ან საქართველოს ბანკის (GE33BG0000000610977511) ანგარიშზე. დანიშნულებაში აუცილებლად მიუთითე სახელი და გვარი.',
  },
  {
    id: 'faq-3',
    category: 'ბილეთები',
    question: 'რა ჩავწერო საბანკო გადარიცხვის დანიშნულებაში?',
    answer:
      'დანიშნულებაში მიუთითე: „Wannabe 11.12 - შენი სახელი და გვარი“. ბილეთის გაფორმების ფანჯარაში დანიშნულების ტექსტი ავტომატურად იქმნება ერთი კლიკით დასაკოპირებლად.',
  },
  {
    id: 'faq-4',
    category: 'ლაინაფი',
    question: 'რა დროს იწყება ივენთი და ვინ უკრავს?',
    answer:
      'კარი იხსნება 11 დეკემბერს 20:00 საათზე. 21:00–22:00 დაუკრავს ბენდი Metrono, 22:30–00:30 — ბენდი stringless, ხოლო 01:00-დან — დიჯეი Nosse (till end).',
  },
  {
    id: 'faq-5',
    category: 'ლაინაფი',
    question: 'რამდენ ხანს გაგრძელდება დიჯეი Nosse-ს სეტი?',
    answer:
      'დიჯეი Nosse იწყებს 01:00 საათზე და უკრავს till end — სეტის დასრულების ზუსტი დრო საღამოს ატმოსფეროზეა დამოკიდებული.',
  },
  {
    id: 'faq-6',
    category: 'ლოკაცია',
    question: 'სად მდებარეობს ბარი „წრე“ და როგორ მოვიდე?',
    answer:
      'მისამართია მიხეილ წინამძღვრიშვილის 133, თბილისი. უახლოესი მეტროა „სადგურის მოედანი“ (დაახლოებით 6–8 წუთი ფეხით). ასევე მარტივად მოხვალ მარჯანიშვილის მხრიდან.',
  },
  {
    id: 'faq-7',
    category: 'შესვლა',
    question: 'კარზე ბილეთის შეძენა შესაძლებელი იქნება?',
    answer:
      'დიახ, კარის გახსნის შემდეგ (20:00-დან) ადგილზე ბილეთის შეძენა შესაძლებელი იქნება 30 ₾-ად. ონლაინ წინასწარ შეძენით კი იხდი 25 ₾-ს.',
  },
];
