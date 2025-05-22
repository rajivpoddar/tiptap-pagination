"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { PaginationPlus } from "tiptap-pagination-plus";
import { useEffect, useState, useCallback, useMemo } from "react";

const TiptapEditor = () => {
  const [initialContent, setInitialContent] = useState<string | null>(null);
  const [isEditorCoreInitialized, setIsEditorCoreInitialized] = useState(false);
  const [isPaginationPluginReady, setIsPaginationPluginReady] = useState(false);

  const handlePaginationPluginReady = useCallback(() => {
    setIsPaginationPluginReady(true);
  }, []);

  const editorExtensions = useMemo(() => {
    return [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      PaginationPlus.configure({
        pageHeight: 842,
        pageGap: 20,
        pageBreakBackground: "hsl(var(--background))",
        pageHeaderHeight: 50,
        footerText: "Page",
        headerText: "transcript.txt",
        onReady: handlePaginationPluginReady,
      }),
    ];
  }, [handlePaginationPluginReady]);

  useEffect(() => {
    fetch('/transcript.txt')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(text => {
        const lines = text.split('\n');
        const htmlContent = lines.map(line => `<p>${line}</p>`).join('');
        setInitialContent(htmlContent);
      })
      .catch(error => {
        console.error("Failed to fetch transcript:", error);
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
    onUpdate: ({ editor }) => {
      console.log(editor.getJSON());
    },
  }, [initialContent, editorExtensions]);

  useEffect(() => {
    if (editor && initialContent) {
      const timer = setTimeout(() => {
        setIsEditorCoreInitialized(true);
      }, 50);
      
      return () => {
        clearTimeout(timer);
      };
    } else {
      setIsEditorCoreInitialized(false);
      setIsPaginationPluginReady(false);
    }
  }, [editor, initialContent]);

  const showEditor = initialContent !== null && !!editor && isEditorCoreInitialized && isPaginationPluginReady;

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
