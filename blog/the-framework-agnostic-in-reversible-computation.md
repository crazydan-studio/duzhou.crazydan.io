---
title: (转) 业务开发自由之路：如何打破框架束缚，实现真正的框架中立性
authors:
  - canonical
tags:
  - 好文推荐
  - 可逆计算
  - 框架中立
---

import Copyright from '@site/src/components/Copyright/TransferBlogByFlytreeleft';

<Copyright
source={{
    url: 'https://zhuanlan.zhihu.com/p/682910525',
    author: { name: 'canonical', email: 'canonical_entropy@163.com' }
  }}
/>

在[如何评价一种框架技术的好坏](https://zhuanlan.zhihu.com/p/645412474)一文中，
我提到一个概念，**框架中立性**（framework agnostic），并指出，
**最理想的框架，应该是在开发业务代码时完全意识不到它存在的框架**。
有些人读后提出疑问：就目前而言，没有任何业务开发完全独立于框架，这个概念有什么意义？
讨论群中有热心同学回复到：

> 软件开发依赖框架是因为要用到框架提供的输入输出，事件回调，依赖注入，外部数据读写，上下文等，
> 大多数都是程序运行依赖的副作用。如果做一个业务的时候，按照一个库去设计，
> 将所有的副作用都显式的声明为接口和上下文对象，有个中间层去衔接框架和设计出来的业务库，
> 那么这个业务库就可以不依赖框架了。

有人试图反驳：那这种情况不还是制定一种内部标准，既然如此，我用 spring 的标准又有什么问题？
关于这个问题的解答有点微妙，需要有一定的精细概念的分辨能力才能够理解，在这里我简单做一些概念辨析。

<!-- more -->

## 最小化信息表达

> framework agnosticism allows create technology solutions that are
> independent of any **predefined** frameworks or platforms.

首先，我们需要认识到框架中立是最终表现出来的一种结果，并不一定是我们明确追求的目标。
我们应该追求的第一个目标是**如何实现信息的最小化表达**。

**最小化的表达一定是业务特定的**。本质上，业务逻辑是技术中立的，
它必然是可以独立于任何框架被表达、被实现，因此如果剥离了所有额外的信息，
剩下的概念就只能是业务领域内部的概念。比如说：

```java
void activateCard(HttpServletRequest req) {
  String cardNo = req.getParameter("cardNo");
  ...
}

void activateCard(CardActivateRequest req) {
  ...
}
```

对比上面两个函数，第一个函数的表达不是最小化的，因为它引入了额外的 Http 上下文信息，
而第二个函数的表达只使用了专门针对当前业务定制的 `CardActivateRequest` 对象信息。

如何判断我们实现了最小化表达？第一个检测手段就是单元测试。
执行单元测试所作的准备工作都是直接和当前的业务逻辑相关吗？
比如说，如果业务函数不依赖数据库，那么在不启动数据库的情况下可以测试吗？
在不启动 Web 环境的情况下可以测试吗？难道同样的业务逻辑不能在批处理环境中执行吗，
它为什么要依赖 Web 服务器的存在？

在 Nop 平台中，不仅仅业务实现代码的信息表达是最小化的，底层引擎的表达也是最小化的。
例如 `NopGraphQL` 引擎可以脱离 Http 环境进行测试：

```java
GraphQLRequestBean request = ...;
IGraphQLExecutionContext ctx = graphQLEngine.newGraphQLContext(request);
GraphQLResponsebean response = graphQLEngine.executeGraphQL(ctx);
```

一般在测试 Web 框架层面的功能时，我们要么通过 mock 机制提供虚拟的 Web 运行时环境，
要么启动真实的 Web 服务器，占用服务器端口，启动线程池。
但是 `NopGraphQL` 引擎的信息表达是最小化的，它只是接收 POJO 的请求对象，
派发服务请求逻辑并执行结果数据剪裁，返回 POJO 的响应对象，不需要 Web 服务器的知识，
也不需要内置线程池。正是因为这种最小化的表达，整个 `NopGraphQL`
引擎以及通过这个引擎实现的业务代码都可以脱离 Web 运行时环境运行，
可以直接发布为批处理服务、消息队列处理服务、GRpc 服务等。

## 最小化表达必然是描述式的

最小化当前的信息表达，从反方向理解，就是最大化未来可能出现的信息表达。
如果表达是最小化的，那么我们必然就只会描述我们希望达到的目标，
而省略为了达到目标所需的各类执行细节信息，例如使用什么方式达到、按照什么样的执行顺序达到等。
也就是说，我们会尽可能的延迟做出具体的技术决策，尽可能的延迟表达与具体执行相关的信息。
因此，最小化的信息表达必然是描述式的，执行细节信息应该在运行时再指定，
或者由底层运行时引擎根据某种最优化策略自动推导得到。

首先看一下传统的 MVC 框架：

```java
public class MyController implements Controller {

  @Override
  public ModelAndView findAccount(
    HttpServletRequest request,
    HttpServletResponse response
  ) {
    ...
  }
}
```

使用传统的框架编写业务代码时，我们总是围绕着框架的概念进行编程，
大量信息处理都要触及到 `Controller/HttpServletRequest/ModelAndView`
这种框架内置的结构，而且业务代码与框架代码的纠缠是由代码具体的执行路径来确定的。

现在的 Web 框架普遍通过描述式的元数据来向程序注入框架相关的信息，
框架与业务代码不再直接接触。例如：

```java
@Path("/account/:id")
@GET
MyResponse findAccount(@PathParam("id") String id) {
  ...
}
```

但是如果和 Nop 平台的实现比较，上面的表达仍然不是最小化的。

```java
@BizQuery
MyResponse findAccount(@Name("id")String id) {
  ...
}
```

`@Path` 和 `@GET` 这种注解看起来是一种描述式信息，
但是它们仍然引入了与当前业务不相关的信息假定：
URL 访问路径以及 HTTP 方法等信息仅对 Web 框架有用，
如果我们现在改用 GRpc 服务协议，这些信息就是多余的。
**在 Nop 平台的表达中，所有的注解所指向的都是业务领域内的信息，而不是指向领域外的技术框架**。
`@BizQuery` 是对 `findAccount` 方法内部的领域信息的一种补充标记，而不是专门为外部的某个技术框架服务的
（**注意，这一点很微妙，我再强调一下，`@BizQuery` 这一信息指向的是业务领域而不是外部技术框架**）。
同样的，`@Name("id")` 这个注解也只是为函数参数补充名称信息，
它与任何外部的使用方式都无关，它对于任何的技术框架来说都是一种可用的信息。

正是因为这种最小化的表达，所有的信息都与领域逻辑有关，
所以当我们把服务函数发布为 GRpc 服务时，`@BizQuery` 和 `@Name`
属性所表达的信息都可以直接被使用。我们无需做任何额外的配置，
就可以直接将同一个服务函数暴露为多种协议接口。

## 描述式信息之间的形式变换

在说到框架中立这个概念的时候，我也会经常混用**框架无关**这个说法。
有些人听了之后可能会有疑问：框架无关最后不还是自己写一套标准协议，
不耦合到别人的框架上最后不还是耦合到自己自制的框架上？
没有框架怎么可能实现各个独立实体之间的协调呢？

要真正理解这里的微妙之处，需要有一点近现代数学的知识（大概是 19 世纪末的内容）。
在现代数学中，我们说到 `A` 就是 `B` 的时候，它并不意味着 `A` 和 `B` 是同一的，
并不意味着 `A` 和 `B` 是完完全全、一模一样的东西，而是说 `A` 和 `B`
之间可以通过某种等价运算进行相互转化：

<!-- LaTeX 符号表: https://artofproblemsolving.com/wiki/index.php/LaTeX:Symbols -->
$$
A \cong B \Longrightarrow A = f(B),
B = g(A) \Rightarrow f\circ g = I_A,
g\circ f = I_B
$$

同样的，当我们说到业务代码与框架无关的时候，并不意味着业务代码与任何框架都没有关系，
而是说它**与特定的某一个框架的运行时无关**。我们使用框架 `A` 表达的代码，
在编译期可以通过某种形式变换自动的变换为适配另外一个框架 `B`，
这个框架 `B` 甚至可以目前还没有被编写出来！

举例来说，在 Feign RPC 框架中我们即可以使用 JAX-RS
注解来标注服务函数，也可以使用 SpringMVC 注解来标注。

```java
@FeignClient(name = "springMvcExampleClient", url = "http://example.com")
public interface SpringMvcExampleClient {

  @GetMapping("/hello")
  String hello(@RequestParam("message") String message);
}

@FeignClient(name = "jaxRsExampleClient", url = "http://example.com")
public interface JaxRsExampleClient {

  @GET
  @Path("/hello")
  @Produces(MediaType.TEXT_PLAIN)
  String hello(@QueryParam("message") String message);
}
```

原则上在内部实现上，Feign 底层的实现只要针对一种注解形式编写，
对于另一种注解形式只需要进行一个形式变换，转换到已经支持的格式上即可。
我们并不需要针对每种注解形式都分别编写一种不同的运行时框架支持。

需要注意的是，这种转换可以在编译期完成，而且完全是一种纯形式层面的变换，
不涉及到任何运行时状态的管理问题，因此它**本质上是一种双向可逆的数学变换**。

总结一下，如果我们在实现框架的时候，总是**要求最小化的信息表达**，
并且**最终达到了某种全局最小值**，那么这时**所表达的信息内容必然会具有某种唯一性**。
因为如果不唯一，就可以继续比较哪种表达信息量更小，从而选择信息量更小的那个解。
如果多个不同的框架都实现了最小化信息表达，
这种**最小化信息表达的唯一性就保证了不同的框架表达形式之间必然是可以进行等价变换的**（可逆变换）。
如果我们在框架设计中，总是允许插入一个形式变换适配层，再结合最小化信息表达原则，
那么很自然的就可以实现框架中立的效果。

这里还需要解释一下，最小化信息表达仅仅是约束了业务层的表达结构，
并不意味着不同的框架具有相同的能力。实际上不同的框架可以采用不同的实现技术和实现架构，
在性能、适用场景等方面都存在这本质性区别，
但是业务层的代码却可以不做修改或仅需要执行一遍编译期预处理，就可以迁移到不同的运行时框架上执行。
因为最小化的业务表达是描述式的，它具体执行的效果由运行时框架最终决定，
甚至可能出现同样的业务表达，在不同的运行时框架上执行时实际语义不同的情况。
举个例子，我们可以表达一个数据处理函数，它可以在一个嵌入式的本地运行时框架执行，
此时它具有一个简单的数据处理的语义，但是我们也可以把它放到一个分布式的大数据运行时框架执行，
此时大数据框架会自动引入大量与分布式相关的执行语义和状态细节。

必须要承认的是，目前的主流框架并没有清晰的意识到以上构造原理，
因此无法通过自动化的形式变换来实现框架中立。例如，虽然 Feign RPC 同时支持 JAX-RS
注解和 SpringMVC 注解形式，在服务端的 SpringMVC 实现中，却无法通过简单的方式引入
JAX-RS 注解，一般情况下我们都被锁定在 SpringMVC 的原生注解形式中。

只有 Nop 平台的实现真正遵循了最小化信息表达原则，
它的实现也演示了如何实现信息在不同形式之间的自由转换和流动，
这些设计都远远超越了业内主流框架的能力。

有人可能会提出一个疑问，最小化信息表达只是表达了部分信息，
那些与框架相关的信息比如优化配置在哪里表达呢？在 Nop 平台中，
信息结构具有良好的规划，相当于是建立了无所不在的领域坐标系，
并且通过各种 Delta 差量机制可以在指定坐标处插入任意信息，
所以我们可以将框架相关的配置独立存放，然后再通过坐标系定位合并到总体信息结构中。

## 具体如何实现框架中立？

前几节的内容主要是理论分析，具体如何实现框架中立，还是存在一些具体的经验和方法。
讨论群中有位同学提出了一个很好的见解：

> 具体来说，我们需要以框架中立的方式处理以下内容：
>
> - 数据(数据输入输出与存储)
> - 控制(命令、事件等)
> - 副作用
> - 上下文

### 输入和输出

在数学层面上理解，最小化信息表达会导致与外界相关的信息都集中在边界层中，
写成公式就是：

```java
output = biz_process(input)
```

在理想情况下，`biz_process` 可以应用到所有可能的应用场景中，
也就是说我们只需要检查一下局部条件，发现可以满足 `input` 和 `output` 结构要求，
那么就可以在处理过程中插入 `biz_process` 这个步骤。`biz_process`
与外部世界的所有依赖和约束关系都体现为边界元素（`input/output`）的适配条件。

`input` 和 `output` 要做到框架中立，等价于要求它们不包含特定的运行时依赖，
最简单的方式是实现为 POJO 对象，从而在所有的框架中都是按照同样的方式去操纵。
但是也不一定必须实现为 POJO。举例来说，大数据领域我们可以选择 `input` 和 `output`
采用 Arrow 数据格式，这是一种二进制的列存格式。Arrow 标准中定义了一组抽象操作，
在不同的程序语言中由对应的 SDK 提供这种抽象操作的具体实现。

Nop 平台提供了 `XML/JSON/Java/Excel` 等多种信息表示形式之间的双向转换机制，
并且通过 NopORM 统一了存储层的数据表示形式，
这使得我们在编写业务代码的时候基本只需要针对纯粹的业务对象进行编写。

> NopORM 的实体定义本质上也是框架中立的，也就是说如果 JPA 设计良好，
> 我们也可以直接集成 JPA 作为底层运行时来存取 Nop 平台中的 `OrmEntity` 对象。

### 事件处理

事件处理传统的做法是向组件传入事件响应函数，然后在组件内部回调这个函数。
这个过程与异步回调函数的处理过程本质上是一致的。目前在异步处理领域，
大部分现代框架都放弃了回调函数的做法，转向了 `Promise` 抽象和 `async/await` 语法。
类似的，对于事件处理，我们同样可以将事件触发抽象为一个 `Stream` 流对象，
然后在 `output` 中返回这个流对象：

<!-- LaTeX 符号表: https://artofproblemsolving.com/wiki/index.php/LaTeX:Symbols -->
$$
\begin{align}
Callback\langle E \rangle &\Longrightarrow Promise\langle E \rangle
\\
EventListener\langle E \rangle &\Longrightarrow Stream\langle E \rangle
\end{align}
$$

所以，事件处理本质上可以化归为 `Output` 的一种特殊情况来处理。
在系统中有必要引入标准化的流处理接口，例如 Java 中的 Flow 接口。

### 副作用

仅仅将业务逻辑与外部世界的相互纠缠理解为输入和输出，很多时候都过分简单了一些。
更精细的描述可以表达为如下公式：

```java
[output, side_effect] = biz_process(input, context)
```

副作用的问题是它一般具有执行语义，很容易引入对特定的运行时环境的依赖。
例如，在一般的 Web 框架中实现文件下载，我们会写：

```java
void download(HttpServletResponse response) {
  OutputStream out = response.getOutputStream();
  InputStream in = ...;

  IoHelper.copy(in, out);
  out.flush();
}
```

因为我们需要使用运行时框架所提供的 `response` 对象，
导致我们的业务代码和 `Servlet` 接口绑定，
这样的话我们编写的文件下载的业务代码就无法自动的兼容 Spring 和
Quarkus 这两种运行时框架了。

> Quarkus 一般使用 RESTEasy 作为 Web 层，它不支持 Servlet 接口。

为了解决这个问题，一个标准化的解决方案来自于函数式编程：
我们可以不实际执行副作用，而是把副作用所对应的信息封装为一个描述式对象作为返回值返回。
例如，在 Nop 平台中，文件下载采用如下方式实现：

```java
@BizQuery
public WebContentBean download(
    @Name("fileId") String fileId,
    @Name("contentType") String contentType,
    IServiceContext ctx
) {
  IFileRecord record = loadFileRecord(fileId, ctx);
  if (StringHelper.isEmpty(contentType)) {
    contentType = MediaType.APPLICATION_OCTET_STREAM;
  }

  return new WebContentBean(
                contentType,
                record.getResource(),
                record.getFileName()
          );
}
```

Nop 平台的做法是并不实际执行下载动作，而是把待下载的文件包装为 `WebContentBean` 返回，
然后在框架层统一识别 `WebContentBean`，使用不同运行时框架所提供的下载机制去执行具体的下载过程。
**在业务层面上，我们只需要表达“需要下载某个文件”这一意图即可，没有必要真的由自己执行下载动作**。

应用代码中另外一种常见的副作用是数据保存操作，每次执行 `dao.save` 都会产生数据库交互，
很多情况下这会破坏业务函数的可组合性，并有可能导致潜在的数据更新冲突。
比如说，在一个服务处理函数的执行过程中，我们在三个地方修改了某个实体上的属性，
原则上只要保存一次就可以，但是如果调用了三次 dao，就会导致三次数据库访问。

Nop 平台的解决方式是使用 NopORM 引擎引入 `OrmSession` 的概念。
在业务逻辑代码中可以完全删除所有的 `dao.save/dao.update` 这样的保存函数，
在数据库事务提交前，由 ORM 框架检查是否有实体被修改，如果有，则自动计算差量更新信息，
生成 `update/insert/delete` 语句来实现内存中状态与数据库持久化状态的同步。
本质上，这是利用 UnitOfWork 模式使用 Session 来缓存副作用的实际执行。

### 上下文

传统框架中的上下文对象是最容易引入运行时框架依赖的地方。
一般的框架作者很难避免诱惑在上下文对象上增加一些通用方法，这直接导致框架锁定。
例如 `HttpServletRequest` 对象提供了具有执行语义的 `Dispatcher` 对象：

```java
// 获取 RequestDispatcher 对象，指定要转发的资源路径
RequestDispatcher dispatcher = request.getRequestDispatcher("/targetServlet");

// 调用forward方法进行转发
dispatcher.forward(request, response);
```

这直接导致 `HttpServletRequest` 对象与 Servlet 容器环境绑定，
我们很难在应用代码中自己创建一个 `Request` 对象来使用。
我们编写的业务代码中如果无意中引入了 `HttpServletRequest` 依赖，
那么它就很难在其他框架的上下文环境中运行。

Nop 平台的做法是**弱化上下文对象的行为语义，将它退化为一个通用的数据容器**。
具体来说，Nop 平台统一使用 `IServiceContext`
来作为服务上下文对象（不同的引擎都采用这一个上下文接口），
但是它没有特殊的执行语义，本质上就是一个可以随时创建和销毁的 Map 容器。

此外，Nop 平台通过 NopIoC 容器提供统一的依赖注入机制。
依赖注入可以看作是对上下文环境对象的一种按需使用，从而避免一次性获取到上下文的所有可执行信息，
产生不必要的依赖。NopIoC 使用 `@Inject` 等 Java 标准注解，借此实现框架无关的依赖注入功能。

必须要说明的是，现有的框架设计大部分都不满足框架中立的设计要求。
以 Spring 为例，虽然它最早的时候号称是描述式编程，面向 POJO，但是发展到今天，
它已经引入了太多特殊的接口依赖和隐式的执行顺序依赖。特别令人抓狂的是，
针对 Spring 编写的依赖注入配置信息，不仅仅对迁移到其他 IoC 容器无用，
甚至很有可能还会阻塞我们迁移的道路。比如说，我们在 `private` 变量上标记了 `@Autowired` 注解，
通过它来实现依赖注入。这导致如果我们不使用 Spring 容器，就压根没有办法对这个 bean 进行配置了。

NopIoC 的设计回归到了声明式依赖注入容器的初心，它在概念层面确保，
使用 NopIoC 容器所管理的 bean 永远可以都可以交由其他 IoC 容器来进行配置。

## 答疑

### 按照文中的说法，是否意味着业务代码中不应该直接表达 SQL 逻辑？

答：是的。在 Nop 平台中 NorORM 引擎定义了 `EQL` 语法，通过 `Dialect`
抽象屏蔽多个数据库之间的差异，并引入面向对象的属性访问语法。
除此之外，`IEntityDao` 接口层使用 `QueryBean` 等结构表达复杂过滤条件，
底层可以运行在 Redis/ElasticSearch/TDengine/MongoDB 等非关系型数据存储上。
我们总是尽量在更高的抽象层次上进行操作，在更高的抽象层面上更容易执行自动化的数学推理。
比如前台框架会自动将请求数据包装为 `QueryBean` 格式，在规则引擎中可以直接使用
`QueryBean` 格式，这些都无需编程实现。如果直接使用 SQL 语言，
大量的结构转换和实现层适配就要自己去完成，而且会阻塞自动推理路径，破坏系统内在的概念一致性。

### 文中的做法是不是和我在某 DDD 视频里看到过的做法类似？

作者所提出的解决方案是在可逆计算理论指导下完成的，它要发挥最大作用需要重构底层的所有软件结构，
所以 Nop 平台没有使用现有的开源框架，而是按照可逆计算理论指导从零开始重新实现。
目前能够见到的其他实践方案原则上是缺少数学理论指导的，
只是由各个架构师根据各人工作经验所作的一些朴素理解，难以保证大范围、整体性的概念一致性，
因此无法实现系统化的自动推理。

### 这种最小化表达带来的负担是不是太大了？比如我用 Kafka，懒得做一层通用 MQ 的抽象了，就是直接调用 Kafka API？

这是一种误解。最小化信息表达并不意味着你需要提供一个通用的 MQ 抽象，通过它来屏蔽
Kafka/RocketMQ/Pulsar 等不同消息队列之间的区别。因为要搞清楚这些队列之间的差异性，
提出合适的抽象方法来封装通用功能，同时还保留消息队列自身的独特特性，这种设计是很难的。
**最小化信息表达的指向是业务领域自身，而不是外部技术框架**。也就是说我们可能搞不清楚多个
MQ 的所有功能，无法提出一种合适的封装接口，但是我们了解自己的业务需求啊，
而且我们的业务所使用到的消息队列的功能肯定只是 MQ 全部功能中的非常小的一个子集。
因此最小化信息表达实际要求的是定义一个接口，它仅包含我们在当前业务中需要使用到的功能，
而且这种封装并不需要是通用性的，完全可以是只针对我们自己的业务来定义的。
最基本的，它意味着你把所有 Kafka 直接相关的内容写到少数几个类中，
把 Kafka 相关的知识屏蔽在面向业务的接口之下。在实际编程实践中，
我的发现是凡是到处直接使用 Kafka 的 API，不在自己的业务代码中做适量隔离的项目，
最后维护成本都更高，一般会缺失合适的配置，甚至出现对 Kafka 的误用，导致业务逻辑出现问题。

在 Nop 平台中，我们的做法是提供了 `IMessageService` 这样一种通用的封装接口，
它为 Nop 平台提供了数学意义上的单向信息发送和接收能力。但这就是另外一个故事了。

如果要提供最小化信息表达，我们一定不是去封装消息队列本身，
因为每个消息队列都是一系列独特技术决策的组合，它们之间一般并不存在整体性的、公共的统一接口。
可行的做法是从业务出发或者从第一性的数学原理出发，提出一系列最小化的功能性要求，
然后针对每一个窄小的功能接口，再为每个消息队列提供具体实现。

## 附录

基于可逆计算理论设计的低代码平台 NopPlatform 已开源：

- gitee: [canonical-entropy/nop-entropy](https://gitee.com/canonical-entropy/nop-entropy)
- github: [entropy-cloud/nop-entropy](https://github.com/entropy-cloud/nop-entropy)
- 开发示例：[docs/tutorial/tutorial.md](https://gitee.com/canonical-entropy/nop-entropy/blob/master/docs/tutorial/tutorial.md)
- [可逆计算原理和 Nop 平台介绍及答疑\_哔哩哔哩\_bilibili](https://www.bilibili.com/video/BV14u411T715)
