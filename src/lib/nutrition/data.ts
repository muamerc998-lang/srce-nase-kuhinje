/**
 * Prosječne nutritivne vrijednosti namirnica na 100 g (jestivi dio, sirovo ako nije drugačije navedeno).
 * Izvor: USDA FoodData Central (SR Legacy / Foundation), zaokruženo. Služi samo za PROCJENU na stranici recepta.
 *
 * - density: g po ml, za kuhinjske mjere i zapreminu (kašika 15 ml, kašičica 5 ml, šolja 240 ml)
 * - pieces: g po komadu za brojive jedinice ('bez' = komad bez jedinice, npr. „2 jaja“)
 * - negligible: začini, voda i slično; računaju se kao 0, ali se ne smatraju nepoznatim
 * - edible: udio jestivog dijela kad je količina data s kostima (cijelo pile)
 *
 * Nova namirnica u receptu bez reda ovdje → kalkulator se za taj recept ne prikazuje (nema nagađanja).
 */
export interface NutritionPer100 {
  kcal: number
  protein: number
  carbs: number
  fat: number
  density?: number
  pieces?: Record<string, number>
  negligible?: boolean
  edible?: number
}

const n = (kcal: number, protein: number, carbs: number, fat: number, extra: Partial<NutritionPer100> = {}): NutritionPer100 => ({ kcal, protein, carbs, fat, ...extra })
const zero: NutritionPer100 = { kcal: 0, protein: 0, carbs: 0, fat: 0, negligible: true }

export const NUTRITION: Record<string, NutritionPer100> = {
  // jaja, mliječno
  jaja: n(143, 12.6, 0.7, 9.5, { pieces: { bez: 50, kom: 50 } }),
  mlijeko: n(61, 3.2, 4.8, 3.3, { density: 1.03 }),
  maslac: n(717, 0.9, 0.1, 81, { density: 0.95 }),
  'kisela-pavlaka': n(198, 2.4, 4.6, 19.4, { density: 1.0 }),
  'slatka-pavlaka': n(340, 2.8, 2.7, 36, { density: 1.0 }),
  feta: n(264, 14.2, 4.1, 21.3),
  'svjezi-sir': n(98, 11.1, 3.4, 4.3),
  rikota: n(174, 11.3, 3, 13),
  mascarpone: n(435, 6, 3, 44),
  'tvrdi-sir': n(380, 25, 2, 30, { density: 0.42 }),
  mocarela: n(300, 22, 2.2, 22, { density: 0.47 }),
  majoneza: n(680, 1, 0.6, 75, { density: 0.93 }),
  'krem-sir': n(342, 6, 4.1, 34),

  // brašno, šećer, pečenje
  'glatko-brasno': n(364, 10.3, 76.3, 1, { density: 0.53 }),
  secer: n(387, 0, 100, 0, { density: 0.85 }),
  'vanilin-secer': n(390, 0, 98, 0, { density: 0.8, pieces: { kesica: 10 } }),
  'secer-u-prahu': n(389, 0, 99.8, 0, { density: 0.5 }),
  dzem: n(278, 0.4, 68.9, 0.1, { density: 1.3 }),
  'cokolada-za-kuhanje': n(515, 5.5, 60, 31),
  keks: n(440, 7, 72, 14),
  med: n(304, 0.3, 82.4, 0, { density: 1.42 }),
  kakao: n(228, 19.6, 57.9, 13.7, { density: 0.42 }),
  'cokoladne-kapljice': n(480, 4.2, 63.9, 30),
  'prasak-za-pecivo': n(53, 0, 28, 0, { density: 0.92, pieces: { kesica: 12 } }),
  kvasac: n(325, 40.4, 41.2, 7.6, { density: 0.6 }),
  'ekstrakt-vanilije': n(288, 0.1, 12.7, 0.1, { density: 0.88 }),
  'kore-za-pitu': n(299, 7.1, 52.6, 6, { pieces: { paket: 500 } }),
  piskote: n(365, 10.6, 59.7, 9.1),
  // svježi listovi (u receptima je svježa varijanta prva)
  'listovi-za-lazanje': n(288, 11.3, 54.7, 2.3),
  'rezanci-za-supu': n(384, 14.2, 71.3, 4.4),
  riza: n(360, 6.6, 79.3, 0.6, { density: 0.8 }),
  hljeb: n(266, 8.9, 49.4, 3.3, { pieces: { kriska: 30 } }),

  // masnoće
  ulje: n(884, 0, 0, 100, { density: 0.92 }),
  'maslinovo-ulje': n(884, 0, 0, 100, { density: 0.92 }),

  // meso
  'mljeveno-meso': n(215, 18.6, 0, 15),
  piletina: n(215, 17, 0, 16, { density: 0.58 }),
  pile: n(215, 18.6, 0, 15.1, { edible: 0.68 }),
  junetina: n(175, 20, 0, 10),
  'suho-meso': n(153, 31.1, 2.8, 1.9),
  sunka: n(163, 16.6, 3.8, 8.6),

  // povrće i voće
  krompir: n(77, 2, 17.5, 0.1, { pieces: { bez: 170, kom: 170 } }),
  mrkva: n(41, 0.9, 9.6, 0.2, { pieces: { bez: 70, kom: 70 } }),
  'crni-luk': n(40, 1.1, 9.3, 0.1, { pieces: { glavica: 110, bez: 110, kom: 110 } }),
  'crveni-luk': n(40, 1.1, 9.3, 0.1, { pieces: { glavica: 110, bez: 110, kom: 110 } }),
  'bijeli-luk': n(149, 6.4, 33.1, 0.5, { pieces: { cesanj: 4, glavica: 40 } }),
  'celer-stabljika': n(16, 0.7, 3, 0.2, { pieces: { struk: 40 } }),
  'celer-korijen': n(42, 1.5, 9.2, 0.3),
  'cherry-paradajz': n(18, 0.9, 3.9, 0.2),
  paradajz: n(18, 0.9, 3.9, 0.2, { pieces: { bez: 120, kom: 120 } }),
  'paradajz-iz-konzerve': n(24, 1.2, 4.6, 0.3),
  'paradajz-pire': n(38, 1.7, 9, 0.2, { density: 1.05 }),
  'koncentrat-paradajza': n(82, 4.3, 18.9, 0.5, { density: 1.1 }),
  paprika: n(26, 1, 6, 0.3, { pieces: { bez: 120, kom: 120 } }),
  spinat: n(23, 2.9, 3.6, 0.4),
  grasak: n(77, 5.2, 13.6, 0.4),
  'kiseli-krastavci': n(12, 0.3, 2.3, 0.2),
  'kiseli-kupus': n(19, 0.9, 4.3, 0.1),
  bamija: n(33, 1.9, 7.5, 0.2),
  jabuke: n(52, 0.3, 13.8, 0.2, { pieces: { bez: 150, kom: 150 } }),
  orasi: n(654, 15.2, 13.7, 65.2, { density: 0.37 }),
  limun: n(22, 0.4, 6.9, 0.2, { density: 1.0, pieces: { bez: 30, kom: 30 } }),

  // doručak i dodaci
  'bademovo-mlijeko': n(15, 0.6, 0.3, 1.1, { density: 1.0 }),
  'chia-sjemenke': n(486, 16.5, 42.1, 30.7, { density: 0.8 }),
  'javorov-sirup': n(260, 0, 67, 0.1, { density: 1.32 }),
  'grcki-jogurt': n(97, 9, 3.6, 5),
  jogurt: n(61, 3.5, 4.7, 3.3, { density: 1.03 }),
  granola: n(471, 10, 64, 20, { density: 0.5 }),
  borovnice: n(57, 0.7, 14.5, 0.3, { density: 0.6 }),
  maline: n(52, 1.2, 11.9, 0.7, { density: 0.5 }),
  mak: n(525, 18, 28.1, 41.6),
  griz: n(360, 12.7, 72.8, 1.1),
  'lisnato-tijesto': n(551, 7.4, 45.1, 38.1),
  gustin: n(381, 0.3, 91.3, 0.1, { density: 0.6 }),
  zelatina: n(335, 85.6, 0, 0.1),
  'soda-bikarbona': zero,

  'evaporirano-mlijeko': n(134, 6.8, 10, 7.6, { density: 1.07 }),
  'kondenzovano-mlijeko': n(321, 7.9, 54.4, 8.7, { density: 1.3 }),
  'puding-u-prahu': n(350, 0.3, 86, 0.1, { density: 0.6 }),
  'samodizajuce-brasno': n(354, 9.9, 74.2, 1, { density: 0.53 }),
  kokos: n(660, 6.9, 23.7, 64.5, { density: 0.35 }),
  bademi: n(579, 21.2, 21.6, 49.9),
  'zobene-pahuljice': n(379, 13.2, 67.7, 6.5, { density: 0.37 }),
  'vinski-kamen': zero,

  // tekućine
  'crno-vino': n(85, 0.1, 2.6, 0, { density: 0.99 }),
  'pileci-temeljac': n(6, 0.6, 0.4, 0.2, { density: 1.0 }),
  liker: n(330, 0, 35, 0, { density: 1.05 }),
  senf: n(66, 4.4, 5.8, 3.3, { density: 1.0 }),
  'jabukovo-sirce': zero,
  sirce: zero,
  'worcestershire-sos': zero,
  kafa: zero,
  voda: zero,
  'mineralna-voda': zero,

  // začini i bilje (male količine)
  so: zero,
  biber: zero,
  'biber-u-zrnu': zero,
  'aleva-paprika': n(282, 14.1, 54, 12.9, { density: 0.46 }),
  'zacin-za-supu': zero,
  lovor: zero,
  'majcina-dusica': zero,
  origano: zero,
  cimet: zero,
  'muskatni-orascic': zero,
  persun: zero,
  bosiljak: zero,
  vlasac: zero,
  majoran: zero,
  kim: zero,
  'ljuta-aleva-paprika': zero,
}

/** Kuhinjske mjere u ml. */
export const MEASURE_ML: Record<string, number> = { kasika: 15, kasicica: 5, solja: 240, casa: 200, prstohvat: 0.3 }

/**
 * Recepti za koje se procjena ne prikazuje, jer se dio sastojaka ne pojede
 * (temeljac od cijelog pileta, ulje za prženje, sirup u kojem se kuha voće).
 */
export const NUTRITION_EXCLUDED = new Set(['pileca-supa', 'begova-corba', 'cufte-u-sosu', 'tufahije', 'domace-krofne', 'brze-fritule-s-jogurtom'])
