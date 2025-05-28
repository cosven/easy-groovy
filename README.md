# Groovy IntelliSense for Visual Studio Code

Forked from <https://github.com/DontShaveTheYak/groovy-guru>

Since groovy-guru did not update for a long time, I forked the project and fix
some problems that I met. Check the changelog for details.

## Changelog

- 0.1.2 (2025-05-28)
  - Add `groovy.lsp.debug` variable to enable debug mode for the Groovy Language Server.
- 0.1.1 (2025-05-19)
  - Use the latest Groovy Language Server
  - Patch the Groovy Language Server [patch](https://github.com/GroovyLanguageServer/groovy-language-server/pull/102)
- 0.1.0 (2025-05-15)
  - Just fork the groovy-guru project and give it a new name.

## Quick Start

Welcome! 👋🏻<br/>
Whether you are new to Groovy or an experienced Groovy developer, we hope this
extension fits your needs and enhances your development experience.

* **Step 1.** If you haven't done so already, install [Java 1.8 aka 8](https://www.java.com/en/download/help/index_installing.html)
  and the [VS Code Groovy extension].
  * [Managing extensions in VS Code].
* **Step 2.** To activate the extension, open any directory or workspace
  containing Groovy code and look for the thumbs up! 👍
  <img src="docs/images/status-bar.png">

You are ready to get Groovy :-) &nbsp;&nbsp; 🎉🎉🎉

## Features

The extension is currently a work-in-progress but does provide basic IntelliSense. We plan to extend this extension to include code navigation and code editing.

- Code completion and Signature help
  <img src="docs/images/completion-signature-help.gif">
- See GroovyDoc strings on Classes, Fields, Methods and Functions.
  <img src="docs/images/docstring-help.gif">

## Build from source

You first need to build the language server.

```sh
yarn run build
```

Now you can install it into vscode.

- Using the CLI
  ```sh
  code --install-extension easy-groovy-0.x.y.vsix
  ```

- Using the GUI
  - Type `ctrl` + `shift` + `p`
  - Then type `Extensions: Install from VSIX`
  - Then find this directory and select `easy-groovy-0.x.y.vsix`

## Acknowledgements
* [Groovy Language Server](https://github.com/prominic/groovy-language-server)
<!-- * [Best-README-Template](https://github.com/othneildrew/Best-README-Template) -->

[Managing extensions in VS Code]: https://code.visualstudio.com/docs/editor/extension-gallery
[VS Code Groovy extension]: https://marketplace.visualstudio.com/items?itemName=cosven.easy-groovy
