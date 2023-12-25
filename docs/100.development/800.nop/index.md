---
title: NOP 平台
description: 与 NOP 平台相关的使用与集成等方面的知识点
authors:
  - flytreleft
---

import Header from '../../\_header.md';

<Header />

## 本地开发

环境要求：

- JDK 17+
- Maven 3.9.3+

本地构建并发布：

```bash
JAVA_HOME=/usr/lib/jvm/java-17-openjdk/ \
mvn clean install -DskipTests -Dquarkus.package.type=uber-jar
```

> 以上命令也是为了便于拉取 Maven 依赖包，避免 IDEA 下载依赖出现问题。

在 IDEA 导入项目后，需调整项目配置（File -> Project Structure...）：

![](./img/idea-project-settings.png)

> 确保 IDEA 的 Maven 配置（File -> Settings -> Build, Execution, Deployment -> Maven -> Local repository）
> 指向了与 `mvn` 命令相同的仓库路径。

## 文件职能

- `*.xgen`：按照 NOP 的 VFS 路径生成模板代码
  - 在使用 maven 打包功能时，会自动执行工程的 `precompile` 和 `postcompile` 目录下的 `*.xgen` 代码，
    其中 precompile 在 compile 阶段之前执行，执行环境可以访问所有依赖库，
    但是不能访问当前工程的类目录，而 postcompile 在 compile 阶段之后执行，
    可以访问已编译的类和资源文件
- `*.xrun`：
- `*.xlib`：
- `*.xdef`：DSL 的 Schema 定义
- `*.xbiz`：
- `*.xmeta`：
