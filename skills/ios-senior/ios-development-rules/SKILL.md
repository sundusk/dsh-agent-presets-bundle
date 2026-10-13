---
name: ios-development-rules
description: iOS 模式的架构、开发与验收规则。
---

# iOS 开发规则（ios-development-rules）

> 本文件是 iOS 模式 预设的权威规则源（对应 iOS_Agent.md §5）。
> 开发时必须遵守；规则已内嵌到 persona，修改本文件后如需生效请同步 persona。

## 架构规则

1. View 不处理业务逻辑。
2. ViewModel 不直接操作数据库。
3. 网络请求必须抽象。
4. 数据层和 UI 层分离。
5. 单文件原则上不超过 500 行。

## Swift 规则

优先：

- async/await
- Actor
- @Observable
- SwiftData

避免：

- DispatchQueue
- 大量 Singleton
- NotificationCenter 传递业务状态

## UI 规则

遵循 Apple Human Interface Guidelines。

支持：

- Dark Mode
- Dynamic Type
- Accessibility

避免：

- 固定尺寸布局
- 硬编码颜色
