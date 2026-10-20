import { expect, test, type Locator } from '@playwright/test';

async function setPosition(slider: Locator, value: number) {
  await slider.focus();
  await slider.press('Home');
  for (let count = 0; count < Math.floor(value / 10); count++) await slider.press('Shift+ArrowRight');
  for (let count = 0; count < value % 10; count++) await slider.press('ArrowRight');
}

async function pathCoordinates(host: Locator) {
  const path = await host.locator('.comparison__icon path').getAttribute('d');
  return path!.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/g)!.map(Number);
}

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('fixed circle, position-dependent continuous arrow and stationary images', async ({ page }) => {
  const host = page.locator('#hero-comparison');
  const slider = host.getByRole('slider');
  await expect(slider).toHaveAttribute('aria-valuenow', '30');
  const initialBounds = await slider.boundingBox();
  expect(initialBounds?.width).toBe(54);
  expect(initialBounds?.height).toBe(54);
  const beforeBounds = await host.locator('.comparison__image--before').boundingBox();
  const afterBounds = await host.locator('.comparison__image--after').boundingBox();
  expect(beforeBounds).toEqual(afterBounds);

  await setPosition(slider, 25);
  const left = await pathCoordinates(host);
  expect(left[0]).toBeLessThan(0);
  expect(left[2]).toBeGreaterThan(0);
  await setPosition(slider, 75);
  const right = await pathCoordinates(host);
  expect(right[0]).toBeGreaterThan(0);
  expect(right[2]).toBeLessThan(0);
  await setPosition(slider, 25);
  expect(await pathCoordinates(host)).toEqual(left);

  await setPosition(slider, 49);
  const nearCentre = await pathCoordinates(host);
  expect(Math.abs(nearCentre[2])).toBeLessThan(Math.abs(left[2]));
  await slider.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '50');
  expect((await pathCoordinates(host)).every((coordinate) => Math.abs(coordinate) < 0.00001)).toBe(true);
  await expect(host.locator('.comparison__icon circle')).toHaveAttribute('r', '1.1');

  for (const position of [0, 50, 100]) {
    await setPosition(slider, position);
    const bounds = await slider.boundingBox();
    const imageBounds = await host.boundingBox();
    expect(bounds?.width).toBe(54);
    expect(bounds?.height).toBe(54);
    expect(bounds!.x).toBeGreaterThanOrEqual(imageBounds!.x - 1);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(imageBounds!.x + imageBounds!.width + 1);
    expect(await host.locator('.comparison__image--before').boundingBox()).toEqual(beforeBounds);
    expect(await host.locator('.comparison__image--after').boundingBox()).toEqual(afterBounds);
  }
  await slider.press('ArrowLeft');
  await expect(slider).toHaveAttribute('aria-valuenow', '99');
  await slider.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '100');
});

test('mouse capture continues outside, releases in place and does not open a viewer', async ({ page }) => {
  const host = page.locator('#hero-comparison');
  await host.scrollIntoViewIfNeeded();
  const box = (await host.boundingBox())!;
  await page.mouse.move(box.x + box.width * .3, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .8, box.y - 10, { steps: 8 });
  await expect(host.getByRole('slider')).toHaveAttribute('aria-valuenow', '80');
  await page.mouse.up();
  await expect(host).not.toHaveClass(/comparison--dragging/);
  await page.mouse.move(box.x + box.width * .2, box.y + box.height / 2);
  await expect(host.getByRole('slider')).toHaveAttribute('aria-valuenow', '80');
  await expect(page.locator('.lightbox')).not.toBeVisible();

  const card = page.locator('.project__comparison').first();
  await card.scrollIntoViewIfNeeded();
  const cardBox = (await card.boundingBox())!;
  await page.mouse.move(cardBox.x + cardBox.width * .3, cardBox.y + cardBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(cardBox.x + cardBox.width * .85, cardBox.y + cardBox.height - 24, { steps: 8 });
  await page.mouse.up();
  await expect(card.getByRole('slider')).toHaveAttribute('aria-valuenow', '85');
  await expect(page.locator('.lightbox')).not.toBeVisible();

  await page.mouse.move(cardBox.x + cardBox.width * .4, cardBox.y + cardBox.height / 2);
  await page.mouse.down();
  await expect(card.getByRole('slider')).toHaveAttribute('aria-valuenow', '40');
  await card.evaluate((element) => element.releasePointerCapture(1));
  await page.mouse.move(cardBox.x + cardBox.width * .6, cardBox.y + cardBox.height / 2);
  await expect(card).not.toHaveClass(/comparison--dragging/);
  await expect(card.getByRole('slider')).toHaveAttribute('aria-valuenow', '40');
  await page.mouse.up();
});

test('filters display actual matching products and update pressed state', async ({ page }) => {
  await expect(page.locator('.project')).toHaveCount(4);
  for (const [category, count] of [['interior', 2], ['exterior', 1], ['twilight', 1], ['all', 4]] as const) {
    const filter = page.locator(`[data-filter="${category}"]`);
    await filter.click();
    await expect(filter).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.project')).toHaveCount(count);
    await expect(page.locator('#result-count')).toHaveText(String(count).padStart(2, '0'));
    await expect(page.locator('[data-filter][aria-pressed="true"]')).toHaveCount(1);
  }
});

test('viewer compares, contains focus, closes with Escape and restores its opener', async ({ page }) => {
  const opener = page.locator('[data-open]').first();
  await setPosition(page.locator('.project__comparison').first().getByRole('slider'), 40);
  await opener.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const slider = dialog.getByRole('slider');
  await expect(slider).toHaveAttribute('aria-valuenow', '40');
  await setPosition(slider, 70);
  await expect(slider).toHaveAttribute('aria-valuenow', '70');
  for (let index = 0; index < 5; index++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
  }
  await dialog.getByRole('button', { name: 'Đóng ảnh (Escape)' }).focus();
  await page.keyboard.press('Shift+Tab');
  await expect(slider).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await expect(page.locator('html')).not.toHaveClass(/modal-open/);
  await opener.click();
  await dialog.getByRole('button', { name: 'Đóng ảnh (Escape)' }).click();
  await expect(dialog).not.toBeVisible();
});

test('hint animates the inner icon only, stops on interaction and respects reduced motion', async ({ page }) => {
  const host = page.locator('#hero-comparison');
  const icon = host.locator('.comparison__icon');
  const slider = host.getByRole('slider');
  await expect(icon).toHaveCSS('animation-name', 'drag-cue');
  await expect(slider).toHaveCSS('animation-name', 'none');
  await slider.focus();
  await expect(icon).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('#hero-comparison .comparison__icon')).toHaveCSS('animation-name', 'none');
});

test('demo contact has no inactive action and all local images load', async ({ page }) => {
  await expect(page.locator('.contact__details')).toContainText('Bản demo chưa nhận ảnh');
  await expect(page.locator('.contact__details a, .contact__details button')).toHaveCount(0);
  await page.locator('img').evaluateAll((images) => images.forEach((image) => { image.loading = 'eager'; }));
  await expect.poll(() => page.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('native touch drags horizontally, cancels cleanly and permits vertical scrolling', async ({ page, context, isMobile }) => {
  test.skip(!isMobile, 'Native touch gesture requires the mobile project.');
  const host = page.locator('#hero-comparison');
  await host.scrollIntoViewIfNeeded();
  const box = (await host.boundingBox())!;
  const cdp = await context.newCDPSession(page);
  const y = Math.round(box.y + box.height * .65);
  const startX = Math.round(box.x + box.width * .3);
  const endX = Math.round(box.x + box.width * .7);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: startX, y }] });
  for (let index = 1; index <= 8; index++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(startX + (endX - startX) * index / 8), y }] });
    await page.waitForTimeout(20);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(host.getByRole('slider')).toHaveAttribute('aria-valuenow', /^(69|70|71)$/);
  await expect(host).not.toHaveClass(/comparison--dragging/);
  const valueAfterHorizontal = await host.getByRole('slider').getAttribute('aria-valuenow');
  const scrollBefore = await page.evaluate(() => scrollY);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: endX, y }] });
  for (let index = 1; index <= 8; index++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: endX, y: y - index * 14 }] });
    await page.waitForTimeout(20);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBefore + 35);
  await expect(host.getByRole('slider')).toHaveAttribute('aria-valuenow', valueAfterHorizontal!);
  await expect(host).not.toHaveClass(/comparison--dragging/);

  await host.scrollIntoViewIfNeeded();
  const cancelBox = (await host.boundingBox())!;
  const cancelY = Math.round(cancelBox.y + cancelBox.height / 2);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: startX, y: cancelY }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: startX + 35, y: cancelY }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(host).not.toHaveClass(/comparison--dragging/);
  await expect(page.locator('.lightbox')).not.toBeVisible();
  await cdp.detach();
});

test('capture the complete responsive page', async ({ page }, testInfo) => {
  await page.locator('img').evaluateAll((images) => images.forEach((image) => { image.loading = 'eager'; }));
  await expect.poll(() => page.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
  await page.locator('img').evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `artifacts/${testInfo.project.name}.png`, fullPage: true, animations: 'disabled' });
});
