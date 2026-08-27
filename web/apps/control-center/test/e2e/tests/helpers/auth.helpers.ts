import { Page, expect } from '@playwright/test';

/**
 * Authentication helper class for e2e tests
 */
export class AuthHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to the login page
   */
  async goToLogin() {
    await this.page.goto('/auth');
    await this.page.waitForSelector('form');
  }

  /**
   * Fill in login credentials
   */
  async fillLoginCredentials(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
  }

  /**
   * Submit the login form
   */
  async submitLogin() {
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/auth/dashboard');
  }

  /**
   * Perform complete login flow
   */
  async login(email: string, password: string) {
    await this.goToLogin();
    await this.fillLoginCredentials(email, password);
    await this.submitLogin();
  }

  /**
   * Navigate to the dashboard
   */
  async goToDashboard() {
    await this.page.goto('/auth/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Open the user menu dropdown
   */
  async openUserMenu() {
    await this.page.click('[data-id="user-menu-button"]');
    await this.page.waitForSelector('[data-id="user-menu-dropdown"]', { state: 'visible' });
  }

  /**
   * Click the logout button in the user menu
   */
  async clickLogout() {
    await this.page.click('[data-id="logout-button"]');
  }

  /**
   * Perform complete logout flow: open menu and click logout
   */
  async logout() {
    await this.openUserMenu();
    await this.clickLogout();
    await this.page.waitForURL(/\/auth/, { waitUntil: 'load' });
  }

  /**
   * Verify the user is on a login/signin page
   */
  async verifyOnLoginPage() {
    const currentUrl = this.page.url();
    expect(
      currentUrl.includes('/auth/signin') ||
        currentUrl.includes('/auth/login') ||
        currentUrl.includes('show=signin') ||
        currentUrl.includes('/auth?')
    ).toBeTruthy();
  }

  /**
   * Verify login form elements are visible
   */
  async verifyLoginFormVisible() {
    await expect(this.page.locator('form')).toBeVisible();
    await expect(this.page.locator('input[name="email"]')).toBeVisible();
    await expect(this.page.locator('input[name="password"]')).toBeVisible();
  }

  /**
   * Verify the user is on the dashboard
   */
  async verifyOnDashboard() {
    await expect(this.page).toHaveURL(/\/auth\/dashboard/);
  }

  /**
   * Verify the user is NOT on the dashboard
   */
  async verifyNotOnDashboard() {
    await expect(this.page).not.toHaveURL(/\/auth\/dashboard/);
  }

  /**
   * Verify user cannot access protected dashboard route
   */
  async verifyCannotAccessDashboard() {
    await this.page.goto('/auth/dashboard');
    await this.page.waitForURL('**/auth/?**', { waitUntil: 'load' });
    await this.verifyLoginFormVisible();
  }
}
