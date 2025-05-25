import { test, expect } from '@playwright/test';
import { 
  waitForEditor, 
  getPageCount, 
  moveToEndOfDocument,
  pressKey,
  waitForPaginationUpdate
} from './helpers';

test.describe('Adding Newlines at End of Document', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
  });

  test('should handle single newline at end of document', async ({ page }) => {
    // Get initial state
    const initialPageCount = await getPageCount(page);
    
    // Move to end and add newline
    await moveToEndOfDocument(page);
    await pressKey(page, 'Enter');
    
    // Wait for pagination update
    await waitForPaginationUpdate(page);
    
    // Page count should remain the same for a single newline
    const finalPageCount = await getPageCount(page);
    expect(finalPageCount).toBe(initialPageCount);
  });

  test('should create new page with multiple newlines at end', async ({ page }) => {
    // Get initial page count
    const initialPageCount = await getPageCount(page);
    
    // Move to end of document
    await moveToEndOfDocument(page);
    
    // Add many newlines to force a new page
    for (let i = 0; i < 50; i++) {
      await pressKey(page, 'Enter');
      if (i % 10 === 0) {
        // Wait periodically for pagination updates
        await waitForPaginationUpdate(page);
      }
    }
    
    // Wait for pagination update
    await waitForPaginationUpdate(page);
    
    // Verify page count increased
    const finalPageCount = await getPageCount(page);
    expect(finalPageCount).toBeGreaterThan(initialPageCount);
  });

  test('should handle mixed content and newlines at end', async ({ page }) => {
    const initialPageCount = await getPageCount(page);
    
    // Move to end
    await moveToEndOfDocument(page);
    
    // Add pattern of content and newlines
    for (let i = 0; i < 5; i++) {
      await page.keyboard.type(`Line ${i + 1}`);
      await pressKey(page, 'Enter');
      await pressKey(page, 'Enter'); // Double newline for spacing
      await waitForPaginationUpdate(page);
    }
    
    // Wait for pagination update
    await waitForPaginationUpdate(page);
    
    // Verify content was added
    const content = await page.evaluate(() => {
      const editor = document.querySelector('.tiptap.ProseMirror');
      return editor?.textContent || '';
    });
    
    expect(content).toContain('Line 1');
    expect(content).toContain('Line 5');
    
    // Page count should adjust based on content
    const finalPageCount = await getPageCount(page);
    expect(finalPageCount).toBeGreaterThanOrEqual(initialPageCount);
  });

  test('should maintain proper spacing with consecutive newlines', async ({ page }) => {
    // Move to end
    await moveToEndOfDocument(page);
    
    // Add marker text
    await page.keyboard.type('START');
    
    // Add multiple newlines
    for (let i = 0; i < 5; i++) {
      await pressKey(page, 'Enter');
    }
    
    // Add end marker
    await page.keyboard.type('END');
    
    // Wait for update
    await waitForPaginationUpdate(page);
    
    // Verify both markers exist with space between
    const content = await page.evaluate(() => {
      const editor = document.querySelector('.tiptap.ProseMirror');
      return editor?.textContent || '';
    });
    
    expect(content).toContain('START');
    expect(content).toContain('END');
    
    // Check that there's actual space between START and END
    const startIndex = content.indexOf('START');
    const endIndex = content.indexOf('END');
    expect(endIndex - startIndex).toBeGreaterThanOrEqual(5); // At least 5 characters apart
  });

  test('should handle page break scenario with newlines', async ({ page }) => {
    // Find the initial page count
    const initialPageCount = await getPageCount(page);
    
    // Check how much space is left on last page
    const spaceRemaining = await page.evaluate(() => {
      const pages = document.querySelectorAll('.page');
      const lastPage = pages[pages.length - 1] as HTMLElement;
      const pageContent = lastPage.querySelector('.page-content') as HTMLElement;
      
      if (!pageContent) return 0;
      
      const pageHeight = 842; // A4 height
      const headerHeight = 50;
      const contentPadding = 48 * 2; // top and bottom
      const availableHeight = pageHeight - headerHeight - contentPadding;
      const contentHeight = pageContent.scrollHeight;
      
      return availableHeight - contentHeight;
    });
    
    console.log('Space remaining on last page:', spaceRemaining);
    
    // Move to end
    await moveToEndOfDocument(page);
    
    // Add just enough newlines to potentially trigger a new page
    const newlinesToAdd = Math.ceil(spaceRemaining / 20); // Approximate line height
    
    for (let i = 0; i < newlinesToAdd + 10; i++) {
      await pressKey(page, 'Enter');
    }
    
    // Wait for pagination
    await waitForPaginationUpdate(page);
    
    // Should have created a new page
    const finalPageCount = await getPageCount(page);
    
    // We expect at least one new page if we added enough newlines
    expect(finalPageCount).toBeGreaterThan(initialPageCount);
  });
});