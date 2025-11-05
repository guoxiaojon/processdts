// 主流程
const {runGradleTask} = require("./gradle.js");
const {GraphNode} = require("./graph-node.js");
const fs = require("fs");
const path = require("path");
const {processDTS} = require("./process-dts");
const {Statement} = require("ts-morph");


/**
 * 深度遍历 GraphNode，并对每个节点运行 Gradle 编译任务
 * @param {GraphNode} node
 * @param {boolean} isDebug
 * @param {boolean} isGradlew
 * @param {Set<string>} builtRecord 已经编译过的module
 */
async function traverseAndBuild(node, isDebug, isGradlew, builtRecord) {
    if (!node) return;

    // 递归遍历子节点
    if (node.children && node.children.length > 0) {
        for (const child of node.children) {
            await traverseAndBuild(child, isDebug, isGradlew, builtRecord);
        }
    }

    // 构建 moduleName，例如 node.name
    const moduleName = node.name;

    // 跳过空名字或不需要编译的节点
    if (moduleName) {
        console.log(`builtRecord 内容: ${JSON.stringify(builtRecord)}`);
        if (builtRecord.has(moduleName)) {
            console.log(`跳过模块: ${moduleName}（已经编译过）`);
            return
        }
        builtRecord.add(moduleName)
        console.log(`开始编译模块: ${moduleName}`);
        try {
            const taskName = `:${moduleName}:compile${isDebug ? "Development" : "Production"}ExecutableKotlinJs`
            console.log(`模块 ${moduleName} 执行 ./gradlew ${taskName}`);
            await runGradleTask(isGradlew, taskName, ["-Pksp.incremental=false"]);
            console.log(`模块 ${moduleName} 编译完成 ✅`);
        } catch (err) {
            console.error(`模块 ${moduleName} 编译失败 ❌`, err);
            throw err;
        }
    }
}

/**
 *
 * @param {GraphNode} node
 * @param {string} targetDir
 */
function traverAndCopy(node, targetDir) {
    if (node.children && node.children.length > 0) {
        for (const child of node.children) {
            traverAndCopy(child, targetDir);
        }
    }

    const currPath = node.getPathMTS();
    const targetPath = targetDir + path.basename(currPath);
    console.log(`拷贝 ${currPath} -> ${targetPath}`);

    fs.copyFileSync(currPath, targetPath, fs.constants.COPYFILE_FICLONE);
}

/**
 *
 * @param {GraphNode} node
 * @param {boolean} isDebug
 */
function handleDTS(node, isDebug) {
    /**
     *
     * @type {Map<string, Statement>}
     */
    const map = new Map()
    processDTSDFS(node, isDebug, map)
}

/**
 *
 * @param {GraphNode} node
 * @param {boolean} isDebug
 * @param {Map<string, Statement>} exportRecords
 */
function processDTSDFS(node, isDebug, exportRecords) {
    // 处理子节点
    for (const child of node.children) {
        processDTSDFS(child, isDebug, exportRecords);
    }

    // 处理自己
    for (const child of node.children) {
        const currPath = node.getPathDTS()
        const childPath = child.getOriginPathDTS(isDebug)
        console.log(`处理 ${currPath} <--- ${childPath}`);
        processDTS(currPath, childPath, exportRecords)
    }
}

module.exports = {traverAndCopy, traverseAndBuild, handleDTS};
