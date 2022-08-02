const fs = require('fs');
const { ConsoleHelper, ConsoleColor } = require("./console-helper");


class Menu extends ConsoleHelper {
  events = {};
  readLine = null;

  Colors = {
    MenuTitle: ConsoleColor.Blue,
    MenuOption: ConsoleColor.LightBlue,
    MenuBackOption: ConsoleColor.Gray
  }

  constructor(readLine) {
    super();
    this.readLine = readLine;
  }

  init() { }

  createMenuOptions(menuOptions, initialText = "") {
    return menuOptions.reduce((prev, curr, index) => {
      const endLine = index === menuOptions.length - 1 ? "\n> " : "";
      return `${prev} ${this.Colors.MenuOption} ${index}${ConsoleColor.Default} - ${curr} \n ${endLine}`;
    }, initialText);
  }

  showMainMenu = (text = null) => {

    if (text) this.print(text);

    const menuOptions = [
      this.Colors.MenuBackOption + "Exit script",
      "Update environment",
      "Export  environment to file",
      "Restore environment from file",
    ];
    const question = this.createMenuOptions(menuOptions,
      this.Colors.MenuTitle + "Please select an action:\n "
    );
    this.readLine.question(question, this.handleMainSelection);
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
          this.showExportMenu();
          break;
        case 3:
          this.showRestoreMenu();
          break;
        default:
          this.showMainMenu(ConsoleColor.Yellow + "Please Select a valid option");
          break;
      }
      return;
    }
    this.showMainMenu("\nPlease Select a valid option");
  };

  showUpdateMenu = (text = null) => {

    if (text) console.log(text);

    const menuOptions = [
      this.Colors.MenuBackOption + "<-- Go back",
      "Update DEV to QA",
      "Update QA to Staging",
      "Update Staging to Preview",
      "Update Preview to Live",
    ];
    const question = this.createMenuOptions(
      menuOptions,
      ConsoleColor.Blue + "Select a environment to update:\n "
    );
    this.readLine.question(question, this.handleUpdateSelection);
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

  showExportMenu(text) {

    if (text) this.print(text);

    const menuOptions = [
      ConsoleColor.Yellow + "<-- Go back",
      "Backup DEV environment",
      "Backup QA environment",
      "Backup Staging environment",
      "Backup Preview environment",
      "Backup live environment",
      "Create full backup (All Environments)"
    ];
    const question = this.createMenuOptions(
      menuOptions,
      this.Colors.MenuTitle + "Select a environment to create backup:\n "
    );
    this.readLine.question(question, this.handleExportMenu);
  }

  handleExportMenu = (answer) => {
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
        case 6:
          this.emmit(MENUS.Export, selection);
          break;
        default:
          this.showExportMenu("\nPlease Select a valid option");
          break;
      }
    }
    this.showExportMenu("\nPlease Select a valid option");

  }

  showRestoreMenu = (text = null) => {

    if (text) console.log(text);

    const menuOptions = [
      this.Colors.MenuBackOption + "<-- Go back",
      "Restore dev environment",
      "Restore qa environment",
      "Restore staging environment",
      "Restore preview environment",
      "Restore live environment",
    ];
    const question = this.createMenuOptions(menuOptions,
      this.Colors.MenuTitle + "Please select an action:\n "
    );
    this.readLine.question(question, this.handleRestoreMenu);
  };

  handleRestoreMenu = (answer) => {
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
          this.getFileToImport()
          break;
        default:
          this.showRestoreMenu("\nPlease Select a valid option");
          break;
      }
    }
    this.showRestoreMenu("\nPlease Select a valid option");

  }

  getFileToImport(env) {
    this.readLine.question("Please enter filename to import for\n> ",
      (file) => {
        try {
          fs.accessSync(file)
        } catch (err) {
          this.alert("The file " + file + " was not found");
          this.showExportMenu();
          return;
        }         
         this.emmit(MENUS.Import, file);
      });
  }



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
  Export: 2,
  Import: 3
};

module.exports = { MENUS, Menu };
