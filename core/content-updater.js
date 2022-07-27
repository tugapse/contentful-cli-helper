const { exec } = require("child_process");

const COMMANDS = {
    RemoveEnvironment: "contentful space environment delete",
    ListSpaces: "contentful space environment list",
    USE_SPACE: `contentful space use`,
    DEVtoQA: `contentful space environment create --name="qa" --environment-id="qa" --source="dev"`,
    FromToEnvironment: `contentful space environment create `,
    ExportEnvironment: `contentful space export`,
}

const UPDATE_ACTION = {
    DevToQa: 1,
    QaToStaging: 2,
    StagingToPreview: 3,
    PreviewToLive: 4
}

const ErrorMessages = {
    CreateBackup: "Error creating the backup, continue anyway ? y / n \n>> "
}

class ContentUpdater {
    readLine = null;
    spaceId = null;

    constructor(readLine) { this.readLine = readLine; }

    async useSpace(spaceId) {
        // TODO remove dev space ID
        this.spaceId = spaceId || "e6ntcn5odprs";
        const args = spaceId ? { "--space-id": spaceId } : null;
        return this.runCommand(COMMANDS.USE_SPACE, args);
    }

    async updateEnvironment(fromToEnvironment) {
        const { from, to } = this.parseFromToEnvironment(fromToEnvironment);
        await this.useSpace("e6ntcn5odprs");
        if (!await this.runOptional(this.createEnvironmentBackup(to), ErrorMessages.CreateBackup)) return;
        await this.removeEnvironment(to);
        const result = await this.runUpdateEnvironmentCommand(from, to);
    }

    runCommand = async (command, args = null, outputCallback = null) => {
        return new Promise((resolve, reject) => {
            const cmd = command + this.getCommandArgs(args)
            const childP = exec(cmd, (error, output, errorString) => {
                if (error) resolve({ error, errorString });
                resolve(output);
            });
            if (outputCallback) childP.stdout.on('data', outputCallback);
            else childP.stdout.pipe(process.stdout);
        });
    }

    getCommandArgs(args) {
        let result = "";
        if (args) {
            result = Object.keys(args).reduce((prev, key) => { return `${prev} ${key}="${args[key]}"` }, result)
        }
        return result;

    }

    async listEnvironments() {
        await this.useSpace();
        const output = await this.runCommand(COMMANDS.ListSpaces);
        const environments = output.split("\n").reduce((acc, cur) => {
            if (cur.includes("90m")) return acc;
            else { return [...acc, cur] }
        }, []);
        debugger
    }

    async removeEnvironment(env) {
        console.log(`Trying to delete environment ${env}.`)
        return this.runCommand(COMMANDS.RemoveEnvironment, { "--environment-id": env })
    }

    async runUpdateEnvironmentCommand(from, to) {
        console.log(`Starting environment update.\nLet us pray !`)
        return this.runCommand(COMMANDS.FromToEnvironment, {
            "--name": to, "--environment-id": to, "--source": from
        });

    }

    async createEnvironmentBackup(env) {
        console.log(`Creating backup of ${env} environment!`);
        return await this.runCommand(COMMANDS.ExportEnvironment, { "--environment-id": env });
    }

    parseFromToEnvironment(fromToEnvironment) {
        switch (fromToEnvironment) {
            case UPDATE_ACTION.DevToQa:
                return { from: "dev", to: "qa" }
            case UPDATE_ACTION.QaToStaging:
                return { from: "qa", to: "staging" }
            case UPDATE_ACTION.StagingToPreview:
                return { from: "staging", to: "preview" }
            case UPDATE_ACTION.PreviewToLive:
                return { from: "preview", to: "master" }
            // TODO add others
        }
    }
    async runOptional(childProcess, confirmOnError) {
        return new Promise((resolve, reject) => {
            childProcess.then(async output => {
                if (output?.error) { await this.ask(confirmOnError) ? resolve(output) : reject(output.error) }
                resolve(output)
            }).catch(error => {
                //TODO do something here, log to file for example ....
            });
        });
    }

    validateAnwser(awnser, correct) {
        return (awnser || "n").toLowerCase() === (correct || "y").toLowerCase();
    }

    ask = async (question, questions = ["y", "n"], validOption = "y") => {
        return new Promise((resolve, reject) => {
            this.readLine.question(question, async awnser => {
                if (!questions?.map(op => op.toLowerCase()).includes(awnser.toLowerCase())) {
                    console.log("Please select a valid option", questions);
                    awnser = await this.ask(question, questions, validOption);
                }
                resolve(this.validateAnwser(awnser, validOption))
                return awnser;
            });
        });
    }
}

module.exports = { ContentUpdater, UPDATE_ACTION };