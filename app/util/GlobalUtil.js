var all_globals = {}

function setVar(name, val) {
  all_globals[name] = val;
}

function getVar(name, val) {
  return all_globals[name];
}

function getAllVars() {
  return all_globals;
}

module.exports = {
  setVar,
  getVar,
  getAllVars,
}
