const fs = require("fs");


//根据实际工程情况修改即可
const pathPrefix = "../../"
const namePrefix = "Hm-"

/**
 * 树节点类
 */
class GraphNode {


    /**
     *
     * @param {string} name 节点名称
     * @param {GraphNode[]} children 子节点数组
     */
    constructor(name, children = []) {
        this.name = name;
        this.children = children;
    }

    /**
     * @param {boolean} isDebug
     */
    getPathMTS(isDebug) {
        return `${this.getDirPathMTS(isDebug)}${namePrefix}${this.name.split(":").pop()}.d.mts`;
    }

    /**
     * @desc 该路径是原始d.mts的路径,即最初编译得到的，未修改过的文件，只是尾缀变成了d.ts
     * @param {boolean} isDebug
     */
    getOriginPathDTS(isDebug) {
        const dir = pathPrefix
            + `harmony-app/build/compileSync/js/main/${isDebug ? "developmentExecutable" : "productionExecutable"}/kotlin/`;

        return `${dir}${namePrefix}${this.name.split(":").pop()}.d.ts`;
    }

    /**
     * @param {boolean} isDebug
     */
    getDirPathMTS(isDebug) {
        return pathPrefix
            + this.name.replace(":", "/")
            + `/build/compileSync/js/main/${isDebug ? "developmentExecutable" : "productionExecutable"}/kotlin/`;
    }

    /**
     * @return {string} path
     */
    getPathDTS() {
        return pathPrefix + `harmony-app/build/harmony-js/${namePrefix}${this.name.split(":").pop()}.d.ts`;
    }
}


/**
 * 递归把 JSON 对象转换成 GraphNode 树
 * @param {string} name 当前节点名字
 * @param {object} obj JSON 对象
 * @returns {GraphNode}
 */
function buildGraphTree(name, obj) {
    if (typeof obj !== "object" || obj === null) return new GraphNode(name);

    const children = [];
    for (const key in obj) {
        if (key.startsWith("_")) continue; // 忽略 下划线开头的属性名，如 _comment
        children.push(buildGraphTree(key, obj[key]));
    }
    return new GraphNode(name, children);
}

/**
 * 从 JSON 文件构建 GraphTree
 * @param filePath
 * @returns {GraphNode}
 */
function parseJsonToGraphTree(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(content);
    // JSON 顶层只有一个根 key
    const rootKey = Object.keys(json).find(k => !k.startsWith("_"));
    return buildGraphTree(rootKey, json[rootKey]);
}


module.exports = {parseJsonToGraphTree, GraphNode};
