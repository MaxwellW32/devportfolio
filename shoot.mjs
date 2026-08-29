import { chromium } from 'playwright'
const OUT = process.argv[2]
const pages = [
  ['v2-home', '/', 0],
  ['v2-fib', '/fun/fibonacci', 0],
  ['v2-seed', '/fun/seedWorld', 0],
  ['v2-boids', '/fun/three', 0],
  ['v2-about', '/aboutMe', 700],
  ['v2-contact', '/contactUs', 0],
  ['v2-funpage', '/fun', 0],
]
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message.slice(0,150)))
for (const [name, path, scroll] of pages) {
  try {
    await page.goto('http://localhost:3100' + path, { waitUntil: 'networkidle', timeout: 45000 })
    await page.waitForTimeout(2600)
    if (scroll) { await page.evaluate(y => window.scrollTo(0,y), scroll); await page.waitForTimeout(1200) }
    await page.screenshot({ path: `${OUT}/${name}.png` })
    console.log('ok', name)
  } catch (e) { console.log('FAIL', name, e.message.slice(0,120)) }
}
await browser.close()
