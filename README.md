### kotlin/js 拆包脚本
kotlin/js 多 module 打出来的js文件，会将所有的d.ts内容合并到一起，在鸿蒙上(ArkTs)运行会报错，因此需要将归并后的d.ts重新拆成多个独立的文件。
该脚本就是为了解决这个问题。

### 使用配置
在[harmony_app_dependency_graph.json](src/process-dts/harmony_app_dependency_graph.json)中配置kotlin module的依赖图，脚本会根据依赖图去拆.d.ts文件。

操作的文件目录可以在[graph-node.js](src/process-dts/logic/graph-node.js)中去修改这两个变量来指向正确的位置。
```
//根据实际工程情况修改即可
const pathPrefix = "../../"
const namePrefix = "Hm-"
```

### 原理流程
脚本会根据依赖图，深度优先遍历并处理每个module, 拿到每个module的.d.ts文件，然后从父module的.d.ts中删除子module的.d.ts的内容。脚本会将待处理的文件拷贝到build/harmony-js目录下,并在该目录下处理。
但是过程中需要依赖原始未处理的文件，这部分文件在`build/compileSync/js/main/development[production]Executable/kotlin`目录下。


### 使用方式
直接运行main.js的main方法即可，内部留了一行测试代码：
```
//测试代码， 只处理dts, 不包括gradlew调用
handleDTS(parseJsonToGraphTree("./harmony_app_dependency_graph.json"), true);
```
测试运行的时候，先将`build/compileSync/js/main/development[production]Executable/kotlin`目录下的文件拷贝到`build/harmony-js`内，
再执行main.js，可以看到harmony-js目录下的文件内容被处理。
