# DeepSeek Harness 五合一 Agent 预设包

面向官方 DeepSeek Harness 的个人声明式插件 Bundle（非官方预设包），包含当前导出的五个自定义预设：

| 预设 | ID | 配套内容 |
| --- | --- | --- |
| Codex 协作 | codex | 标准编码能力、Codex 子代理工具 |
| 鸿蒙模式 | deveco | HarmonyOS / DevEco CLI 开发提示词 |
| iOS 模式 | ios-senior | iOS 开发提示词、原有技能及开发规则 |
| 小说模式 | novel | 原有小说创作规则与无工具写作配置 |
| 逆向工程模式 | rea | 原有 REA 提示词、rea-cli 技能 |

## 通过 GitHub 安装

在官方桌面版的 **插件 → 添加插件** 中输入：

```text
github:sundusk/dsh-agent-presets-bundle
```

安装完成后启用，按提示重启。私有仓库需要目标电脑具备 GitHub 访问权限。
需要固定到某次提交时，填写 `github:sundusk/dsh-agent-presets-bundle#完整提交SHA`。

## 使用本地安装包

1. 安装并打开官方 DeepSeek Harness 桌面版。
2. 把 `sundusk-dsh-agent-presets-bundle-1.0.0.tgz` 复制到目标电脑的固定目录。
3. 打开 **插件 → 添加插件**，填入安装包在目标电脑的**完整绝对路径**，例如 macOS 上 `/Users/你的用户名/Downloads/sundusk-dsh-agent-presets-bundle-1.0.0.tgz`。Windows 使用目标电脑实际的盘符绝对路径。
4. 安装完成后点 **立即启用**。如果提示需要重启，正常退出并重新打开 Harness。
5. 打开新任务的 Agent 预设列表，应出现上表中的五项。

不需要手工复制 Profile，也不需要手工编辑 `~/.dsh`。安装与启用由官方插件管理器执行，会正常修改目标 Profile 的依赖与 Bundle 选择。

本包依赖官方 `@deepseek-ai/dsh-subagent-codex@0.2.0-rc.2`（与导出电脑一致），安装时官方管理器需要从包源下载该依赖及其传递依赖。因此这是可搬运的本地插件包，**不是完整离线安装包**。

## 目标电脑需要具备的工具

预设不会自动安装外部开发工具、登录账号或复制凭证。

- Codex 协作：官方 Codex provider，以及该 provider 要求的 Codex 登录/运行环境。
- 鸿蒙模式：DevEco CLI（`devecocli`）与适用的 DevEco 工具链。
- iOS 模式：macOS 与 Xcode / Swift，按项目需要配置模拟器等工具。
- 逆向工程模式：REA（`rea`），深度原生反编译还需对应引擎。
- 小说模式：无需上述开发工具。

iOS / REA 的预设自有技能已放入包内，使用官方 Loader 的 `!!js` 路径表达式从本包位置解析，不依赖导出电脑的用户名或项目目录。其他从共享目录发现的个人技能不在本次导出范围内。

## 已有同名预设时

本包保留原有 ID，方便迁移；不要与原来的五个独立预设 Bundle 同时启用，否则会发生重复预设 ID。

在已有这些预设的电脑上使用本包前，先通过官方插件管理器停用原来的五个 `@sundusk/dsh-agent-preset-*` Bundle。本包也注册 Codex provider；若已经单独启用了官方 `@deepseek-ai/dsh-subagent-codex` Bundle，请停用该 Bundle 后再启用本包，避免重复注册。可以保留它的安装文件。

## 验证范围与兼容性

已使用当前本地官方源码的 `bundlePatchPaths` 与 `loadOverlayPatches` 读取全部六个 patch；检查五个 ID 唯一、原有插件组合保留，并验证安装包解压到不同路径后 iOS / REA 的技能目录仍能解析。

未在另一台电脑安装，也未在当前已启用独立预设的桌面 Profile 中重复安装。包格式与 API 依赖官方当前实现；未来 Harness 升级如更改插件配置 schema，应重新做安装与任务验证。

导出只包含预设、预设自有技能、规则和包元数据，不包含对话历史、账号、模型设置、Profile 文件或 Harness Runtime。

## 以后维护与更新

仓库目录：`presets/` 是五个预设，`skills/` 是配套技能，`codex-provider.patch.yml` 注册 provider，`package.json` 声明 Bundle 和依赖。

1. 修改对应预设或技能文件；技能的配套资源也放在其目录内。
2. 发布新的修改时递增 `package.json` 的 `version`。
3. 在本仓库目录中运行官方解析器验证（参数为已构建的官方源码目录）：

   ```sh
   node scripts/verify.mjs ../DeepseekHarness/deepseek-harness
   ```

4. 生成本地安装包：

   ```sh
   python3 scripts/pack.py
   ```

   安装包写入 `dist/`，不提交生成文件。打包不安装依赖、不写入 Harness 环境。
5. 提交修改并推送到 GitHub。使用者按官方第三方插件流程停用/卸载旧包，再从同一 GitHub 地址安装新版，按提示重启。GitHub 包不会自动随远端提交更新。

打包需要 Python 3.9+；官方解析器验证需要 Node.js 和已构建的上游源码。普通插件安装不需要克隆官方源码或运行这些维护脚本。
