import { test, expect } from '@playwright/test';
import { 
  waitForEditor, 
  getPageCount, 
  moveToEndOfDocument,
  typeInEditor,
  waitForPaginationUpdate,
  getEditorContent 
} from './helpers';

test.describe('Typing at End of Document', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
  });

  test('should handle typing at the end of document', async ({ page }) => {
    // Get initial state
    const initialPageCount = await getPageCount(page);
    
    // Move to end of document
    await moveToEndOfDocument(page);
    
    // Type some content
    const testText = '\n\nThis is new content typed at the end of the document.';
    await page.keyboard.type(testText);
    
    // Wait for pagination update
    await waitForPaginationUpdate(page);
    
    // Verify content was added
    const content = await getEditorContent(page);
    expect(content).toContain('This is new content typed at the end of the document.');
    
    // Page count should remain same or increase by 1 if overflow
    const finalPageCount = await getPageCount(page);
    expect(finalPageCount).toBeGreaterThanOrEqual(initialPageCount);
    expect(finalPageCount).toBeLessThanOrEqual(initialPageCount + 1);
  });

  test('should create new page when typing enough content at end', async ({ page }) => {
    // Get initial page count
    const initialPageCount = await getPageCount(page);
    
    // Move to end of document
    await moveToEndOfDocument(page);
    
    // Type a large amount of content to force new page
    const longText = '\n\n' + 'Lorem ipsum dolor sit amet. '.repeat(100);
    await page.keyboard.type(longText);
    
    // Wait for pagination update
    await waitForPaginationUpdate(page);
    
    // Verify page count increased
    const finalPageCount = await getPageCount(page);
    expect(finalPageCount).toBeGreaterThan(initialPageCount);
  });

  test('should maintain cursor position when typing at end', async ({ page }) => {
    // Move to end
    await moveToEndOfDocument(page);
    
    // Type incrementally and verify each character appears
    const testChars = ['H', 'e', 'l', 'l', 'o'];
    
    for (const char of testChars) {
      await page.keyboard.type(char);
      await page.waitForTimeout(100); // Small delay to ensure rendering
      
      const content = await getEditorContent(page);
      expect(content).toContain(testChars.slice(0, testChars.indexOf(char) + 1).join(''));
    }
  });

  test('should handle rapid typing at end of document', async ({ page }) => {
    const initialPageCount = await getPageCount(page);
    
    // Move to end
    await moveToEndOfDocument(page);
    
    // Type rapidly without delays
    const rapidText = 'The quick brown fox jumps over the lazy dog. '.repeat(10);
    await page.keyboard.type(rapidText, { delay: 0 });
    
    // Wait for pagination to stabilize
    await waitForPaginationUpdate(page);
    
    // Verify all content was typed
    const content = await getEditorContent(page);
    expect(content).toContain('The quick brown fox jumps over the lazy dog.');
    
    // Verify pages adjusted properly
    const finalPageCount = await getPageCount(page);
    expect(finalPageCount).toBeGreaterThanOrEqual(initialPageCount);
  });
});