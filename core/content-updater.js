const { exec } = require("child_process");
const ConsoleHelper = require("./console-helper");

const COMMANDS = {
  RemoveEnvironment: "contentful space environment delete",
  ListSpaces: "contentful space environment list",
  UseSpace: `contentful space use`,
  DEVtoQA: `contentful space environment create --name="qa" --environment-id="qa" --source="dev"`,
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


class ContentUpdater extends ConsoleHelper{
  readLine = null;
  spaceId = null;
  environmentHelper = null;

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
    const result = await this.updateEnvironment(actions[+command]);
    this.print(result);
  }

  async useSpace(spaceId) {
    // TODO remove dev space ID
    this.spaceId = spaceId || "e6ntcn5odprs";
    const args = spaceId ? { "--space-id": this.spaceId } : null;
    return this.runCommand(COMMANDS.UseSpace, args);
  }

  async updateEnvironment(updateAction) {
    if (!updateAction) {
      return "\n\nPlease provide a valid option!";
    }

    await this.useSpace("e6ntcn5odprs");
    const { from, to } = this.parseFromToEnvironment(updateAction);
    const fromFname = await this.createEnvironmentBackup(from);
    const toFname = await this.createEnvironmentBackup(to);

    const result = this.environmentHelper.checkDiferences(from, to, fromFname, toFname);
    this.print("Checking done.")
    if (!result.equal) {
      this.print(
        `\n${result.resultString}\n> We have missing ContentModel Keys in ${to}!\n`
      );
      await this.wait("Press ENTER to continue...");
    }

    if (
      await this.ask(
        `Are you sure you want to do the update ${from} to ${to}?\n> `.toUpperCase()
      )
    ) {
      return await this.runUpdateEnvironmentCommand(fromFname, to);
    }

    return "I see, you are safe for now!";
  }

  runCommand = async (command, args = null, outputCallback = null) => {
    return new Promise((resolve, reject) => {
      const cmd = command + this.getCommandArgs(args);
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

  async listEnvironments() {
    throw new Error("Do not use for now!");
    await this.useSpace();

    const output = await this.runCommand(COMMANDS.ListSpaces);
    const environments = output.split("\n").reduce((acc, cur) => {
      if (cur.includes("90m")) return acc;
      else {
        return [...acc, cur];
      }
    }, []);
  }

  async removeEnvironment(env) {
    this.print(`Trying to delete environment ${env}.`);
    return this.runCommand(COMMANDS.RemoveEnvironment, {
      "--environment-id": env,
    });
  }

  async runUpdateEnvironmentCommand(fromFile, to) {
    this.print(`\n\nStarting environment update. Let us pray !`);
    return this.runCommand(COMMANDS.FromToEnvironment, {
      "--content-file": fromFile,
      "--environment-id": to,
    });
  }

  async createEnvironmentBackup(env, verbose = false) {
    this.print(`Creating backup of ${env} environment. Please wait!`);
    let filename = "";
    await this.runCommand(
      COMMANDS.ExportEnvironment,
      {
        "--environment-id": env,
      },
      (output) => {
        const index = output.indexOf("Stored space data to json file");
        if (index >= 0) {
          filename = this.sanitizeBackupFilename(output);
          this.print("backup saved to >> " + filename);
        }
        if (verbose) this.print(output);
      }
    );
    return filename;
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
