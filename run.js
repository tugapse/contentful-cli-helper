const readline = require("readline");

const { ContentUpdater, UPDATE_ACTION } = require("./core/content-updater");
const { Menu, MENUS } = require("./core/menu");
const { EnvironmentHelper } = require("./core/environment-checker");
const { ConsoleHelper, ConsoleColor } = require("./core/console-helper");

const Config = require("./config");

class Main extends ConsoleHelper {
  readLine = null;
  close = false;
  updater = null;
  menu = null;

  init() {

    this.initializeInputOutputBuffer();

    this.menu = new Menu(this.readLine);
    this.updater = new ContentUpdater(this.readLine, new EnvironmentHelper());

    this.menu.addEventListener(MENUS.Update, async (eventData) => {
      await this.updater.parseUpdateMenuCommand(eventData);
      this.menu.showMainMenu();
    });

    this.menu.addEventListener(MENUS.Export, async (eventData) => {
      await this.updater.parseExportEnvironmentMenuCommand(eventData);
      this.menu.showMainMenu();
    });
   this.print(ConsoleColor.Purple + "All systems ready !");

  }

  run() {
    this.init();
    this.menu.showMainMenu();
  }

  close = () => {
    this.print( ConsoleColor.Purple + "Closing script. Bye :)");
    process.exit(0);
  };

  initializeInputOutputBuffer() {
   this.print(ConsoleColor.Purple + "Initializing Buffers ...");
    this.readLine = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.readLine.on("close", () => this.close());
  }
}

new Main().run();
