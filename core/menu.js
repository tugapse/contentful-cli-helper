const {ConsoleHelper, ConsoleColor} = require("./console-helper");

class Menu extends ConsoleHelper {
  events = {};
  readLine = null;

  constructor(readLine) {
    super();
    this.readLine = readLine;
  }

  init() { }

  createMenuOptions(menuOptions, initialText = "") {
    return menuOptions.reduce((prev, curr, index) => {
      const endLine = index === menuOptions.length - 1 ? "\n> " : "";
      return `${prev} ${ConsoleColor.Green} ${index}${ConsoleColor.Default} - ${curr} \n ${endLine}`;
    }, initialText);
  }

  showMainMenu = (text = null) => {

    if (text) console.log(text);

    const menuOptions = [
      ConsoleColor.Yellow + "Exit script",
      "Update environment",
      "Backup environment",
      "Restore environment from file",
    ];
    const question = this.createMenuOptions(
      menuOptions,
      ConsoleColor.Green + "Please select an action:\n "
    );
    this.readLine.question(question, this.handleMainSelection);
  };

  showUpdateMenu = (text = null) => {

    if (text) console.log(text);

    const menuOptions = [
      ConsoleColor.Yellow + "<-- Go back",
      "Update DEV to QA",
      "Update QA to Staging",
      "Update Staging to Preview",
      "Update Preview to Live",
    ];
    const question = this.createMenuOptions(
      menuOptions,
      ConsoleColor.Green + "Select a environment to update:\n "
    );
    this.readLine.question(question, this.handleUpdateSelection);
  };

  handleMainSelection = (answer) => {
    this.line();
    if (answer) {
      switch (Number(answer)) {
        case 0:
          this.readLine.close();
        case 1:
          this.showUpdateMenu(ConsoleColor.LightBlue + "let's do the update!");
          break;
        case 2:
        case 3:
          this.showMainMenu(ConsoleColor.Red + "Soon .... very soon ...");
          break;
        default:
          this.showMainMenu(ConsoleColor.Yellow + "\nPlease Select a valid option");
          break;
      }
      return;
    }
    this.showMainMenu("\nPlease Select a valid option");
  };

  handleUpdateSelection = async (answer) => {
    this.line();
    if (answer) {
      const selection = Number(answer);
      switch (selection) {
        case 0:
          this.showMainMenu("Going back :)");
          break;
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          this.header("Starting update process");
          this.print("Just make a coffee and relax !")
          this.emmit(MENUS.Update, selection);
          break;
          default:
          this.showUpdateMenu("\nPlease Select a valid option");
          break;
      }
      return;
    }
    this.showUpdateMenu("\nPlease Select a valid option");
  };

  addEventListener(eventName, listener) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(listener);
  }

  removeEventListener(eventName, listener) {
    if (!this.events[eventName]) return;

    const index = this.events[eventName].findIndex(listener);
    if (index > -1) {
      this.events[eventName].splice(index, 1);
    }
  }

  emmit(eventName, data) {
    if (!this.events[eventName]) return;

    this.events[eventName].forEach((callback) => {
      callback(data);
    });
  }
}

const MENUS = {
  Main: 0,
  Update: 1,
};

module.exports = { MENUS, Menu };
