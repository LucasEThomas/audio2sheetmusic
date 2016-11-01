System.config({
  baseURL: "/",
  defaultJSExtensions: true,
  transpiler: false,
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },

  depCache: {
    "js/sheetMusic.js": [
      "./noteBuilder.js"
    ],
    "github:0xfe/vexflow@1.2.83.js": [
      "github:0xfe/vexflow@1.2.83/releases/vexflow-debug.js"
    ],
    "github:rubiety/vexflow-json@master.js": [
      "github:rubiety/vexflow-json@master/vexflow-json"
    ],
    "npm:underscore@1.8.3.js": [
      "npm:underscore@1.8.3/underscore.js"
    ],
    "github:rubiety/vexflow-json@master/vexflow-json.js": [
      "0xfe/vexflow",
      "underscore"
    ],
    "js/noteBuilder.js": [
      "vexflow",
      "underscore",
      "./vexJson.js"
    ],
    "js/vexJson.js": [
      "vexflow",
      "underscore"
    ]
  },

  map: {
    "0xfe/vexflow": "github:0xfe/vexflow@1.2.83",
    "rubiety/vexflow-json": "github:rubiety/vexflow-json@master",
    "underscore": "npm:underscore@1.8.3",
    "vexflow": "github:0xfe/vexflow@1.2.83",
    "vexjson": "github:rubiety/vexflow-json@master"
  }
});
