---
title: 框架开发
description: 了解基础框架的设计与实现
disable_comments: true
custom_edit_url:
---

import DocCardList from '@theme/DocCardList';

## 核心设计

以 DSL 描述和表达业务结构与业务逻辑，各层仅关注自身业务的完整表达，层与层之间通过
DSL 形式变换实现数据转换，最终，由运行时构建器完成运行时产物的编译和输出：

```plantuml
@startuml
file dsl as "DSL + Delta"

control runtime_web as "Web"
control runtime_android as "Android"
control runtime_other as "..."

control runtime as "运行时构建器"

dsl -right-> runtime

runtime -up-> runtime_web
runtime -right-> runtime_other
runtime -down-> runtime_android

@enduml
```

## 模块结构

<!-- https://plantuml.com/mindmap-diagram -->

```plantuml
@startmindmap
* Framework (framework)

**: Schema (schema)
  : 定义所有的 XDef 元模型（定义层），
    其余项目通过 XDSL 描述业务逻辑并提供实现（实现层）;

**: Starter (starter)
  : 应用服务启动器核心代码;
***: Quarkus Starter (starter-quarkus)
   : 基于 Quarkus 的应用服务启动器：
     - 统一初始化 Quarkus 和 Nop 运行环境；
     - 以依赖包方式引入应用服务后，便可构建可执行的应用包；;

**: [[./gateway Gateway (gateway)]]
  : 应用服务网关;
***: Starter (gateway-starter)
   : 应用服务网关的启动器，
     以外部依赖方式集成 Api 和 Web 资源网关;
***: Api (gateway-api)
   : Api 路由处理;
***: Web (gateway-web)
   : Web 资源路由处理;

**: [[./config Config Center (config)]]
  : 配置中心，
    统一管理、更新所有应用服务的配置数据;

**: [[./auth Auth (auth)]]
  : 认证与鉴权;
***: Core (auth-core)
   : 基础核心的公共代码，
     定义认证与权限控制的抽象模型;
***: Gateway (auth-gateway)
   : 在应用网关处控制所有请求的可访问性;
***: Service (service-auth)
   : 在各个服务内控制 Api 的可访问性，
     以及对数据的可操作性，
     控制相关的数据来源于共享的用户上下文;
***: Action (action-auth)
   : 控制用户对资源的访问和操作，
     并记录操作日志;
***: Data (data-auth)
   : 控制用户对数据的访问和操作;

**: Organization (organization)
  : 人员与组织;
@endmindmap
```

> Maven 工程模块目录添加数字前缀以控制目录顺序，
> 模块目录按重要性排序。

## 章节目录

<DocCardList />
