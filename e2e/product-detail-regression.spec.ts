import { test, expect } from "../playwright-fixture";

test("product detail mobile interactions work", async ({ page }) => {
  await page.goto("https://13500751-9787-48f3-b789-08aacbee9874.lovableproject.com/product/1");

  await expect(page.getByRole("heading", { name: "Pantheon", level: 1 })).toBeVisible();
  await expect(page.locator('img[alt="Vista do produto 1"]')).toBeVisible();

  await page.getByRole("button", { name: "Adicionar à Sacola" }).click();
  await expect(page.getByText("Sacola de Compras")).toBeVisible();

  await page.getByRole("button", { name: "Detalhes do Produto" }).click();
  await expect(page.getByText("LE-PTH-001")).toBeVisible();
});
