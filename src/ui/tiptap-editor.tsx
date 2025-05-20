"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import {
  PaginationPlus,
  TableCellPlus,
  TableHeaderPlus,
  TablePlus,
  TableRowPlus,
} from "tiptap-pagination-plus";
import { useEffect } from "react";

const TiptapEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TablePlus,
      TableRowPlus,
      TableCellPlus,
      TableHeaderPlus,
      ListItem,
      PaginationPlus.configure({
        pageHeight: 842,
        pageGap: 20,
        pageBreakBackground: "hsl(var(--background))",
        pageHeaderHeight: 50,
        footerText: "Page",
        headerText: "transcript.txt"
      }),
    ],
    content: "<p>Loading transcript...</p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] px-24 py-12",
      },
    },
    onUpdate: ({ editor }) => {
      console.log(editor.getJSON());
    },
  });

  useEffect(() => {
    if (editor) {
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
          editor.commands.setContent(htmlContent);
        })
        .catch(error => {
          console.error("Failed to fetch transcript:", error);
          editor.commands.setContent("<p>Error loading transcript.</p>");
        });
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="bg-white shadow-lg rounded-md max-w-3xl mx-auto min-h-[calc(100vh-4rem)]">
      <EditorContent
        editor={editor}
        className="w-full " 
        id="editor"
      />
    </div>
  );
};

export default TiptapEditor;
