---
name: rea-cli
description: "用本机 rea 命令行驱动 REA 对已发布制品取证：ASAR / Electron / JavaScript 应用、.NET 托管程序集、APK、固件、安装包与网页 bundle 的静态分析、版本对比与 Evidence 提取。当结论必须依赖构建产物而不是可读源码时使用。覆盖命令路由、按 token 分页取用 JSON、Evidence 处理，以及本机引擎与沙箱限制。"
---

# REA CLI 取证流程

本机 REA 以 CLI 形式提供（命令 `rea`，npm 包 rea-agents）。命令与官方 MCP 工具同名同参数，
本预设用 bash 调用 CLI；目标电脑是否另外配置 MCP，需要单独确认。

## 何时使用 / 不使用

使用：结论依赖已发布的制品 —— 原生二进制、ASAR 或解包后的 Electron / JavaScript 应用、
.NET 托管程序集、APK、固件镜像、安装包（ZIP / APK / IPA / MSIX / DMG）、网页 bundle；
需要与"实际发布的行为"对照，而不是与源码对照。

不使用：完整的源码仓库架构分析。那种情况用普通仓库工具，不要启动 REA —— 上游
`reverse-engineer-anything` 技能也是这么规定的。

## 第 0 步：确认能力（只在能力未知或命令失败时）

```bash
rea capabilities --format json    # 提供方能力与副作用
rea doctor --format json          # 就绪状态
```

不要在每个任务开头都跑诊断。直接开始分析，失败时再诊断。

## 第 1 步：按目标类型选入口

| 目标 | 入口 |
|---|---|
| ASAR 或解包后的 JS / Electron 目录 | `rea analyze-javascript-application <path> --format json` |
| 压缩包 / 安装包成员清单 | `rea inspect-artifact <path> --format json` |
| 托管 PE / CLI 程序集 | `rea inspect-managed-artifact <path> --format json` |
| APK 声明与解码清单 | `rea inspect-android-package <path> --format json` |
| 固件签名候选（不提取） | `rea inspect-firmware-regions <path> --format json` |
| 原生二进制概览 / 反编译 | `rea inspect`、`rea analyze`、`rea decompile`、`rea function` —— 需要反编译引擎，本机不可用 |
| 制品全局概览 | `rea analyze <path>` |

除上面这些入口，还有 adb / 浏览器 / 运行时捕获等一大批命令，用 `--help` 查看完整列表；
不要凭印象拼命令名。

## 第 2 步：发现参数，不要臆造

```bash
rea --help                 # 全部命令
rea <command> --help       # 该命令的参数
rea <command> --schema     # 该命令的 JSON Schema
```

## 第 3 步：控制输出体积（最重要的一步）

REA 的输出可能非常大。先估体积，再分页取用，不要把整份 JSON 读进上下文：

```bash
rea <command> <args> --token-count                       # 只打印 token 数
rea <command> <args> --format json --token-limit 4000    # 只取前 4000 token
rea <command> <args> --token-offset 4000 --token-limit 4000
rea <command> <args> --filter-output 'a.b,c[0,3]'        # 按 key path 过滤
```

可用格式：`--format toon|json|yaml|md|jsonl`。`--full-output` 显示完整输出信封，
默认是精简投影。

## 第 4 步：Evidence

- 结果里的 `evidence_id` 是结论的依据，汇报时引用它。
- `rea evidence-export` / `rea evidence-import` / `rea inspect-evidence-bundle` 管理证据包。
- `rea compare <a> <b>` 比较两个规范 Evidence 包；`compare-application-versions` 比较同一
  JavaScript 应用的两个版本。

## 本机限制与已知阻塞

- **先检查原生反编译引擎。** 如果 Hopper / Ghidra / IDA 都未配置，`decompile` / `function` /
  `inspect` 这类需要引擎的命令不可用。JavaScript / Electron 静态分析、.NET 静态分析、
  包与资源检查不需要引擎，可以直接用。不要承诺做不到的深度反编译。
- **文件沙箱。** `rea` 可能需要在会话工作区之外读写（缓存、目标路径）。被拦截时
  报告具体路径并申请授权，不要放弃任务。
- **进程表检查可能被拒。** 沙箱拒绝进程检查时会出现 `spawn EPERM`，命令可能以
  `cleanup_incomplete` 结束 —— 此时部分观察和 Evidence 往往已经产出。如实转述这个
  状态，不要当成完全成功。
- **`rea` 不在 PATH 时**，说明工具缺失，由用户决定是否安装 rea-agents；注意 npx 需要写 npm 缓存，
  更容易被沙箱拦截。

## 汇报纪律

- 每条结论锚定到 evidence ID、文件、符号、地址或字节偏移。
- 明确区分「已证实」「部分观察」「未知」，不要把推测写成结论。
- 工具报 error 或部分结果时如实转述，并说明它对结论的影响。
- 只分析用户提供或明确授权的目标。
