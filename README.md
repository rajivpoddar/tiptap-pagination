# TipTap Pagination - Demo

[![NPM](https://img.shields.io/npm/v/tiptap-pagination-plus.svg)](https://www.npmjs.com/package/tiptap-pagination-plus)

This is a demo application for the `tiptap-pagination-plus` plugin ([https://github.com/rajivpoddar/tiptap-pagination-plus](https://github.com/rajivpoddar/tiptap-pagination-plus)).
It showcases how to create a simple paginated document editor using CSS floats for page layout.

## Demo Development

To run this demo locally:

1.  **Clone the demo repository:**
    ```bash
    git clone https://github.com/rajivpoddar/tiptap-pagination.git
    cd tiptap-pagination
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will typically start the demo on `http://localhost:5173`.

## Plugin Development

If you want to develop the `tiptap-pagination-plus` plugin itself and see your changes reflected in this demo:

1.  **Clone the plugin repository (in a separate directory):**
    ```bash
    git clone https://github.com/rajivpoddar/tiptap-pagination-plus.git
    cd tiptap-pagination-plus
    ```
2.  **Build and link the plugin:**
    In the `tiptap-pagination-plus` directory, build the plugin and then link it:
    ```bash
    npm install 
    npm run build # Or the appropriate build script for the plugin
    npm link
    ```
3.  **Link the plugin in the demo project:**
    In the `tiptap-pagination` (demo) directory, link the local plugin:
    ```bash
    npm link tiptap-pagination-plus
    ```
4.  **Run the demo project:**
    If it's not already running, start the demo project's development server:
    ```bash
    npm run dev
    ```
    Changes made to the plugin code should now reflect in the running demo upon rebuilding the plugin.

## License

MIT
