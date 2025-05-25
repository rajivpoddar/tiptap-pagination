import { test, expect } from '@playwright/test';
import { 
  waitForEditor, 
  getPageCount, 
  selectAllContent, 
  deleteSelectedContent,
  waitForPaginationUpdate,
  waitForPageCountStable,
  getEditorContent,
  getCursorPosition,
} from './helpers';

test.describe('Select All and Delete', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
  });

  test('should result in 1 page after selecting all and deleting', async ({ page }) => {
    // Get initial page count
    const initialPageCount = await getPageCount(page);
    console.log('Initial page count:', initialPageCount);
    expect(initialPageCount).toBeGreaterThan(1);

    // Select all content
    await selectAllContent(page);
    
    // Delete selected content
    await deleteSelectedContent(page);
    
    // Wait for pagination to stabilize
    await waitForPageCountStable(page);
    
    // Verify only 1 page remains
    const finalPageCount = await getPageCount(page);
    expect(finalPageCount).toBe(1);
    
    // Verify editor is empty or nearly empty
    const content = await getEditorContent(page);
    expect(content).toBe('');
  });

  test('should allow typing after select all and delete', async ({ page }) => {
    // Select all and delete
    await selectAllContent(page);
    await deleteSelectedContent(page);
    await waitForPaginationUpdate(page);
    
    // Type new content
    await page.keyboard.type('New content after deletion');
    await waitForPaginationUpdate(page);
    
    // Verify content was typed
    const content = await getEditorContent(page);
    expect(content).toContain('New content after deletion');
    
    // Verify still 1 page
    const pageCount = await getPageCount(page);
    expect(pageCount).toBe(1);
  });

  test('should preserve cursor position after select all and delete', async ({ page }) => {
    // Move to a specific position in the document
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    
    // Get initial cursor position
    const initialCursorPos = await getCursorPosition(page);
    
    // Select all and delete
    await selectAllContent(page);
    await deleteSelectedContent(page);
    await waitForPaginationUpdate(page);
    
    // Get final cursor position
    const finalCursorPos = await getCursorPosition(page);
    
    // Cursor should be at the start of the document after deletion
    expect(finalCursorPos.top).toBeLessThanOrEqual(initialCursorPos.top);
    expect(finalCursorPos.left).toBeLessThanOrEqual(initialCursorPos.left);
  });
});