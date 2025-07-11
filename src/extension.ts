////////////////////////////////////////////////////////////////////////////////
// Copyright 2021 DontShaveTheYak
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License
//
// Author: DontShaveTheYak
// No warranty of merchantability or fitness of any kind.
// Use this software at your own risk.
////////////////////////////////////////////////////////////////////////////////
import findJava from "./utils/findJava";
import * as path from "path";
import * as vscode from "vscode";
import { extensionStatusBar } from "./gui/extensionStatusBarProvider";
import {
  LanguageClient,
  LanguageClientOptions,
  Executable,
} from "vscode-languageclient/node";

const MISSING_JAVA_ERROR =
  "Could not locate valid JDK. To configure JDK manually, use the groovy.java.home setting.";
const INVALID_JAVA_ERROR =
  "The groovy.java.home setting does not point to a valid JDK.";
const INITIALIZING_MESSAGE = "Initializing Groovy language server...";
const RELOAD_WINDOW_MESSAGE =
  "To apply new settings for Groovy, please reload the window.";
const STARTUP_ERROR = "The Groovy extension failed to start.";
const LABEL_RELOAD_WINDOW = "Reload Window";
let extensionContext: vscode.ExtensionContext | null = null;
let languageClient: LanguageClient | null = null;
let javaPath: string | null = null;

let channel = vscode.window.createOutputChannel('Easy Groovy Client');

function onDidChangeConfiguration(event: vscode.ConfigurationChangeEvent) {

  channel.appendLine('The configuration has changed.');

  if (event.affectsConfiguration("groovy.java.home")) {

    channel.appendLine('The setting "groovy.java.home" has been updated.');

    javaPath = findJava();

    channel.appendLine(`The new java path is now ${javaPath}.`);

    //we're going to try to kill the language server and then restart
    //it with the new settings
    restartLanguageServer();
  } else if (event.affectsConfiguration("groovy.lsp.debug")) {
    channel.appendLine('The setting "groovy.lsp.debug" has been updated.');
    restartLanguageServer();
  }
}

function restartLanguageServer() {

  channel.appendLine('Restarting the Language Server.');

  extensionStatusBar.restart();

  if (!languageClient) {
    startLanguageServer();
    return;
  }
  let oldLanguageClient = languageClient;
  languageClient = null;
  oldLanguageClient.stop().then(
    () => {
      startLanguageServer();
    },
    () => {
      //something went wrong restarting the language server...
      //this shouldn't happen, but if it does, the user can manually restart
      vscode.window
        .showWarningMessage(RELOAD_WINDOW_MESSAGE, LABEL_RELOAD_WINDOW)
        .then((action) => {
          if (action === LABEL_RELOAD_WINDOW) {
            vscode.commands.executeCommand("workbench.action.reloadWindow");
          }
        });
    }
  );
}

export function activate(context: vscode.ExtensionContext) {

  channel.appendLine('The extension has been activated.');

  extensionContext = context;

  // Enable the status bar and tell it to display.
  context.subscriptions.push(extensionStatusBar);
  extensionStatusBar.startUp();

  javaPath = findJava();

  vscode.workspace.onDidChangeConfiguration(onDidChangeConfiguration);

  vscode.commands.registerCommand(
    "groovy.restartServer",
    restartLanguageServer
  );

  startLanguageServer();
}

export function deactivate() {
  channel.appendLine('The extension is deactivating.');
  extensionContext = null;
}

function startLanguageServer() {

  channel.appendLine('Starting the language server.');

  vscode.window.withProgress(
    { location: vscode.ProgressLocation.Window },
    (progress) => {
      return new Promise<void>((resolve, reject) => {
        if (!extensionContext) {
          //something very bad happened!
          resolve();
          extensionStatusBar.setError();
          vscode.window.showErrorMessage(STARTUP_ERROR);
          return;
        }
        if (!javaPath) {
          extensionStatusBar.setError();
          resolve();
          let settingsJavaHome = vscode.workspace
            .getConfiguration("groovy")
            .get("java.home") as string;

          if (settingsJavaHome) {

            extensionStatusBar.updateTooltip(INVALID_JAVA_ERROR);
            vscode.window.showErrorMessage(INVALID_JAVA_ERROR);

          } else {
            extensionStatusBar.updateTooltip(MISSING_JAVA_ERROR);
            vscode.window.showErrorMessage(MISSING_JAVA_ERROR);
          }

          return;

        }

        progress.report({ message: INITIALIZING_MESSAGE });

        let clientOptions: LanguageClientOptions = {
          documentSelector: [{ scheme: "file", language: "groovy" }],
          synchronize: {
            configurationSection: "groovy",
          },
          uriConverters: {
            code2Protocol: (value: vscode.Uri) => {
              if (/^win32/.test(process.platform)) {
                //drive letters on Windows are encoded with %3A instead of :
                //but Java doesn't treat them the same
                return value.toString().replace("%3A", ":");
              } else {
                return value.toString();
              }
            },
            //this is just the default behavior, but we need to define both
            protocol2Code: (value) => vscode.Uri.parse(value),
          },
        };

        let args = [
          "-jar",
          path.resolve(
            extensionContext.extensionPath,
            "bin",
            "groovy-language-server-all.jar"
          ),
        ];

        let settingsLSPDebug = vscode.workspace
          .getConfiguration("groovy")
          .get("lsp.debug") as boolean;
        if (settingsLSPDebug) {
          args.unshift("-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:0,quiet=y");
        }

        let executable: Executable = {
          command: javaPath,
          args: args,
        };
        languageClient = new LanguageClient(
          "groovy",
          "Groovy Language Server",
          executable,
          clientOptions
        );
        languageClient.onReady().then(resolve, (reason: any) => {
          resolve();
          extensionStatusBar.setError();
          vscode.window.showErrorMessage(STARTUP_ERROR);
        });
        let disposable = languageClient.start();
        extensionContext.subscriptions.push(disposable);

        channel.appendLine('The extension is running.');

        extensionStatusBar.running();
      });
    }
  );
}
