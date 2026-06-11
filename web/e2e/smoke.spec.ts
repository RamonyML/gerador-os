import { test, expect } from '@playwright/test'

test('a aplicação carrega e exibe o título', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Gerador de O\.S/)
})
