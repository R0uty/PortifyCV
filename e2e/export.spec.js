import { readFile } from 'node:fs/promises'
import JSZip from 'jszip'
import { test, expect } from './fixtures/base.js'
import { demoCvData } from '../src/utils/cvForm.js'

test.describe('Export menu', () => {
  test('lists PDF, HTML, JSON, and Word, and closes on outside click', async ({ page }) => {
    await page.goto('/cv')

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()

    const menu = page.getByRole('menu')
    await expect(menu.getByRole('menuitem', { name: 'PDF' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'HTML' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'JSON' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'Word' })).toBeVisible()

    await page.getByRole('heading', { name: 'Profile', exact: true }).click()
    await expect(menu).toBeHidden()
  })

  test('opens with focus on the first item and supports arrow-key navigation', async ({ page }) => {
    await page.goto('/cv')

    const trigger = page.getByRole('banner').getByRole('button', { name: 'Export', exact: true })
    await trigger.click()

    const menu = page.getByRole('menu')
    const items = menu.getByRole('menuitem')
    await expect(items.nth(0)).toBeFocused()

    await page.keyboard.press('ArrowDown')
    await expect(items.nth(1)).toBeFocused()

    await page.keyboard.press('ArrowDown')
    await expect(items.nth(2)).toBeFocused()

    await page.keyboard.press('ArrowDown')
    await expect(items.nth(3)).toBeFocused()

    // Copy share link ends the menu (1.6.67).
    await expect(items).toHaveCount(5)
    await page.keyboard.press('ArrowDown')
    await expect(items.nth(4)).toBeFocused()

    // Wraps back to the first item.
    await page.keyboard.press('ArrowDown')
    await expect(items.nth(0)).toBeFocused()

    await page.keyboard.press('ArrowUp')
    await expect(items.nth(4)).toBeFocused()

    await page.keyboard.press('Home')
    await expect(items.nth(0)).toBeFocused()

    await page.keyboard.press('End')
    await expect(items.nth(4)).toBeFocused()
  })

  test('Escape closes the menu and returns focus to the trigger', async ({ page }) => {
    await page.goto('/cv')

    const trigger = page.getByRole('banner').getByRole('button', { name: 'Export', exact: true })
    await trigger.click()
    await expect(page.getByRole('menu')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.getByRole('menu')).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('JSON export downloads a .json file', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: 'JSON' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/\.json$/)
  })

  test('HTML export downloads an .html file', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: 'HTML' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/\.html$/)
  })

  test('Word export downloads a .docx file', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: 'Word' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/\.docx$/)
  })
})

// What actually reaches each file (1.6.65): a job's bullet points and
// technologies, "Present" for a current job, the app's own link names,
// clickable links, and never the editor's placeholder text.
test.describe('Export contents', () => {
  const [job] = demoCvData.experience

  const exportAs = async (page, format) => {
    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: format }).click()
    return readFile(await (await downloadPromise).path())
  }

  const readDocx = async (buffer) => {
    const zip = await JSZip.loadAsync(buffer)
    const xml = await zip.file('word/document.xml').async('string')
    return {
      text: [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((match) => match[1]).join(''),
      rels: await zip.file('word/_rels/document.xml.rels').async('string'),
    }
  }

  test('HTML and Word carry every experience field and real links', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()

    const html = (await exportAs(page, 'HTML')).toString('utf8')
    expect(html).toContain(`<h1 class="cv-name">${demoCvData.fullName}</h1>`)
    expect(html).toContain(`${job.role} @ ${job.company}`)
    expect(html).toContain(`${job.startDate} - Present · ${job.location}`)
    for (const line of job.achievements) expect(html).toContain(`<li>${line}</li>`)
    expect(html).toContain(job.technologies.join(', '))
    expect(html).toContain(`<a href="mailto:${demoCvData.email}">`)
    expect(html).toContain(`<a href="${demoCvData.links.github}">`)
    expect(html).toContain('>Dev.to</p>')

    const word = await readDocx(await exportAs(page, 'Word'))
    expect(word.text).toContain(`${job.startDate} - Present · ${job.location}`)
    for (const line of job.achievements) expect(word.text).toContain(line)
    expect(word.text).toContain(job.technologies.join(', '))
    expect(word.text).toContain('Dev.to')
    expect(word.rels).toContain(`Target="${demoCvData.links.github}"`)
  })

  test('a blank CV exports without the editor placeholders', async ({ page }) => {
    await page.goto('/cv')
    const placeholders = /Your Name|Professional Title|Add a professional summary|No (experience|education|links) added yet/

    const html = (await exportAs(page, 'HTML')).toString('utf8')
    expect(html).not.toMatch(placeholders)
    const word = await readDocx(await exportAs(page, 'Word'))
    expect(word.text).not.toMatch(placeholders)
  })

  test('a JSON export imports back with the same section order', async ({ page }) => {
    // An example whose template order differs from the full default
    // order, which an empty sectionOrder used to be expanded into.
    await page.goto('/cv?template=modern&example=project-manager')
    // The visible preview only: the builder's off-screen export copy
    // renders the same sections a moment later.
    const sectionTitles = () => page.locator('.app-shell__preview [data-export-section]').evaluateAll(
      (nodes) => nodes.map((node) => node.getAttribute('data-export-section')),
    )
    await expect(page.getByText('Loaded the Project manager example.')).toBeVisible()
    const before = await sectionTitles()
    expect(before.length).toBeGreaterThan(0)

    const exported = JSON.parse((await exportAs(page, 'JSON')).toString('utf8'))
    expect(exported.sectionOrder).toEqual([])
    // A new name shows when the import has landed.
    exported.fullName = 'Reimported Person'
    await page.goto('/cv?template=modern')
    await page.getByRole('tab', { name: 'Classic' }).click()
    await page.locator('input[type="file"][accept=".json,application/json"]').setInputFiles({
      name: 'cv.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(exported)),
    })
    await expect(page.locator('[data-cv-name]').first()).toContainText('Reimported Person')

    await expect.poll(sectionTitles).toEqual(before)
  })
})
