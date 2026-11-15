"""
Provjera tekstova recepata (PREPIS-NASIRECEPTI.md §6, PRAVILA-BRIEFA.md §5).

    python -I scripts/provjera-tekstova.py content/recepti/nasirecepti-*.json [--xml nasirecepti.WordPress.xml]

Recepti se čitaju redom kojim su u fajlovima (= redoslijed iz loga). Provjera samo JAVLJA;
tekst se popravlja po smislu, nikad ubacivanjem rečenica samo da bi provjera prošla.

Po receptu: SEO dužine, hrvatske riječi, infinitiv u koracima, uskličnici i zabranjene fraze,
broj H2/H3, dužina teksta, zadnja rečenica (za log) i, uz --xml, rečenice iz starog posta (5-grami).
Kroz seriju: ponovljeni 6-grami između recepata i granice šablona (vidi LIMITS).
"""
import sys, json, re, html, collections, io
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')
args = sys.argv[1:]
xmlf = None
if '--xml' in args:
    i = args.index('--xml'); xmlf = args[i + 1]; del args[i:i + 2]
recs = [r for f in args for r in json.load(io.open(f, encoding='utf-8'))['recipes']]

w = lambda t: re.findall(r'\w+', t.lower())
unlink = lambda t: re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', t)
HR = r'\b(češnjak\w*|rajčic\w*|krumpir\w*|pećnic\w*|žlic\w*|žličic\w*|umak(a|u|om|e|ovi|ima)?|juh\w*|papar|papra|sol|kruh\w*|vrhnj\w*|tijekom|blagdan\w*|obitelj\w*|tjed\w*|tekućin\w*|toplin\w*|tanjur\w*|hladnjak\w*|peršin\w*|kapul\w*|ploške|zdjel\w*|ručnik\w*|kutljač\w*|mozzarell\w*|ricott\w*|kadulj\w*|timijan\w*|šalic\w*|stol|kopar\w*)\b'
BANNED = r'savršen\w*|fantastič\w*|bogat okus|uživajte|zaključ\w*|u svijetu kulinarstva|bilo da ste|zaronimo|nema ništa bolje'

old = {}
if xmlf:
    ns = {'wp': 'http://wordpress.org/export/1.2/', 'content': 'http://purl.org/rss/1.0/modules/content/'}
    for it in ET.parse(xmlf).getroot().iter('item'):
        m = {x.find('wp:meta_key', ns).text: (x.find('wp:meta_value', ns).text or '') for x in it.findall('wp:postmeta', ns)}
        old[it.find('wp:post_id', ns).text] = html.unescape(re.sub(r'<[^>]+>', ' ', (it.find('content:encoded', ns).text or '') + ' ' + ' '.join(m.get(f'step_{i}_opis', '') for i in range(1, 6)) + ' ' + m.get('rank_math_description', '') + ' ' + m.get('rank_math_title', '')))

# Granice šablona: (naziv, funkcija(recept)->bool, najviše, prozor) — prozor None = cijeli skup
def intro(r): return unlink(r['article'][0]['body']) if r['article'] else ''
def last_par(r): return unlink(r['article'][-1]['body']).split('\n\n')[-1] if r['article'] else ''
def art(r): return unlink(' '.join(a['body'] for a in r['article']))
def titles(r): return [a['title'] or '' for a in r['article']]
def sentences(t): return [s for s in re.split(r'(?<=[.!?])\s+|\n+', unlink(t)) if s.strip()]
def intro2(r): return ' '.join(sentences(intro(r))[:2])
NUM_TITLE = r'\d|\b(pola|četvrt|jedan|jedna|jedno|dva|dvije|tri|četiri|pet|šest|sedam|osam|devet|deset|dvadeset|trideset|sat|sata|sati|minut\w*)\b'
ORDER_TITLE = r'\b(prvo|prvi|prva|tek|zadnj\w*|na kraju)\b'
# Pregled NR-026–042 (2026-11-16): nova ograničenja kroz seriju
LIMITS_2 = [
    ('uvod kvar → uzrok („obično je“, „nastaje kad“ u prve 2 rečenice)', lambda r: bool(re.search(r'obično je|nastaje kad', intro2(r), re.I)), 1, 5),
    ('uvod „ovdje nije … nego“ / „ovdje je … a ne“', lambda r: bool(re.search(r'ovdje (nije|je)\b[^.]*\b(nego|a ne)\b', intro(r), re.I)), 1, 5),
    ('naslov s redoslijedom („prvo“, „tek“, „zadnji“, „na kraju“)', lambda r: any(re.search(ORDER_TITLE, t, re.I) for t in titles(r)), 1, 5),
    ('naslov „Koliko …?“', lambda r: any(t.startswith('Koliko') and t.rstrip().endswith('?') for t in titles(r)), 1, 10),
    ('naslov „… mora / moraju biti …“', lambda r: any(re.search(r'\bmora(ju)? biti\b', t, re.I) for t in titles(r)), 1, 5),
    ('„i sutradan“ / „do sutra“ u zadnjem pasusu', lambda r: bool(re.search(r'i sutradan|do sutra', last_par(r), re.I)), 1, 10),
]
# ograničenja iz pregleda NR-026–042 računaju se od NR-026 (stariji objavljeni tekstovi se ne prepravljaju zbog prozora)
def nr(r):
    m = re.search(r'(\d+)$', r.get('planId') or '')
    return int(m.group(1)) if m else 0
LIMITS_2 = [(n, (lambda f: (lambda r: nr(r) >= 26 and f(r)))(f), mx, win) for n, f, mx, win in LIMITS_2]
LIMITS = [
    ('rečenica o prilogu na kraju („Uz … ide/poslužite/služe se“)', lambda r: bool(re.match(r'^Uz\b.*\b(ide|idu|poslužite|služe se|odgovara)', last_par(r))), 1, 5),
    ('naslov „Kad nešto ne ide…“', lambda r: any(re.match(r'Kad nešto ne ide', t) for t in titles(r)), 1, None),
    ('naslov „Šta se (najčešće) pita…“', lambda r: any(re.match(r'Šta se (najčešće )?pita', t) for t in titles(r)), 1, None),
    ('„Tri situacije/problema … najčešće“', lambda r: bool(re.search(r'Tri (situacije|problema)[^.]*najčešć|Tri (situacije|problema)[^.]*češće', art(r))), 1, None),
    ('„jedna tava / jednoj tavi“ u uvodu', lambda r: bool(re.search(r'\bjedn(a|oj|u) tav', intro(r), re.I)), 1, 10),
    ('„radni dan“', lambda r: 'radni dan' in art(r).lower() or 'radni dan' in r['summary'].lower(), 1, 5),
    ('ulaz „skoro uvijek / najčešće / gotovo uvijek“', lambda r: bool(re.search(r'skoro uvijek|najčešće|gotovo uvijek', intro(r), re.I)), 1, 5),
    ('sekcija razbijena na H3 podnaslove', lambda r: any(a['level'] == 'h3' for a in r['article']), 1, 5),
    ('kraj o ostacima i podgrijavanju', lambda r: bool(re.search(r'podgrija|\bostat(ak|ke|ci)\b[^.]*(frižider|čuva|drži)|zagrijava[^.]*(temeljc|vod)', last_par(r), re.I)), 1, 5),
    ('H2 u obliku „… se …, ne …“', lambda r: any(re.search(r'\bse\b[^,]*, ne \w', a['title'] or '') for a in r['article'] if a['level'] == 'h2'), 1, 10),
    ('naslov (H2 ili H3) u obliku pitanja', lambda r: any((a['title'] or '').rstrip().endswith('?') for a in r['article']), 2, 5),
] + LIMITS_2
EMIR_FOND = r'\b(taman|malo-pomalo|polahko|fino)\b'
MI_BISMO = r'\b[Mm]i bismo\b'
REGIJA = r'Slavonij|Baranj|Dalmacij|Kvarner|Hercegovin|Bosn|bosansk|Srbij|srpsk|po krajevima|u krajevima|na obali|tradicij'
def nr(r):
    m = re.search(r'(\d+)$', r.get('planId') or '')
    return int(m.group(1)) if m else 0
PER_AUTHOR = [
    ('lični detalj „kod nas“', lambda r: bool(re.search(r'\b[Kk]od nas\b', art(r))), 1, 5),
    ('„mi bismo“', lambda r: bool(re.search(MI_BISMO, art(r))), 2, 5),
    # pravilo od 2026-11-15 (pregled NR-020–025): računa se od NR-020 nadalje
    ('uvod kroz kraj, tradiciju ili naziv po krajevima', lambda r: nr(r) >= 20 and r['authors'][0] == 'urednistvo' and bool(re.search(REGIJA, intro(r))), 1, 5),
    ('lični detalj „kod mene“', lambda r: bool(re.search(r'\b[Kk]od mene\b', art(r))), 1, 5),
    ('stav „uzimam / ne uzimam“', lambda r: bool(re.search(r'\b[Uu]zimam\b', art(r))), 1, 5),
]

problems = 0
alltxt = {}
for r in recs:
    arts = art(r)
    txt = ' '.join([r['summary'], r.get('beforeYouStart') or ''] + [a['body'] + ' ' + (a['title'] or '') for a in r['article']] + [s['text'] for g in r['stepGroups'] for s in g['steps']])
    segs = [r['summary'], r.get('beforeYouStart') or ''] + [p for a in r['article'] for p in unlink(a['body']).split('\n\n')] + [a['title'] or '' for a in r['article']] + [s['text'] for g in r['stepGroups'] for s in g['steps']]
    alltxt[r['slug']] = [w(x) for x in segs]
    sents = [s for s in re.split(r'(?<=[.!?])\s+|\n+', arts) if s.strip()]
    L = [len(w(s)) for s in sents] or [0]
    h2 = sum(1 for a in r['article'] if a['level'] == 'h2' and a['title'])
    h3 = sum(1 for a in r['article'] if a['level'] == 'h3')
    print(f"{r.get('planId')} {r['slug']} · {r['authors'][0]} · {r.get('approach')} | SEO {len(r['seo']['title'])}/{len(r['seo']['description'])} | riječi {len(w(arts))} | H2 {h2} H3 {h3} | rečenice ø{round(sum(L)/len(L),1)} max {max(L)}")
    print(f"    zadnja rečenica: {sents[-1] if sents else ''}")
    print(f"    H2 pitanja: {sum(1 for a in r['article'] if a['level'] == 'h2' and (a['title'] or '').rstrip().endswith('?'))}")
    issues = []
    if not 45 <= len(r['seo']['title']) <= 60: issues.append('SEO naslov izvan 45–60')
    if not 140 <= len(r['seo']['description']) <= 160: issues.append('meta opis izvan 140–160')
    hr = sorted(set(m.group(0).lower() for m in re.finditer(HR, txt, re.I)))
    if hr: issues.append(f'hrvatske riječi: {hr}')
    inf = [s['text'][:40] for g in r['stepGroups'] for s in g['steps'] if re.match(r'^\w+(ti|ći)\b', s['text'])]
    if inf: issues.append(f'infinitiv u koracima: {inf}')
    if '!' in txt: issues.append('uskličnik')
    mb = len(re.findall(MI_BISMO, arts))
    if mb > 1: issues.append(f'„mi bismo“ {mb} puta (najviše 1 po tekstu)')
    for lvl in ('h2', 'h3'):
        qn = sum(1 for a in r['article'] if a['level'] == lvl and (a['title'] or '').rstrip().endswith('?'))
        if qn > 1: issues.append(f'{lvl.upper()} u obliku pitanja: {qn} (najviše 1 po receptu)')
    bad = re.findall(BANNED, txt, re.I)
    if bad: issues.append(f'zabranjene fraze: {bad}')
    if re.search(r'zato ovaj recept|dvije stvari|dvije pomoći', txt, re.I): issues.append('„Zato ovaj recept“ / „dvije stvari“ / „dvije pomoći“ (zabranjeno)')
    nt = [t for t in titles(r) if re.search(NUM_TITLE, t, re.I)]
    if len(nt) > 1: issues.append(f'naslovi s brojem ili vremenom: {nt} (najviše 1 po tekstu)')
    for a in r['article']:
        t = a['title'] or ''
        if t.startswith('Koliko') and t.endswith('?'):
            first = (w(a['body']) or [''])[0]
            if first in w(t): issues.append(f'odgovor na „{t}“ počinje riječju iz pitanja („{first}“)')
    zato = sum(1 for s in sentences(arts) if re.match(r'Zato\b', s))
    if zato > 1: issues.append(f'„Zato“ na početku rečenice {zato} puta (najviše 1 po tekstu)')
    KO = r'\b[Kk]o (voli|ima|želi|ga|je|joj|hoće)\b'
    ko = len(re.findall(KO, arts))
    if ko > 1: issues.append(f'„ko voli / ko ima …“ {ko} puta (najviše 1 po tekstu)')
    card = [s['text'] for g in r['stepGroups'] for s in g['steps']]
    third = [c[:50] for c in card if re.search(KO + r'|\bmože\b|\bmogu\b', c)]
    if third: issues.append(f'kartica u 3. licu („ko …“, „može“): {third}')
    warns = []
    short = [a['title'] for a in r['article'] if a['title'] and len(sentences(a['body'])) < 3]
    if short: warns.append(f'sekcija s manje od 3 rečenice: {short}')
    if r['authors'][0] != 'emir-delic':
        ef = sorted(set(m.group(0) for m in re.finditer(EMIR_FOND, arts, re.I)))
        if ef: warns.append(f'riječi Emirovog fonda kod drugog autora: {ef}')
    for x in warns: print('    ~', x)
    m = re.search(r'stari post ID (\d+)', r.get('sourceNote') or '')
    if m and m.group(1) in old:
        ow = w(old[m.group(1)]); og = {' '.join(ow[i:i+5]) for i in range(len(ow)-4)}
        hits = sorted({' '.join(sw[i:i+5]) for sw in alltxt[r['slug']] for i in range(len(sw)-4)} & og)
        if hits: issues.append(f'5-grami iz starog posta: {hits}')
    for x in issues: print('    !', x)
    problems += len(issues)

print('\nPONAVLJANJE 6-grama između recepata:')
grams = collections.defaultdict(set)
for slug, segs in alltxt.items():
    for ws in segs:
        for i in range(len(ws) - 5): grams[' '.join(ws[i:i+6])].add(slug)
rep = [(g, s) for g, s in grams.items() if len(s) > 1]
for g, s in rep: print('   ', g, '|', sorted(s))
problems += len(rep)

print('\nGRANICE ŠABLONA:')
def check(name, fn, mx, win, seq, label=''):
    global problems
    flags = [fn(r) for r in seq]
    hits = [r['slug'] for r, f in zip(seq, flags) if f]
    if win is None:
        bad = len(hits) > mx
    else:
        bad = any(sum(flags[i:i+win]) > mx for i in range(max(1, len(flags) - win + 1)))
    if bad:
        problems += 1
        print(f"  ! {name}{label}: najviše {mx}{'' if win is None else f' u {win}'} — sada: {hits}")
    elif hits:
        print(f"  ok {name}{label}: {hits}")
for name, fn, mx, win in LIMITS: check(name, fn, mx, win, recs)
by_author = collections.defaultdict(list)
for r in recs: by_author[r['authors'][0]].append(r)
for name, fn, mx, win in PER_AUTHOR:
    for a, seq in by_author.items(): check(name, fn, mx, win, seq, f' ({a})')

# Druga rečenica kratkog opisa: isti početak (prve 2 riječi) najviše 1 put u 10 recepata
def sum2(r):
    s = sentences(r['summary'])
    return ' '.join(w(s[1])[:2]) if len(s) > 1 else ''
keys = [sum2(r) for r in recs]
dup = sorted({(recs[i]['slug'], recs[j]['slug'], keys[i]) for i in range(len(recs)) for j in range(i + 1, min(i + 10, len(recs))) if keys[i] and keys[i] == keys[j]})
for a, b, k in dup:
    problems += 1
    print(f"  ! druga rečenica kratkog opisa počinje isto („{k} …“): {a}, {b}")

# Isti naslov sekcije na dva recepta na sajtu (svi content/recepti/*.json)
import glob
site = collections.defaultdict(set)
for f in glob.glob('content/recepti/*.json'):
    try:
        d = json.load(io.open(f, encoding='utf-8'))
    except Exception:
        continue
    for x in (d.get('recipes') or []) if isinstance(d, dict) else []:
        for a in x.get('article') or []:
            if a.get('title'): site[a['title'].strip().lower()].add(x['slug'])
mine = {r['slug'] for r in recs}
for t, slugs in sorted(site.items()):
    if len(slugs) > 1 and slugs & mine:
        problems += 1
        print(f"  ! isti naslov sekcije na više recepata: „{t}“ — {sorted(slugs)}")

# Isti broj sekcija kod istog autora 3 puta zaredom (upozorenje)
for a, seq in by_author.items():
    n = [sum(1 for x in r['article'] if x['level'] == 'h2' and x['title']) for r in seq]
    for i in range(len(n) - 2):
        if n[i] == n[i + 1] == n[i + 2]:
            print(f"  ~ isti broj H2 ({n[i]}) tri puta zaredom ({a}): {[r['slug'] for r in seq[i:i + 3]]}")

print(f"\n{'Sve u redu.' if not problems else f'Za pregled: {problems}'}")
