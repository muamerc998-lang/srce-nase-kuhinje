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
HR = r'\b(češnjak\w*|rajčic\w*|krumpir\w*|pećnic\w*|žlic\w*|žličic\w*|umak(a|u|om|e|ovi|ima)?|juh\w*|papar|papra|sol|kruh\w*|vrhnj\w*|tijekom|blagdan\w*|obitelj\w*|tjed\w*|tekućin\w*|toplin\w*|tanjur\w*|hladnjak\w*|peršin\w*|kapul\w*|ploške|zdjel\w*|ručnik\w*|kutljač\w*|mozzarell\w*|ricott\w*|kadulj\w*|timijan\w*|šalic\w*)\b'
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
LIMITS = [
    ('rečenica o prilogu na kraju („Uz … ide/poslužite/služe se“)', lambda r: bool(re.match(r'^Uz\b.*\b(ide|idu|poslužite|služe se|odgovara)', last_par(r))), 1, 5),
    ('naslov „Kad nešto ne ide…“', lambda r: any(re.match(r'Kad nešto ne ide', t) for t in titles(r)), 1, None),
    ('naslov „Šta se (najčešće) pita…“', lambda r: any(re.match(r'Šta se (najčešće )?pita', t) for t in titles(r)), 1, None),
    ('„Tri situacije/problema … najčešće“', lambda r: bool(re.search(r'Tri (situacije|problema)[^.]*najčešć|Tri (situacije|problema)[^.]*češće', art(r))), 1, None),
    ('„jedna tava / jednoj tavi“ u uvodu', lambda r: bool(re.search(r'\bjedn(a|oj|u) tav', intro(r), re.I)), 1, 10),
    ('„radni dan“', lambda r: 'radni dan' in art(r).lower() or 'radni dan' in r['summary'].lower(), 1, 5),
    ('ulaz „skoro uvijek / najčešće / gotovo uvijek“', lambda r: bool(re.search(r'skoro uvijek|najčešće|gotovo uvijek', intro(r), re.I)), 1, 5),
    ('sekcija razbijena na H3 podnaslove', lambda r: any(a['level'] == 'h3' for a in r['article']), 1, 5),
    ('naslov (H2 ili H3) u obliku pitanja', lambda r: any((a['title'] or '').rstrip().endswith('?') for a in r['article']), 2, 5),
]
PER_AUTHOR = [('lični detalj „kod nas“', lambda r: bool(re.search(r'\b[Kk]od nas\b', art(r))), 1, 5)]

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
    hr = sorted(set(m.lower() for m in re.findall(HR, txt, re.I)))
    if hr: issues.append(f'hrvatske riječi: {hr}')
    inf = [s['text'][:40] for g in r['stepGroups'] for s in g['steps'] if re.match(r'^\w+(ti|ći)\b', s['text'])]
    if inf: issues.append(f'infinitiv u koracima: {inf}')
    if '!' in txt: issues.append('uskličnik')
    for lvl in ('h2', 'h3'):
        qn = sum(1 for a in r['article'] if a['level'] == lvl and (a['title'] or '').rstrip().endswith('?'))
        if qn > 1: issues.append(f'{lvl.upper()} u obliku pitanja: {qn} (najviše 1 po receptu)')
    bad = re.findall(BANNED, txt, re.I)
    if bad: issues.append(f'zabranjene fraze: {bad}')
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

print(f"\n{'Sve u redu.' if not problems else f'Za pregled: {problems}'}")
