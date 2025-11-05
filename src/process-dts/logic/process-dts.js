const {Project, SyntaxKind, SourceFile, Statement, Node} = require("ts-morph");
const path = require("path");
const fs = require("fs");


// 生成节点完整路径名，比如 "namespaceA.namespaceB.TypeName"
function getFullNamePath(node) {
    const names = [];
    let cur = node;

    while (cur) {
        try {
            let name = ''
            if (cur.getKind() === SyntaxKind.VariableStatement) {
                // VariableStatement 里面可能声明多个变量，这里取第一个名字为代表
                const declarations = cur.asKindOrThrow(SyntaxKind.VariableStatement).getDeclarationList().getDeclarations();

                if (declarations.length > 0) {
                    name = declarations[0].getName();
                }
            } else {
                name = cur.getName?.();

            }
            if (name) {
                names.unshift(name);
            }
            cur = cur.getParent?.();
        } catch {
            break; // 节点已被删除，退出
        }
    }

    return names.join(".");
}

/**
 *  递归收集声明（map key 用完整路径名）
 * @param container
 * @param map {Map<string, Statement>}  key 完整路径名，value : AST结构Statement
 */
function collectDeclarations(container, map) {
    const stmts = [...container.getStatements()];
    for (const stmt of stmts) {
        if (stmt.getKind() === SyntaxKind.ModuleDeclaration) {
            const block = stmt.asKindOrThrow(SyntaxKind.ModuleDeclaration).getBody();
            if (block) collectDeclarations(block, map);
            continue;
        }

        const fullName = getFullNamePath(stmt);
        // console.log('collectDeclarations fullName : ', fullName);
        if (fullName && fullName !== 'Nullable' && !map.has(fullName)) {
            map.set(fullName, stmt);
        }
    }
}


/**
 * 第一步：递归收集 container 中的，已经被 moduleChildDeclares 包含的的节点
 * @param container
 * @param {(Statement & Node)[]} toRemove 其实就是Statement(extends Node ),JsDoc 把Node类型擦除了
 * @param moduleChildDeclares
 */
function removeDuplicateDeclarationsImpl(container, toRemove, moduleChildDeclares) {
    const stmts = [...container.getStatements()];
    for (const stmt of stmts) {
        if (stmt.getKind() === SyntaxKind.ModuleDeclaration) {
            const block = stmt.asKindOrThrow(SyntaxKind.ModuleDeclaration).getBody();
            if (block) {
                removeDuplicateDeclarationsImpl(block, toRemove, moduleChildDeclares);
            }
        } else {
            const fullName = getFullNamePath(stmt);
            // console.log('removeDuplicateDeclarations ' + 'fullName : ' + fullName);
            if (fullName && moduleChildDeclares.has(fullName)) {
                // stmt.remove();
                toRemove.push(stmt);
            }
        }
    }
}

// 用字符串的方式删除，比直接删除树的节点快300倍
function removeStatementsByString(container, toRemove) {
    // 获取原始文本
    let text = container.getFullText();

    // 先把要删除的语句按位置排序（从后往前删，避免索引错位）
    const ranges = toRemove
        .map(stmt => ({start: stmt.getFullStart(), end: stmt.getEnd()}))
        .sort((a, b) => b.start - a.start);

    for (const r of ranges) {
        text = text.slice(0, r.start) + text.slice(r.end);
    }

    // 用修改后的文本重新设置 sourceFile
    container.replaceWithText(text);
}

/**
 * 根据statement 得到export时的类型
 * @param stmt {Statement}
 */
function getExportSymbolFromStmt(stmt) {
    // 1️⃣ 必须是 export
    if (!Node.isExportable(stmt) || !stmt.isExported()) {
        return undefined;
    }

    // 2️⃣ 直接从 statement 拿 symbol（这是最关键的一步）
    const symbol = stmt.getSymbol();
    if (symbol) {
        return symbol;
    }

    // 3️⃣ 极端兜底：从 declaration name 拿（很少会走到）
    if (
        Node.isClassDeclaration(stmt) ||
        Node.isInterfaceDeclaration(stmt) ||
        Node.isEnumDeclaration(stmt) ||
        Node.isFunctionDeclaration(stmt) ||
        Node.isTypeAliasDeclaration(stmt)
    ) {
        const nameNode = stmt.getNameNode();
        if (nameNode) {
            return nameNode.getSymbol();
        }
    }

    return undefined;

}

/**
 *
 * @param container {SourceFile}
 * @param moduleChildDeclares {Map<string, Statement>}
 * @return {{symbolName: string, fileName: string}[]}
 */
function removeDuplicateDeclarations(container, moduleChildDeclares) {
    /**
     * @type {(Statement & Node)[]}
     */
    const toRemove = []
    removeDuplicateDeclarationsImpl(container, toRemove, moduleChildDeclares);

    /**
     *
     * @type {{symbolName: string, fileName: string}[]}
     */
    const removedInfo = toRemove
        .filter(it => Boolean(getExportSymbolFromStmt(it)))
        .map(stmt => {
            const symbol = getExportSymbolFromStmt(stmt);
            const name = symbol.getName();
            const fullName = getFullNamePath(stmt);

            const childDeclareStmt = moduleChildDeclares.get(fullName)

            return {
                symbolName: name,
                fileName: childDeclareStmt.getSourceFile().getBaseNameWithoutExtension()
            }
        })
    removeStatementsByString(container, toRemove);
    return removedInfo;
}


// 第二步：删除空的 namespace
function removeEmptyNamespaceImpl(container, toRemove) {
    const stmts = [...container.getStatements()];
    for (const stmt of stmts) {
        if (stmt.getKind() === SyntaxKind.ModuleDeclaration || stmt.getKind() === SyntaxKind.ModuleBlock) {
            if (stmt.getStatements().length === 0) {
                // stmt.remove();
                toRemove.push(stmt);
            } else {
                removeEmptyNamespaceImpl(stmt, toRemove)
            }
        }
    }
}

function removeEmptyNamespace(container) {
    while (true) {
        let toRemove = [];
        removeEmptyNamespaceImpl(container, toRemove);
        if (toRemove.length === 0) {
            break
        }
        removeStatementsByString(container, toRemove);
    }
}

/**
 * @typedef {Object} DeclareInfo
 * @property {number} id
 * @property {string} name
 */

/**
 *
 * @param parentFilePath {string}
 * @param childFilePath {string}
 * @param moduleChildDeclares {Map<string, Statement>}
 */
function processDTS(parentFilePath, childFilePath, moduleChildDeclares) {
    const moduleParentDtsPath = parentFilePath// path.resolve(__dirname, );
    const moduleChildDtsPath = childFilePath// path.resolve(__dirname, childFilePath);

    const childModuleName = childFilePath.split('/').pop().replace('.d.ts', '');
    const parentModuleName = parentFilePath.split('/').pop().replace('.d.ts', '');

    const project = new Project({
        compilerOptions: {
            allowJs: false,
            declaration: true,
        }
    });

    const moduleParentSource = project.addSourceFileAtPath(moduleParentDtsPath);
    const moduleChildSource = project.addSourceFileAtPath(moduleChildDtsPath);

    const t1 = Date.now();
    // 收集child 文件内的export
    collectDeclarations(moduleChildSource, moduleChildDeclares);
    const t2 = Date.now();

    // 从parent 内删除 child 文件内的export

    const removed = removeDuplicateDeclarations(moduleParentSource, moduleChildDeclares);
    const t3 = Date.now();

    removeEmptyNamespace(moduleParentSource);
    const t4 = Date.now();

    /**
     * 收集 被删除的statement所对应的对外导出symbol
     * @type {{symbolName: string, fileName: string}[]}
     */
    const moduleChildExports = [];
    const moduleChildExportsNameSet = new Set();
    for (const item of removed) {
        const name = item.symbolName
        const fileName = item.fileName;
        if (name !== undefined &&
            name !== 'Nullable' &&
            name !== '_objects_' &&
            !name.includes('__NonExistent')) {

            if (!moduleChildExportsNameSet.has(name)) {
                moduleChildExports.push({
                    symbolName: name,
                    fileName: fileName
                });
                moduleChildExportsNameSet.add(name);
            }
        }
    }

    const t5 = Date.now();

    // 插入 import ,将 child module 中export 的内容import 进来, 并同时export 出去
    if (moduleChildExports.length > 0) {
        const importLine = moduleChildExports.map(it => `import { ${it.symbolName} } from "./${it.fileName}";`).join('\n') + '\n';
        const firstStatement = moduleParentSource.getStatements().find(
            stmt => !stmt.getText().trim().startsWith("//")
        );
        if (firstStatement) {
            moduleParentSource.insertText(firstStatement.getFullStart(), importLine);
        } else {
            moduleParentSource.insertText(0, importLine);
        }

        moduleParentSource.organizeImports() // 格式化import
        fs.writeFileSync(moduleParentDtsPath, moduleParentSource.getFullText());
        const t6 = Date.now();

        console.log(`✅ ${parentModuleName}.d.ts updated: duplicates removed and empty namespaces cleaned. cost: collectDeclarations=${t2 - t1}ms, removeDuplicateDeclarations=${t3 - t2}ms, removeEmptyNamespace=${t4 - t3}ms, collectModuleBExports=${t5 - t4}ms, writeFile=${t6 - t5}ms`);
    } else {
        console.log("ℹ️ No matching duplicates found, file unchanged.");
    }
}

module.exports = { processDTS };