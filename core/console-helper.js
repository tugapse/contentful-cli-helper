class ConsoleHelper {

    header(message, size, symbol = "#") {
        size = size || message.length + 5;
        console.log("\n".padEnd(size, symbol));
        console.log("# " + message);
        console.log("".padEnd(size, symbol));
    }
    buildHeaderSring(message, size, symbol = "#") {
        size = size || message.length + 5;
        return `\n\n${"".padEnd(size, symbol)}\n${symbol} ${message}\n${"".padEnd(size, symbol)}\n`
    }
    line(line) {
        console.log("> " + line)
    }

    bullet(messsage, space = 4) {
        console.log(" * ".padStart(space, " ") + messsage)
    }
    buildBullet(messsage, space = 4) {
        return " * ".padStart(space, " ") + messsage
    }
}
module.exports = ConsoleHelper;