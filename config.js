const Environments = {
  ProdSpaceId: ["staging", "preview", "prod"],
  DevSpaceId: ["dev", "qa"]
}
const Spaces = {
  ProdSpaceId: "e6ntcn5odprs",
  DevSpaceId: "e6ntcn5odprs",
}

const Config = {

  getSpaceId: (environment) => {
    for (key in Environments) {
      if (Environments[key].includes(environment)) {
        return Spaces[key];
      }
    }
    return null;
  }
};
module.exports = Config;
