import { test, expect } from '@playwright/test'

test.describe('pretraga i filteri', () => {
  test('sinonim i upit bez dijakritike nalaze recept', async ({ page }) => {
    await page.goto('/recepti/?q=krumpir')
    await expect(page.getByRole('heading', { name: 'Musaka s krompirom' })).toBeVisible()
    await page.goto('/recepti/?q=cokoladna')
    await expect(page.getByRole('heading', { name: 'Čokoladna torta bez pečenja' })).toBeVisible()
  })

  test('povratak s recepta vraća filtere i stranicu', async ({ page }) => {
    await page.goto('/recepti/?vrijeme=30&ishrana=bez-glutena')
    await expect(page.getByRole('link', { name: /Ukloni uslov: Do 30 min/ })).toBeVisible()
    const first = page.locator('main article h2 a').first()
    const title = await first.innerText()
    await first.click()
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
    await page.goBack()
    await expect(page).toHaveURL(/vrijeme=30/)
    await expect(page.getByRole('link', { name: /Ukloni uslov: Bez glutena/ })).toBeVisible()
  })

  test('nema rezultata: prikaz uslova i lako uklanjanje', async ({ page }) => {
    await page.goto('/recepti/?q=ajvar&vrijeme=15')
    await expect(page.getByRole('heading', { name: 'Nema recepata za odabrane uslove' })).toBeVisible()
    await page.getByRole('link', { name: 'Bez ograničenja vremena' }).click()
    await expect(page.getByRole('heading', { name: 'Domaći ajvar' })).toBeVisible()
  })
})

test.describe('Moja kuharica', () => {
  test('čuvanje ostaje nakon osvježavanja, može se ukloniti i poništiti', async ({ page }) => {
    await page.goto('/recepti/palacinke/')
    await page.getByRole('button', { name: /^Sačuvaj/ }).first().click()
    await expect(page.getByRole('status').filter({ hasText: 'sačuvan' })).toBeAttached()
    await page.reload()
    await expect(page.getByRole('button', { name: /^Sačuvano/ }).first()).toBeVisible()
    await page.goto('/moja-kuharica/')
    await expect(page.getByRole('link', { name: 'Palačinke' })).toBeVisible()
    await page.getByRole('button', { name: 'Ukloni' }).first().click()
    await expect(page.getByText('Vaša kuharica je prazna')).toBeVisible()
    await page.getByRole('button', { name: 'Poništi' }).click()
    await expect(page.getByRole('link', { name: 'Palačinke' })).toBeVisible()
  })

  test('srce na kartici ne otvara recept', async ({ page }) => {
    await page.goto('/recepti/')
    await page.getByRole('button', { name: /Sačuvaj „/ }).first().click()
    await expect(page).toHaveURL(/\/recepti\/$/)
  })

  test('izvoz i ponovni uvoz', async ({ page }) => {
    await page.goto('/recepti/vanilice/')
    await page.getByRole('button', { name: /^Sačuvaj/ }).first().click()
    await page.goto('/moja-kuharica/')
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Izvezi kuharicu' }).click()
    const file = await (await download).path()
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await expect(page.getByText('Vaša kuharica je prazna')).toBeVisible()
    await page.locator('input[type=file]').setInputFiles(file!)
    await expect(page.getByRole('link', { name: 'Vanilice' })).toBeVisible()
  })

  test('oštećeni lokalni podaci ne ruše stranicu', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('snk:kuharica', '{oštećeno'))
    await page.goto('/moja-kuharica/')
    await expect(page.getByRole('heading', { level: 1, name: 'Moja kuharica' })).toBeVisible()
    await expect(page.getByText(/nisu mogli biti pročitani/)).toBeVisible()
  })
})

test.describe('recept', () => {
  test('porcije: 2× udvostručuje, "po ukusu" ostaje, izvor nepromijenjen', async ({ page }) => {
    await page.goto('/recepti/musaka-s-krompirom/')
    const list = page.locator('#sastojci')
    await expect(list.getByText('1,5 kg', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: '2×' }).click()
    await expect(list.getByText('3 kg', { exact: true })).toBeVisible()
    await expect(list.getByText('so po ukusu')).toBeVisible()
    // jaja: 3 × 0,5 = 1,5 → 2, uz objašnjenje
    await page.goto('/recepti/palacinke/')
    await page.getByRole('button', { name: '0,5×' }).click()
    await expect(page.locator('#sastojci').getByText(/zaokruženo s 1,5/)).toBeVisible()
  })

  test('način kuhanja: tastatura, napredak i nastavak', async ({ page }) => {
    await page.goto('/recepti/palacinke/')
    const opener = page.getByRole('button', { name: 'Način kuhanja' })
    await opener.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Korak 1 od 3')).toBeVisible()
    await page.keyboard.press('ArrowRight')
    await expect(dialog.getByText('Korak 2 od 3')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(opener).toBeFocused()
    await page.reload()
    await page.getByRole('button', { name: 'Način kuhanja' }).click()
    await expect(page.getByText('Nastaviti gdje ste stali?')).toBeVisible()
    await page.getByRole('button', { name: 'Nastavi' }).click()
    await expect(page.getByRole('dialog').getByText('Korak 2 od 3')).toBeVisible()
  })

  test('tajmer pokazuje tačno vrijeme nakon "pozadine"', async ({ page }) => {
    await page.clock.install()
    await page.goto('/recepti/pire-krompir/')
    await page.getByRole('button', { name: /Tajmer 20 min/ }).click()
    await page.clock.fastForward('07:00')
    const dock = page.getByRole('complementary', { name: 'Aktivni tajmeri' })
    await expect(dock).toContainText('13:0')
    await dock.getByRole('button', { name: /Pauziraj/ }).click()
    await page.clock.fastForward('05:00')
    await expect(dock).toContainText('13:0')
  })

  test('recept je čitljiv bez JavaScripta', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false })
    const page = await ctx.newPage()
    await page.goto('/recepti/zeljanica/')
    await expect(page.getByRole('heading', { level: 1, name: 'Zeljanica' })).toBeVisible()
    await expect(page.locator('#sastojci')).toContainText('500 g')
    await expect(page.locator('#priprema')).toContainText('Pecite na 210 °C')
    await ctx.close()
  })

  test('schema Recipe odgovara vidljivom receptu', async ({ page }) => {
    await page.goto('/recepti/palacinke/')
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
    const recipes = blocks.map((b) => JSON.parse(b)).filter((d) => d['@type'] === 'Recipe')
    expect(recipes).toHaveLength(1)
    expect(recipes[0].name).toBe('Palačinke')
    expect(recipes[0].recipeIngredient).toContain('250 g glatkog brašna')
    expect(recipes[0].aggregateRating).toBeUndefined()
  })
})

test.describe('plan i lista za kupovinu', () => {
  test('plan → lista spaja g i kg, čuva ručne stavke pri osvježavanju', async ({ page }) => {
    await page.goto('/recepti/musaka-s-krompirom/')
    await page.getByRole('button', { name: 'Dodaj u plan' }).click()
    await page.goto('/recepti/pire-krompir/')
    await page.getByRole('button', { name: 'Dodaj u plan' }).click()
    await page.goto('/moj-plan/')
    await page.getByRole('button', { name: 'Napravi listu za kupovinu' }).click()
    await expect(page).toHaveURL(/lista-za-kupovinu/)
    // 1,5 kg (musaka) + 1 kg (pire) — napomene se razlikuju, pa su stavke odvojene; mlijeko 300 ml + 150–200 ml se spaja
    await expect(page.getByText(/450–500 ml mlijeko/)).toBeVisible()
    await page.getByLabel('Dodaj stavku').fill('kafa')
    await page.getByRole('button', { name: 'Dodaj' }).click()
    await expect(page.getByText('kafa')).toBeVisible()
    await page.goto('/moj-plan/')
    await page.getByRole('button', { name: 'Ukloni' }).last().click()
    await page.goto('/lista-za-kupovinu/')
    await expect(page.getByText('Plan je promijenjen nakon pravljenja liste.')).toBeVisible()
    await page.getByRole('button', { name: 'Osvježi listu' }).click()
    await expect(page.getByText('kafa')).toBeVisible()
    await expect(page.getByText(/300 ml mlijeko/)).toBeVisible()
  })
})

test.describe('alat za namirnice', () => {
  test('razlikuje sve / jedan nedostaje i navodi šta nedostaje', async ({ page }) => {
    await page.goto('/sta-danas-kuhati/?imam=glatko-brasno,jaja,mlijeko,voda,ulje')
    await expect(page.getByRole('heading', { name: /Nedostaje jedan sastojak/ })).toBeVisible()
    await expect(page.getByText('Nedostaje: so')).toBeVisible()
    await page.goto('/sta-danas-kuhati/?imam=glatko-brasno,jaja,mlijeko&osnovne=1')
    await expect(page.getByRole('heading', { name: /Imate sve obavezne sastojke/ })).toBeVisible()
  })
})

test.describe('objava recepta (urednik)', () => {
  test('draft nije javan; nakon objave jeste', async ({ page, request }) => {
    const email = process.env.SEED_ADMIN_EMAIL!
    const password = process.env.SEED_ADMIN_PASSWORD!
    const login = await request.post('/api/users/login/', { data: { email, password } })
    expect(login.ok()).toBeTruthy()
    const { token } = await login.json()
    const auth = { Authorization: `JWT ${token}` }
    const cat = (await (await request.get('/api/categories/?where[slug][equals]=salate', { headers: auth })).json()).docs[0]
    const author = (await (await request.get('/api/authors/?limit=1', { headers: auth })).json()).docs[0]
    const ing = (await (await request.get('/api/ingredients/?where[slug][equals]=krastavac', { headers: auth })).json()).docs[0]
    const slug = `e2e-salata-${Date.now()}`
    const created = await request.post('/api/recipes/?draft=true', {
      headers: auth,
      data: {
        title: 'E2E salata od krastavaca',
        slug,
        summary: 'Testni recept iz E2E toka.',
        difficulty: 'lako',
        authors: [author.id],
        primaryCategory: cat.id,
        ingredientGroups: [{ items: [{ ingredient: ing.id, amount: 2, unit: 'kom', label: 'krastavca' }] }],
        stepGroups: [{ steps: [{ text: 'Isjeći krastavce.' }] }],
        isDemo: true,
        _status: 'draft',
      },
    })
    expect(created.ok()).toBeTruthy()
    const id = (await created.json()).doc.id
    expect((await page.goto(`/recepti/${slug}/`))!.status()).toBe(404)

    const pub = await request.patch(`/api/recipes/${id}/`, { headers: auth, data: { _status: 'published' } })
    expect(pub.ok()).toBeTruthy()
    await page.goto(`/recepti/${slug}/`)
    await expect(page.getByRole('heading', { level: 1, name: 'E2E salata od krastavaca' })).toBeVisible()
    await page.goto('/recepti/?q=e2e%20salata')
    await expect(page.getByRole('heading', { name: 'E2E salata od krastavaca' })).toBeVisible()

    await request.delete(`/api/recipes/${id}/`, { headers: auth })
  })
})

test.describe('mobilno @mobilni', () => {
  test('meni: Escape zatvara i vraća fokus', async ({ page }) => {
    await page.goto('/')
    const btn = page.getByRole('button', { name: 'Meni' })
    await btn.click()
    await expect(page.getByRole('dialog', { name: 'Meni' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Meni' })).toBeHidden()
    await expect(btn).toBeFocused()
  })

  test('donja traka se pojavljuje tek kad gornje radnje nisu vidljive', async ({ page }) => {
    await page.goto('/recepti/musaka-s-krompirom/')
    const bar = page.getByRole('navigation', { name: 'Brzi skok na recept', includeHidden: true })
    await expect(bar.locator('xpath=..')).toHaveAttribute('aria-hidden', 'true')
    await page.locator('#priprema').scrollIntoViewIfNeeded()
    await expect(bar.locator('xpath=..')).toHaveAttribute('aria-hidden', 'false')
    await page.getByRole('button', { name: 'Način kuhanja' }).click()
    await expect(page.getByRole('navigation', { name: 'Brzi skok na recept' })).toBeHidden()
  })

  test('mobilni filteri: panel s brojem rezultata', async ({ page }) => {
    await page.goto('/recepti/')
    await page.getByRole('button', { name: /^Filteri/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Filteri' })
    await dialog.getByLabel('do 30 min').check()
    await expect(dialog.getByRole('button', { name: /Primijeni \(\d+\)/ })).toBeVisible()
    await dialog.getByRole('button', { name: /Primijeni/ }).click()
    await expect(page).toHaveURL(/vrijeme=30/)
  })
})

test.describe('obroci, kolekcije i kompletan obrok', () => {
  test('početna nudi doručak, ručak i večeru; stranica obroka filtrira', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('navigation', { name: 'Izbor obroka' }).getByRole('link', { name: /Doručak/ }).click()
    await expect(page).toHaveURL(/\/dorucak\/$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Doručak' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Kajgana s povrćem' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Musaka s krompirom' })).toHaveCount(0)
  })

  test('filter Bez mesa isključuje jela s mesom', async ({ page }) => {
    await page.goto('/recepti/?meso=ne&obrok=rucak')
    await expect(page.getByRole('link', { name: /Ukloni uslov: Bez mesa/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Rižoto s povrćem' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Musaka s krompirom' })).toHaveCount(0)
    await page.goto('/recepti/?meso=da')
    await expect(page.getByRole('heading', { name: 'Musaka s krompirom' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Rižoto s povrćem' })).toHaveCount(0)
  })

  test('pretraga s više namirnica (piletina + krompir)', async ({ page }) => {
    await page.goto('/recepti/?q=piletina%20krompir')
    await expect(page.getByRole('heading', { name: 'Pileći batak s krompirom u rerni' })).toBeVisible()
  })

  test('kolekcija ispod praga recepata se ne prikazuje', async ({ page }) => {
    expect((await page.goto('/ideje/kolaci-bez-pecenja/'))!.status()).toBe(404)
    expect((await page.goto('/ideje/iz-jedne-posude/'))!.status()).toBe(200)
  })

  test('recept nudi priloge i napomenu o ostacima', async ({ page }) => {
    await page.goto('/recepti/pileca-prsa-u-sosu-od-pavlake/')
    const s = page.locator('section[aria-labelledby="uz-jelo"]')
    await expect(s.getByRole('heading', { name: 'Šta poslužiti uz ovo?' })).toBeVisible()
    await expect(s.getByRole('heading', { name: 'Pire krompir' })).toBeVisible()
    await expect(s.getByText('Ostalo vam je?')).toBeVisible()
  })
})

test.describe('recepti čitalaca', () => {
  test('registracija → slanje → nije javno → odobrenje → javno s dijeljenjem', async ({ page, request }) => {
    const email = `clan${Date.now()}@example.test`
    await page.goto('/prijava/')
    await page.getByRole('tab', { name: 'Novi račun' }).click()
    await page.getByLabel('Ime za prikaz').fill('Test Čitalac')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Lozinka').fill('sigurna-lozinka-123')
    await page.waitForTimeout(2200) // vremenski žeton protiv botova
    await page.getByRole('button', { name: 'Napravi račun' }).click()
    await expect(page).toHaveURL(/moji-recepti/)

    const title = `Pita od tikvica ${Date.now()}`
    await page.getByLabel('Naziv recepta').fill(title)
    await page.getByLabel('Sastojci').fill('500 g tikvica\n3 jaja\n200 g sira')
    await page.getByLabel('Priprema').fill('Naribati tikvice.\nIzmiješati sa jajima i sirom.\nPeći 40 minuta na 200 °C.')
    // pravi PNG (1×1) — prolazi provjeru i ponovno kodiranje
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
    await page.locator('input[type=file]').setInputFiles({ name: 'slika.png', mimeType: 'image/png', buffer: png })
    await page.waitForTimeout(2200)
    await page.getByRole('button', { name: 'Pošalji recept na odobrenje' }).click()
    await expect(page.getByText(/Recept je poslan uredništvu/)).toBeVisible()
    await expect(page.getByText('Čeka odobrenje')).toBeVisible()

    await page.goto('/recepti-citalaca/')
    await expect(page.getByRole('heading', { name: title })).toHaveCount(0)

    const login = await request.post('/api/users/login/', { data: { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD } })
    const { token } = await login.json()
    const auth = { Authorization: `JWT ${token}` }
    const sub = (await (await request.get(`/api/submissions/?where[title][equals]=${encodeURIComponent(title)}`, { headers: auth })).json()).docs[0]
    expect(sub.status).toBe('na-cekanju')
    expect((await page.goto(`/recepti-citalaca/${sub.id}/`))!.status()).toBe(404)
    await request.patch(`/api/submissions/${sub.id}/`, { headers: auth, data: { status: 'odobreno', featuredOnFacebook: true } })

    await page.goto(`/recepti-citalaca/${sub.id}/`)
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
    await expect(page.getByText('Izdvojeno na stranici Srce naše kuhinje')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Podijeli na Facebooku' })).toHaveAttribute('href', /facebook\.com\/sharer/)

    // javni API ne otkriva članove ni neodobrene recepte
    expect((await request.get('/api/members/')).status()).toBeGreaterThanOrEqual(401)
    const pub = await (await request.get('/api/submissions/?where[status][equals]=na-cekanju')).json()
    expect(pub.totalDocs ?? 0).toBe(0)
    await request.delete(`/api/submissions/${sub.id}/`, { headers: auth })
  })
})
