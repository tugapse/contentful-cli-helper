// Set of space => environments
const Environments = {
  DevSpace: ["dev", "qa"],
  ProdSpace: ["staging", "preview", "prod"],
};

// ID of the Spaces
const Spaces = {
  DevSpace: "e6ntcn5odprs",
  ProdSpace: "e6ntcn5odprs",
};

const Config = {
  environmentList: ["dev", "qa", "staging", "preview", "prod"],
  debug: {
    showShellCommands: false,
    showUpdateVerbose: false,
  },

  getSpaceId: (environment) => {
    for (key in Environments) {
      if (Environments[key].includes(environment)) {
        return Spaces[key];
      }
    }
    return null;
  },
};
module.exports = Config;
