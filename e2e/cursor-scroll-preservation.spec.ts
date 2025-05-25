import { test, expect } from '@playwright/test';
import { 
  waitForEditor, 
  getCursorPosition,
  getScrollPosition,
  waitForPaginationUpdate,
  typeInEditor,
} from './helpers';

test.describe('Cursor and Scroll Position Preservation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEditor(page);
  });

  test('should preserve scroll position when typing at current position', async ({ page }) => {
    // Scroll to middle of document
    await page.evaluate(() => {
      const editor = document.querySelector('.tiptap.ProseMirror');
      if (editor) {
        const middleY = editor.scrollHeight / 2;
        window.scrollTo(0, middleY);
      }
    });
    
    // Click at current viewport position
    await page.click('.tiptap.ProseMirror');
    
    // Get scroll position before typing
    const beforeScroll = await getScrollPosition(page);
    expect(beforeScroll.top).toBeGreaterThan(0);
    
    // Type content at current position
    await typeInEditor(page, 'Adding content here ');
    
    // Wait for any pagination updates
    await waitForPaginationUpdate(page);
    
    // Get scroll position after typing
    const afterScroll = await getScrollPosition(page);
    
    // Scroll position should remain the same when typing at visible position
    expect(afterScroll.top).toBe(beforeScroll.top);
    expect(afterScroll.left).toBe(beforeScroll.left);
  });

  test('should preserve cursor visibility during repagination', async ({ page }) => {
    // Click in the middle of visible content
    await page.click('.tiptap.ProseMirror');
    
    // Move cursor to a specific position
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowDown');
    }
    
    // Get cursor position and check if it's visible
    const cursorPos = await getCursorPosition(page);
    const viewport = await page.viewportSize();
    const scrollPos = await getScrollPosition(page);
    
    // Check if cursor is in viewport
    const isVisible = viewport && 
      cursorPos.top >= scrollPos.top && 
      cursorPos.top <= scrollPos.top + viewport.height;
    
    expect(isVisible).toBe(true);
    
    // Add content that triggers repagination
    await typeInEditor(page, 'New content here');
    await waitForPaginationUpdate(page);
    
    // Check cursor is still visible after repagination
    const newCursorPos = await getCursorPosition(page);
    const newScrollPos = await getScrollPosition(page);
    
    const isStillVisible = viewport &&
      newCursorPos.top >= newScrollPos.top && 
      newCursorPos.top <= newScrollPos.top + viewport.height;
    
    expect(isStillVisible).toBe(true);
  });
});