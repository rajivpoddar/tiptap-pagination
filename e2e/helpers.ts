import { Page } from '@playwright/test';

export async function waitForEditor(page: Page) {
  // Wait for the editor to be loaded and ready
  await page.waitForSelector('.tiptap.ProseMirror', { state: 'visible' });
  
  // Wait for pagination to initialize
  await page.waitForFunction(() => {
    const pages = document.querySelectorAll('.page');
    return pages.length > 0;
  });
  
  // Small delay to ensure everything is rendered
  await page.waitForTimeout(500);
}

export async function getPageCount(page: Page): Promise<number> {
  return await page.evaluate(() => {
    return document.querySelectorAll('.page').length;
  });
}

export async function selectAllContent(page: Page) {
  // Triple click to select all or use keyboard shortcut
  const isMac = process.platform === 'darwin';
  await page.keyboard.press(isMac ? 'Meta+a' : 'Control+a');
}

export async function getEditorContent(page: Page): Promise<string> {
  return await page.evaluate(() => {
    const editor = document.querySelector('.tiptap.ProseMirror');
    if (!editor) return '';
    
    // Get only the actual content, excluding headers/footers
    const contentElements = editor.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote');
    return Array.from(contentElements)
      .map(el => el.textContent || '')
      .join('\n')
      .trim();
  });
}

export async function typeInEditor(page: Page, text: string) {
  await page.click('.tiptap.ProseMirror');
  await page.keyboard.type(text);
}

export async function pressKey(page: Page, key: string) {
  await page.keyboard.press(key);
}

export async function copySelectedContent(page: Page) {
  const isMac = process.platform === 'darwin';
  await page.keyboard.press(isMac ? 'Meta+c' : 'Control+c');
}

export async function pasteContent(page: Page) {
  const isMac = process.platform === 'darwin';
  await page.keyboard.press(isMac ? 'Meta+v' : 'Control+v');
}

export async function deleteSelectedContent(page: Page) {
  await page.keyboard.press('Delete');
}

export async function moveToEndOfDocument(page: Page) {
  const isMac = process.platform === 'darwin';
  await page.keyboard.press(isMac ? 'Meta+ArrowDown' : 'Control+End');
}

export async function waitForPaginationUpdate(page: Page, timeout: number = 1000) {
  // Wait for pagination to recalculate after content changes
  await page.waitForTimeout(timeout);
  
  // Wait for pagination to stabilize by checking if page count remains constant
  let previousCount = await getPageCount(page);
  let stableIterations = 0;
  const maxIterations = 10;
  
  for (let i = 0; i < maxIterations; i++) {
    await page.waitForTimeout(200);
    const currentCount = await getPageCount(page);
    
    if (currentCount === previousCount) {
      stableIterations++;
      if (stableIterations >= 3) {
        // Page count has been stable for 3 checks
        break;
      }
    } else {
      stableIterations = 0;
      previousCount = currentCount;
    }
  }
  
  // Additional wait to ensure DOM updates are complete
  await page.waitForTimeout(200);
}

export async function waitForPageCountStable(page: Page, expectedMinimum?: number): Promise<number> {
  let previousCount = 0;
  let stableCount = 0;
  const maxAttempts = 15;
  
  for (let i = 0; i < maxAttempts; i++) {
    const currentCount = await getPageCount(page);
    
    if (currentCount === previousCount) {
      stableCount++;
      if (stableCount >= 3) {
        // If we have an expected minimum and haven't reached it, wait more
        if (expectedMinimum && currentCount < expectedMinimum && i < maxAttempts - 1) {
          await page.waitForTimeout(500);
          stableCount = 0;
          continue;
        }
        return currentCount;
      }
    } else {
      stableCount = 0;
    }
    
    previousCount = currentCount;
    await page.waitForTimeout(500);
  }
  
  return previousCount;
}

export async function getCursorPosition(page: Page): Promise<{ top: number, left: number }> {
  return await page.evaluate(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return { top: 0, left: 0 };
    }
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX
    };
  });
}

export async function getScrollPosition(page: Page): Promise<{ top: number, left: number }> {
  return await page.evaluate(() => ({
    top: window.scrollY,
    left: window.scrollX
  }));
}

export async function setScrollPosition(page: Page, top: number, left: number) {
  await page.evaluate(({ top, left }) => {
    window.scrollTo(left, top);
  }, { top, left });
}