const ConsoleColor = {
    Default: "\x1b[0m",
    Gray: "\x1b[30m",
    Red: "\x1b[31m",
    Green: "\x1b[32m",
    Yellow: "\x1b[33m",
    Blue: "\x1b[34m",
    Purple: "\x1b[35m",
    LightBlue: "\x1b[36m",
}

class ConsoleHelper {

    readLine = null;

    print(message, printToConsole = true) {
        if (!printToConsole) return "> " + message
        console.log(ConsoleColor.LightBlue ,"> ",ConsoleColor.Default, message);
    }

    alert(message, symbol="!", color=ConsoleColor.Red ) {
        console.log(color,symbol.padEnd(2,symbol), message,symbol.padEnd(2,symbol));
    }


    header(message, size, symbol = "#") {
        size = size || message.length + 5;
        console.log("\n".padEnd(size + 1, symbol));
        console.log("# " , ConsoleColor.Green , message , ConsoleColor.Default);
        console.log("".padEnd(size, symbol));
    }

    buildHeaderSring(message, size, symbol = "#") {
        size = size || message.length + 5;
        return `\n\n${"".padEnd(size, symbol)}\n${symbol} ${message}\n${"".padEnd(size, symbol)}\n`
    }

    line(size = 20) {
        console.log("".padEnd(size, "-"))
    }

    bullet(messsage, space = 4) {
        console.log("*".padStart(space, " ") , messsage)
    }

    buildBullet(messsage, space = 4) {
        return " * ".padStart(space, " ") + messsage
    }

    validateAnwser(awnser, correct) {
        return (awnser || "n").toLowerCase() === (correct || "y").toLowerCase();
    }



    ask = async (question, questions = ["y", "n"], validOption = "y") => {
        return new Promise((resolve, reject) => {
            this.readLine.question(question, async (awnser) => {
                if (
                    !questions
                        .map((op) => op.toLowerCase())
                        .includes(awnser.toLowerCase())
                ) {
                    console.log("Please select a valid option", questions);
                    awnser = await this.ask(question, questions, validOption);
                }
                resolve(this.validateAnwser(awnser, validOption));
                return awnser;
            });
        });
    };

    wait = async (question) => {
        return new Promise((resolve, reject) => {
            this.readLine.question(question, async (awnser) => {
                resolve(null);
                return null;
            });
        });
    };

    async catchError(childProcess, confirmOnErrorMessage) {
        return new Promise((resolve, reject) => {
            childProcess
                .then(async (output) => {
                    if (output.error) {
                        (await this.ask(confirmOnErrorMessage))
                            ? resolve(output)
                            : reject(output.error);
                    }
                    resolve(output);
                })
                .catch((error) => {
                    //TODO do something here, log to file for example ....
                });
        });
    }
}
module.exports = { ConsoleHelper,ConsoleColor};