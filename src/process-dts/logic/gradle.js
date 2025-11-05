const { spawn } = require("child_process");

/**
 *
 * @param isGradlew {boolean}
 * @param task {string}
 * @param args {string[]}
 * @returns {Promise<unknown>}
 */
function runGradleTask(isGradlew, task, args = []) {
    return new Promise((resolve, reject) => {
        const gradleArgs = [task, ...args];
        const gradle = spawn(isGradlew ? "./gradlew" : "gradle", gradleArgs, { stdio: "inherit" });

        gradle.on("error", (err) => reject(err));
        gradle.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Gradle 执行失败，退出码: ${code}`));
        });
    });
}

module.exports = { runGradleTask };
