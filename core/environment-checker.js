const fs = require('fs');
const ConsoleHelper = require('./console-helper');


class EnvironmentHelper extends ConsoleHelper{

    checkDiferences(from, to, fromFile, toFile) {
        console.log("\nChecking diferences: " + from + " -> " + to + ", please wait ...");
        const fromObj = this.loadJsonObject("contentful-export-e6ntcn5odprs-qa-2022-07-29T17-34-42.json").contentTypes;
        const toObj = this.loadJsonObject("contentful-export-e6ntcn5odprs-qa-2022-07-29T17-39-27.json").contentTypes;
        return this.checkContentDiferences(fromObj, toObj);
    }

    checkContentDiferences(fromContentTypes, toContentTypes) {
        const result = { equal: true, resultString: "", diffs: {} };
        fromContentTypes.forEach(contentType => {
            const toContentType = toContentTypes.find(elm => elm.sys.id === contentType.sys.id)
            if (toContentType) {
                const res = this.getDiferentFields(contentType, toContentType);
                if (res.length) {
                    result.equal = false;
                    result.diffs[toContentType.sys.id] = res;
                }
            }
        });
        result.resultString = this.prepareDiffText(result);
        return result;
    }


    prepareDiffText(result) {
        let resultText = "";
        for (const key in result.diffs) {
            const defaultValue = this.buildHeaderSring("ContentType : " + key);

            resultText += result.diffs[key].reduce((acc, curr) => {
                    return acc + this.buildBullet("field " + curr.id + " is missing. (type = " + curr.type + " )\n");
                }, defaultValue+"\n");
            
        }
        return resultText;
    }

    getDiferentFields(from, to) {
        const result = [];
        const toFields = to.fields;
        from.fields.forEach(fromElm => {
            if (!toFields.find(toElm => toElm.id === fromElm.id)) {
                result.push(fromElm);
            }
        });
        return result;
    }


    loadJsonObject(filename) {
        return JSON.parse(fs.readFileSync(filename));
    }
}

module.exports = { EnvironmentHelper }