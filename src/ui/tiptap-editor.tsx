"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { PaginationPlus } from "tiptap-pagination-plus";
import { useEffect, useState, useMemo } from "react";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { DOMParser } from "@tiptap/pm/model";

// Helper function to convert plain text to properly formatted HTML
const formatTextToHtml = (text: string): string => {
  // Split into lines and process each line individually  
  const lines = text.split('\n');
  
  // Convert each line to a paragraph, including empty lines
  const paragraphs = lines.map(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) {
      // Empty line - create empty paragraph 
      return '<p></p>';
    } else {
      // Non-empty line - escape HTML and create paragraph
      const escapedLine = trimmedLine
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      return `<p>${escapedLine}</p>`;
    }
  });
  
  return paragraphs.join('');
};

// Custom paste handler extension
const PasteHandler = Extension.create({
  name: 'pasteHandler',
  
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('pasteHandler'),
        props: {
          handlePaste(view, event) {
            // Get the clipboard data
            const clipboardData = event.clipboardData || (event as ClipboardEvent).clipboardData;
            const plainText = clipboardData?.getData('text/plain');
            const htmlText = clipboardData?.getData('text/html');
            
            // If it's plain text (not HTML), format it properly
            if (plainText && !htmlText) {
              event.preventDefault();
              
              const formattedHtml = formatTextToHtml(plainText);
              
              // Use simple HTML insertion - let ProseMirror handle the parsing
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = formattedHtml;
              
              // Use ProseMirror's DOMParser to convert to proper document structure
              const parser = DOMParser.fromSchema(view.state.schema);
              const slice = parser.parseSlice(tempDiv);
              
              // Insert the content at current selection
              const tr = view.state.tr.deleteSelection().insert(view.state.selection.from, slice.content);
              view.dispatch(tr);
              
              return true; // Handled
            }
            
            return false; // Not handled
          },
        },
      }),
    ];
  },
});

const TiptapEditor = () => {
  const [initialContent, setInitialContent] = useState<string | null>(null);
  const [isEditorCoreInitialized, setIsEditorCoreInitialized] = useState(false);
  const [isPaginationPluginReady] = useState(true);


  const editorExtensions = useMemo(() => {
    return [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      PasteHandler,
      PaginationPlus.configure({
        pageHeight: 842,
        pageGap: 20,
        pageBreakBackground: "hsl(var(--background))",
        pageHeaderHeight: 50,
        footerText: "Page",
        headerText: "transcript.txt",
      }),
    ];
  }, []);

  useEffect(() => {
    fetch('/transcript.txt')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(text => {
        // Use the proper formatting function instead of line-by-line conversion
        const htmlContent = formatTextToHtml(text);
        setInitialContent(htmlContent);
      })
      .catch(() => {
        setInitialContent("<p>Error loading transcript.</p>");
      });
  }, []);

  const editor = useEditor({
    extensions: editorExtensions,
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] px-24 py-12",
      },
    },
  }, [initialContent, editorExtensions]);

  useEffect(() => {
    if (editor && initialContent) {
      console.log('Editor and content ready, setting core initialized');
      const timer = setTimeout(() => {
        setIsEditorCoreInitialized(true);
      }, 50);
      
      return () => {
        clearTimeout(timer);
      };
    } else {
      setIsEditorCoreInitialized(false);
    }
  }, [editor, initialContent]);

  const showEditor = initialContent !== null && !!editor && isEditorCoreInitialized && isPaginationPluginReady;

  useEffect(() => {
    if (showEditor && editor) {
      editor.commands.focus();
    }
  }, [showEditor, editor]);

  return (
    <div 
      className="bg-white shadow-lg rounded-md max-w-3xl mx-auto min-h-[calc(100vh-4rem)] relative"
    >
      {!showEditor ? (
        <div className="spinner-container">
          <div className="loader"></div>
          {editor && initialContent && (
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: 'auto',
              opacity: 0,
              zIndex: -1,
              pointerEvents: 'none',
            }}>
              <EditorContent editor={editor} />
            </div>
          )}
        </div>
      ) : (
        <EditorContent
          editor={editor}
          className="w-full"
          id="editor"
          style={{
            opacity: 1,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}
    </div>
  );
};

export default TiptapEditor;
