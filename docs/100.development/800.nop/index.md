---
title: NOP 平台相关
description: 与 NOP 平台相关的使用与集成等方面的知识点
authors:
- flytreleft
---

import Header from '../../_header.md';

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
