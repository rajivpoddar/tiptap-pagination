import { PaginationPlus } from '../PaginationPlus';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import '@testing-library/jest-dom';

// Add type definitions for Jest globals
declare global {
  namespace jest {
    interface Matchers<R> {
      toBe(expected: any): R;
    }
  }
}

describe('PaginationPlus Height Calculations', () => {
  let editor: Editor;
  let pagination: typeof PaginationPlus;

  beforeEach(() => {
    // Create a basic editor with PaginationPlus
    editor = new Editor({
      extensions: [
        StarterKit,
        PaginationPlus.configure({
          pageHeight: 842,
          pageHeaderHeight: 50,
          pageGap: 20,
          pageGapBorderSize: 1,
        }),
      ],
    });

    pagination = editor.extensionManager.extensions.find(
      (ext) => ext.name === 'PaginationPlus'
    ) as typeof PaginationPlus;
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('Single Page Height', () => {
    it('should calculate correct height for single page', () => {
      // Expected: 48px padding + 842px page height = 890px
      const expectedHeight = 48 + 842;
      
      // Get the height calculation function
      const calculateHeight = (pagination as any).calculatePaginatedHeight;
      const actualHeight = calculateHeight(1);
      
      expect(actualHeight).toBe(expectedHeight);
    });
  });

  describe('Multi Page Height', () => {
    it('should calculate correct height for 2 pages', () => {
      // Expected components:
      // - Content padding: 48px
      // - Page heights: 842px × 2
      // - Gap: 20px × 1
      // - Gap borders: 2px × 1
      // - Header margins: 48px × 1
      const expectedHeight = 48 + (842 * 2) + (20 * 1) + (2 * 1) + (48 * 1);
      
      const calculateHeight = (pagination as any).calculatePaginatedHeight;
      const actualHeight = calculateHeight(2);
      
      expect(actualHeight).toBe(expectedHeight);
    });

    it('should calculate correct height for 8 pages', () => {
      // Expected components:
      // - Content padding: 48px
      // - Page heights: 842px × 8
      // - Gaps: 20px × 7
      // - Gap borders: 2px × 7
      // - Header margins: 48px × 7
      const expectedHeight = 48 + (842 * 8) + (20 * 7) + (2 * 7) + (48 * 7);
      
      const calculateHeight = (pagination as any).calculatePaginatedHeight;
      const actualHeight = calculateHeight(8);
      
      expect(actualHeight).toBe(expectedHeight);
    });

    it('should calculate correct height for 9 pages', () => {
      // Expected components:
      // - Content padding: 48px
      // - Page heights: 842px × 9
      // - Gaps: 20px × 8
      // - Gap borders: 2px × 8
      // - Header margins: 48px × 8
      const expectedHeight = 48 + (842 * 9) + (20 * 8) + (2 * 8) + (48 * 8);
      
      const calculateHeight = (pagination as any).calculatePaginatedHeight;
      const actualHeight = calculateHeight(9);
      
      expect(actualHeight).toBe(expectedHeight);
    });
  });

  describe('Page Count Calculation', () => {
    it('should return 1 page for empty content', () => {
      // Mock the DOM measurements
      const mockNaturalHeight = 890; // Initial height with just header/footer
      const mockContentElement = {
        textContent: '',
      };
      
      // Mock the DOM query
      document.querySelector = jest.fn().mockReturnValue(mockContentElement);
      
      // Get the page count calculation
      const calculatePageCount = (pagination as any).calculatePageCount;
      const pageCount = calculatePageCount(mockNaturalHeight);
      
      expect(pageCount).toBe(1);
    });

    it('should calculate correct page count for content', () => {
      // Mock content that would require 2 pages
      const mockNaturalHeight = 1500; // Height that would require 2 pages
      const mockContentElement = {
        textContent: 'Some content',
      };
      
      // Mock the DOM query
      document.querySelector = jest.fn().mockReturnValue(mockContentElement);
      
      // Get the page count calculation
      const calculatePageCount = (pagination as any).calculatePageCount;
      const pageCount = calculatePageCount(mockNaturalHeight);
      
      expect(pageCount).toBe(2);
    });
  });
}); 