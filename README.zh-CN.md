# Code Vibe Reading

[English](./README.md)

Code Vibe Reading 是一个本地优先的 VS Code 扩展，用来阅读经过快速 AI 辅助开发后的代码仓库。它把工作区索引、基于证据的问答、持久化笔记和轻量画布放到同一套侧边栏工作流里。

## Preview

Code Vibe Reading 目前围绕四个核心阅读界面组织：

| 界面 | 用途 |
| --- | --- |
| Map | 浏览文件、符号、callers 和 callees |
| Project Overview | 快速查看仓库的启动链路与主执行路径概览 |
| Threads | 针对局部代码提问，并查看带引用的回答 |
| Cards + Canvas | 沉淀长期笔记，并建立可视化连接 |

演示流程：

- [docs/DEMO.md](./docs/DEMO.md)

## 它能做什么

- 构建工作区代码地图，展示文件、符号、导入关系、调用者和被调用者
- 基于索引结果和源码摘录生成 AI 项目概览
- 针对当前选区提问，并返回可点击的源码引用
- 把理解沉淀为卡片，并在画布上建立关系
- 把索引和阅读结果保存到当前工作区，便于持续回看

## 当前范围

- 最佳支持：TypeScript / JavaScript
- 轻量解析支持：Python、Shell、JSON、JSONC
- 模型接入：OpenAI 兼容接口，以及本地开发用的 `mock` 适配器
- 本地存储：当前工作区下的 `.code-vibe/storage/`

## 主要界面

### Map

- 工作区文件与符号树
- 函数 / 方法的 callers 与 callees 展开
- 项目概览入口

### Project Overview

在执行 `Vibe: Refresh Index` 时生成。

当前概览聚焦于：

- 项目目标
- 启动入口
- 启动链路
- 核心模块分工
- 主执行路径
- 证据边界

它的依据主要来自：

- 索引后的文件内容
- `README.md`、`package.json` 等仓库信号
- 从入口文件和核心模块中挑选出的代表性源码摘录

### Threads

- 对当前选区提问
- 解释当前符号
- 查看带源码引用的回答
- 从侧边栏重新打开历史线程

### Cards 与 Canvas

- 将阅读结论保存为卡片
- 把线程回答加入画布
- 用带类型的边连接卡片

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 构建

```bash
pnpm build
```

### 3. 运行扩展

用 VS Code 打开仓库，并启动 Extension Development Host。

### 4. 配置模型

执行：

```text
Vibe: Configure API
```

必填项：

- `baseUrl`
- `apiKey`
- `model`

当前实现默认接入 OpenAI 兼容的聊天补全接口。

### 5. 建索引并开始阅读

执行：

```text
Vibe: Refresh Index
```

这个命令会：

1. 重建工作区索引
2. 重新生成 AI 项目概览

之后你就可以：

- 打开 `Map` 视图
- 打开 `Project Overview`
- 对选区提问
- 跟踪调用路径
- 保存卡片并使用画布

## 命令

| 命令 | 作用 |
| --- | --- |
| `Vibe: Refresh Index` | 重建工作区索引并重新生成项目概览 |
| `Vibe: Configure API` | 配置语言和模型连接 |
| `Vibe: Test Model Connection` | 发送一个最小请求并输出诊断信息 |
| `Vibe: Ask About Selection` | 针对当前选区发起基于证据的提问 |
| `Vibe: Explain Current Symbol` | 解释光标所在符号 |
| `Vibe: Save Selection as Card` | 将当前选区保存为卡片 |
| `Vibe: Add Thread Answer to Canvas` | 把线程回答加入画布 |
| `Vibe: Open Canvas` | 打开可视化画布 |
| `Vibe: Open Project Overview` | 打开项目概览面板 |
| `Vibe: Trace Call Path` | 查看 callers / callees |
| `Delete Thread` | 删除 Threads 视图中的选中线程 |

默认快捷键：

- macOS：`Cmd+Alt+Q`
- Windows / Linux：`Ctrl+Alt+Q`

## 本地数据

项目级本地状态写入：

```text
.code-vibe/storage/
```

常见文件包括：

- `index.json`
- `threads.json`
- `cards.json`
- `canvas.json`
- `project-overview.json`

这些文件属于本地工作区产物，不应进入版本控制。

## 开发命令

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm dev:extension
pnpm dev:webview
```

## 仓库结构

```text
apps/
  extension/   VS Code 扩展主体
  webview/     基于 React 的画布与详情视图
packages/
  analyzer/    工作区索引与符号提取
  retrieval/   证据检索与排序
  model-gateway/ 模型适配与提示词
  persistence/ 本地 JSON 持久化
  shared/      共享协议与类型
  testkit/     测试夹具与辅助工具
```

## 当前限制

- 最丰富的结构分析仍然在 TS/JS 路径上
- 项目概览使用的是“抽样源码摘录”，不是把整个仓库全文直接塞给模型
- 当前更偏本地开发使用，还没有面向 Marketplace 发布
