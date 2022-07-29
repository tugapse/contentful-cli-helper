const readline = require("readline");

const { ContentUpdater, UPDATE_ACTION } = require("./core/content-updater");
const { Menu, MENUS } = require("./core/menu");

class Main {
  readLine = null;
  close = false;
  updater = null;
  menu = null;

  constructor() {}

  init() {
    this.readLine = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.readLine.on("close", function () {
      console.log(`Closing Script `);
      process.exit(0);
    });

    this.updater = new ContentUpdater(this.readLine);
    this.menu = new Menu(this.readLine);

    this.menu.addEventListener(MENUS.Update, async (eventData) => {
      
      await this.updater.parseMenuCommand(eventData);
      this.menu.showUpdateMenu();
    });
  }
  run() {
    this.init();
    this.menu.showMainMenu();
  }

  close() {}
}

new Main().run();
