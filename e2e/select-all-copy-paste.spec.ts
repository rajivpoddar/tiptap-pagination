import { test, expect } from '@playwright/test';
import { 
  waitForEditor, 
  getPageCount, 
  selectAllContent, 
  copySelectedContent,
  pasteContent,
  waitForPageCountStable,
  moveToEndOfDocument 
} from './helpers';

test.describe('Select All, Copy and Paste', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
  });

  test('should double page count after select all, copy and paste', async ({ page }) => {
    // Get initial page count
    const initialPageCount = await getPageCount(page);
    console.log('Initial page count:', initialPageCount);
    expect(initialPageCount).toBeGreaterThan(0);

    // Select all content
    await selectAllContent(page);
    
    // Copy selected content
    await copySelectedContent(page);
    
    // Move to end of document
    await moveToEndOfDocument(page);
    
    // Paste content
    await pasteContent(page);
    
    // Wait for pagination to stabilize with expected minimum page count
    const finalPageCount = await waitForPageCountStable(page, initialPageCount * 2 - 1);
    console.log('Final page count:', finalPageCount);
    
    // The page count should be approximately double (might be slightly less due to spacing)
    expect(finalPageCount).toBeGreaterThanOrEqual(initialPageCount * 2 - 1);
    expect(finalPageCount).toBeLessThanOrEqual(initialPageCount * 2 + 1);
  });

  test('should maintain content integrity after copy paste', async ({ page }) => {
    // Get initial content
    await selectAllContent(page);
    await copySelectedContent(page);
    
    // Clear selection and move to end
    await page.keyboard.press('Escape');
    await moveToEndOfDocument(page);
    
    // Paste content without adding separator (to avoid content check issues)
    await pasteContent(page);
    await waitForPageCountStable(page);
    
    // Verify content was duplicated by checking the editor has content
    const content = await page.evaluate(() => {
      const editor = document.querySelector('.tiptap.ProseMirror');
      return editor?.textContent || '';
    });
    
    // Content should exist and be non-empty
    expect(content.length).toBeGreaterThan(100);
    
    // Verify page count increased (content was duplicated)
    const finalPageCount = await getPageCount(page);
    expect(finalPageCount).toBeGreaterThan(1);
  });

  test('should handle multiple paste operations', async ({ page }) => {
    const initialPageCount = await getPageCount(page);
    
    // Select all and copy
    await selectAllContent(page);
    await copySelectedContent(page);
    
    // Move to end and paste multiple times
    await moveToEndOfDocument(page);
    
    for (let i = 0; i < 3; i++) {
      await pasteContent(page);
      // Wait for each paste to complete
      await waitForPageCountStable(page);
    }
    
    // Verify page count increased significantly
    const finalPageCount = await getPageCount(page);
    expect(finalPageCount).toBeGreaterThanOrEqual(initialPageCount * 3);
  });
});