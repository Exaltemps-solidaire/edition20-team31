import { expect, test } from "@playwright/test";

// Démo du cas passant, de bout en bout. Chaque itération ajoute ses étapes (test.step).
test("Démo : le cas passant", async ({ page }) => {
  await test.step("J'ouvre l'application", async () => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  await test.step("Je choisis le persona chargée de remobilisation", async () => {
    await page.getByRole("button", { name: /chargée de remobilisation/i }).click();
    await expect(page).toHaveURL(/\/admin/);
  });

  await test.step("Je vois le tableau de bord admin avec les ACTIV'", async () => {
    await expect(page.getByRole("heading", { name: "Tableau de bord admin" })).toBeVisible();
    await expect(page.getByRole("table").first()).toBeVisible();
  });

  await test.step("J'ouvre la fiche de Nora, dont la formation est terminée", async () => {
    await page.getByRole("link", { name: "Nora Benali" }).click();
    await expect(page.getByRole("heading", { name: "Nora Benali" })).toBeVisible();
  });

  await test.step("Je confirme son habilitation", async () => {
    await page.getByRole("button", { name: /confirmer l'habilitation/i }).click();
    await expect(page.getByText(/habilitée le/i)).toBeVisible();
  });

  await test.step("Je choisis le persona ACTIV' et je vois mon parcours", async () => {
    await page.goto("/");
    await page.getByRole("button", { name: /ACTIV' en formation/i }).click();
    await expect(page.getByRole("heading", { name: "Mon parcours" })).toBeVisible();
  });

  await test.step("J'envoie mon retour de satisfaction", async () => {
    await page.getByRole("button", { name: /envoyer mon retour/i }).click();
    await expect(page.getByText(/retour a été enregistré/i)).toBeVisible();
  });
});
