// 主流程
const {runGradleTask} = require("./logic/gradle.js");
const {parseJsonToGraphTree} = require("./logic/graph-node.js");
const {traverseAndBuild, traverAndCopy, handleDTS} = require("./logic/utils");

//{
//   "harmonyApp": {
//     "feature": {
//       "shared": {}
//     }
//   },
//   "_comment": "这个文件记录着harmony app的module依赖图,用于编译期处理d.ts文件使用"
// }

/**
 * @param {boolean} isDebug
 * @param {string} graphJsonPath 依赖图描述文件的路径
 * @param {boolean} isCI 是否是CI
 */
async function main(isDebug, graphJsonPath, isCI) {
    const rootNode = parseJsonToGraphTree(graphJsonPath);
    const rootModuleName = rootNode.name


    console.log(`harmony_app_dependency_graph: ${JSON.stringify(rootNode)}`)


    const isGradlew = !isCI;
    if (!isCI) {
        // ./gradlew clean
        await runGradleTask(isGradlew, "clean", [])
    }

    //深度优先递归遍历每个module并且调用 ./gradlew :{moduleName}:compileXXXExecutableKotlinJs
    await traverseAndBuild(rootNode, isDebug, isGradlew, new Set())

    //将子module产生的d.mts 都拷贝到顶层module
    traverAndCopy(rootNode, rootNode.getDirPathMTS(isDebug))

    // 运行顶层module的 ./gradlew :{rootModuleName}:compileXXXExecutableHarmonyKotlinJs, 会将d.mts 改名为d.ts
    await runGradleTask(isGradlew, `:${rootModuleName}:compile${isDebug ? "Development" : "Production"}ExecutableHarmonyKotlinJs`, ["-Pksp.incremental=false"])

    // 处理.d.ts文件
    handleDTS(rootNode, isDebug);
}

// main(false, "./harmony_app_dependency_graph.json", false)


//测试代码， 只处理dts, 不包括gradlew调用
handleDTS(parseJsonToGraphTree("./harmony_app_dependency_graph.json"), true);



