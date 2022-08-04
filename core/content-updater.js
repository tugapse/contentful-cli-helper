const { exec } = require("child_process");

const Config = require("../config");
const { ConsoleHelper, ConsoleColor } = require("./console-helper");

const COMMANDS = {
  RemoveEnvironment: "contentful space environment delete",
  ListSpaces: "contentful space environment list",
  FromToEnvironment: `contentful space import`,
  ExportEnvironment: `contentful space export`,
};

const UPDATE_ACTION = {
  DevToQa: 1,
  QaToStaging: 2,
  StagingToPreview: 3,
  PreviewToLive: 4,
};

const ErrorMessages = {
  CreateBackup: "Error creating the backup, continue anyway ? y / n \n>> ",
};

const AvaliableEnvironments = [null, "dev", "qa", "staging", "preview", "live"];


class ContentUpdater extends ConsoleHelper {
  readLine = null;
  spaceId = null;
  environmentHelper = null;
  tempBuffer = "";


  constructor(readLine, environmentHelper) {
    super();
    this.readLine = readLine;
    this.environmentHelper = environmentHelper;
  }

  async parseUpdateMenuCommand(command) {
    const actions = [
      null,
      UPDATE_ACTION.DevToQa,
      UPDATE_ACTION.QaToStaging,
      UPDATE_ACTION.StagingToPreview,
      UPDATE_ACTION.PreviewToLive,
    ];
    await this.updateEnvironment(actions[+command]);
  }

  async parseExportEnvironmentMenuCommand(environmentIndex) {
    const toExport = [];
    const index = Number(environmentIndex);

    if (index === AvaliableEnvironments.length) {
      for (const env of AvaliableEnvironments) {
        if (env != null) toExport.push(env);
      }
    } else {
      const environmentName = AvaliableEnvironments[index];
      if (!environmentName) {
        this.print("Invalid environment index: " + environment);
        return
      }
      toExport.push(environmentName);
    }

    for (const environmentName of toExport) {
      this.header(`Starting ${environmentName} environment export. Please wait!`);
      await this.exportEnvironmentToFile(environmentName, "backup");
    }

  }

  async exportEnvironmentToFile(env, backupFolder = "runtime-exports/") {

    await this.runCommand("mkdir " + backupFolder)

    const spaceId = Config.getSpaceId(env); 0

    const comamndArgs = {
      "--environment-id": env,
      "--space-id": spaceId,
      "--export-dir": "./" + backupFolder
    };

    const hanldeOutput = (output) => {

      this.tempBuffer += output;
      const index = output.indexOf("Stored space data to json file");

      if (index >= 0) {
        filename = this.sanitizeBackupFilename(output);
        this.print("Export file saved to >> " + ConsoleColor.Green + backupFolder + "/" + filename + ConsoleColor.Default);
      };
      if (Config.debug.showUpdateVerbose) console.log(output);

    }

    this.tempBuffer = "";
    let filename = "";

    this.print(`Creating backup of ${env} environment. Please wait!`);

    await this.runCommand(COMMANDS.ExportEnvironment, comamndArgs, hanldeOutput);

    if (!filename) {
      this.print(ConsoleColor.Red + "Error : It was not possible to create export for " + env + " environment!");
      this.print(ConsoleColor.Default + this.tempBuffer);
    }

    return backupFolder + "/" + filename;
  }

  async updateEnvironment(updateAction) {

    if (!updateAction) {
      this.print("Please provide a valid option!");
      return;
    }



    const { from, to } = this.yparseFromToEnvironment(updateAction);
    const fromFname = await this.exportEnvironmentToFile(from);
    const toFname = await this.exportEnvironmentToFile(to);

    const result = this.environmentHelper.checkDiferences(from, to, fromFname, toFname);

    if (result.equal) {
      this.print("Ready to update")
    } else {
      this.print(
        `\n${result.resultString}\n> We have missing ContentModel Keys in ${to}!\n`
      );
      await this.wait("Press ENTER to continue...");
    }

    this.print(`Are you sure you want to do the update ${ConsoleColor.Yellow + from + ConsoleColor.Default} to ${ConsoleColor.Yellow + to + ConsoleColor.Default}?`)


    if (await this.ask("Confirm y/n: ")) {
      return await this.runUpdateEnvironmentCommand(fromFname, to);
    }
    this.line();
    this.print("I see, you are safe for now!");
  }

  async importEnvironmentFromFile(environmentName, filename) {
    console.log("Coiso", filename)
    const question = "This action will override " + ConsoleColor.Yellow + environmentName + ConsoleColor.Default +
      " with the content of the file " + ConsoleColor.Yellow + filename + ConsoleColor.Default + " ? ( y/n )\n>";

    if (await this.ask(question)) {
      this.print(await this.runUpdateEnvironmentCommand(filename, environmentName));
    }
  }

  async runUpdateEnvironmentCommand(fromFile, to) {
    this.header(`Starting environment update. Let us pray !`);
    return this.runCommand(COMMANDS.FromToEnvironment, {
      "--content-file": fromFile,
      "--environment-id": to,
      "--space-id": Config.getSpaceId(to)

    });
  }

  runCommand = async (command, args = null, outputCallback = null) => {
    return new Promise((resolve, reject) => {
      const cmd = command + this.getCommandArgs(args);

      if (Config.debug.showShellCommands)
        this.print("Running command > " + cmd);

      const childP = exec(cmd, (error, output, errorString) => {
        if (error) resolve({ error, errorString });
        resolve(output);
      });
      if (outputCallback) childP.stdout.on("data", outputCallback);
      else childP.stdout.pipe(process.stdout);
    });
  };

  getCommandArgs(args) {
    let result = "";
    if (args) {
      result = Object.keys(args).reduce((prev, key) => {
        return `${prev} ${key}="${args[key]}"`;
      }, result);
    }
    return result;
  }


  sanitizeBackupFilename(output) {
    const filenameStart = output.indexOf("contentful-export-");
    const filenameEnd = output.indexOf(".json");
    const filename = output.substring(filenameStart, filenameEnd + 5);
    return filename;
  }

  parseFromToEnvironment(fromToEnvironment) {
    switch (fromToEnvironment) {
      case UPDATE_ACTION.DevToQa:
        return { from: "dev", to: "qa" };
      case UPDATE_ACTION.QaToStaging:
        return { from: "qa", to: "staging" };
      case UPDATE_ACTION.StagingToPreview:
        return { from: "staging", to: "preview" };
      case UPDATE_ACTION.PreviewToLive:
        return { from: "preview", to: "master" };
      // TODO add others
    }
  }




}

module.exports = { ContentUpdater, UPDATE_ACTION };
