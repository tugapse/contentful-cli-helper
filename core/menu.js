class Menu {
  events = {};
  readLine = null;

  constructor(readLine) {
    this.readLine = readLine;
  }

  init() {}

  createMenuOptions(menuOptions, initialText = "") {
    return menuOptions.reduce((prev, curr, index) => {
      const endLine = index === menuOptions.length - 1 ? "\n> " : "";
      return `${prev} ${index} - ${curr} \n ${endLine}`;
    }, initialText);
  }

  showMainMenu = () => {
    const menuOptions = [
      "Exit script",
      "Update environment",
      "Backup environment",
      "Restore environment",
    ];
    const question = this.createMenuOptions(
      menuOptions,
      "\nPlease select an action:\n "
    );
    this.readLine.question(question, this.handleMainSelection);
  };

  showUpdateMenu = () => {
    const menuOptions = [
      "<-- Go back",
      "Update DEV to QA",
      "Update QA to Staging",
      "Update Staging to Preview",
      "Update Preview to Live",
    ];
    const question = this.createMenuOptions(
      menuOptions,
      "\nSelect a environment to update:\n "
    );
    this.readLine.question(question, this.handleUpdateSelection);
  };

  handleMainSelection = (answer) => {
    switch (Number(answer)) {
      case 0:
        this.readLine.close();
      case 1:
        console.log("let's do the update!");
        this.showUpdateMenu();
        break;
      case 2:
      case 3:
        console.log("Soon .... very soon ...");
        this.showMainMenu();
        break;
      default:
        console.log("Please Select a valid option");
        this.showMainMenu();
        break;
    }
  };

  handleUpdateSelection = async (answer) => {
    const actions = [
      UPDATE_ACTION.DevToQa,
      UPDATE_ACTION.QaToStaging,
      UPDATE_ACTION.StagingToPreview,
      UPDATE_ACTION.PreviewToLive,
    ];
    const selection = Number(answer);
    switch (selection) {
      case 0:
        console.debug("Going back :)");
        this.showMainMenu();
        break;
      case Number(selection <= actions.length):
        console.log("Starting process, \nJust make a coffee and relax !");
        this.emmit(MENUS.Update, selection);
        // const result = await this.updater.updateEnvironment(
        //   actions[selection - 1]
        // );
        break;
      default:
        console.log("Please Select a valid option");
        break;
    }
    this.showMainMenu();
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
