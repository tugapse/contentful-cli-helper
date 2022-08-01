const readline = require("readline");

const { ContentUpdater, UPDATE_ACTION } = require("./core/content-updater");
const { Menu, MENUS } = require("./core/menu");
const { EnvironmentHelper } = require("./core/environment-checker");

class Main {
  readLine = null;
  close = false;
  updater = null;
  menu = null;

  constructor() {}

  init() {
    this.initializeInputOutputBuffer();

    this.menu = new Menu(this.readLine);
    this.updater = new ContentUpdater(this.readLine, new EnvironmentHelper());
    this.menu.addEventListener(MENUS.Update, async (eventData) => {
      await this.updater.parseUpdateMenuCommand(eventData);
      this.menu.showMainMenu();
    });
  }

  run() {
    this.init();
    this.menu.showMainMenu();
  }

  close = () => {
    console.log("Closing script. Bye :)");
    process.exit(0);
  };

  initializeInputOutputBuffer() {
    console.log("Initializing Buffers ...");
    this.readLine = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.readLine.on("close", () => this.close());
  }
}

new Main().run();
