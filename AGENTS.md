# 五合一预设包维护约定

- 仅维护本仓库的预设、技能和打包资源，不修改本机 Harness Profile 或官方源码。
- 保留五个 preset ID：codex、deveco、ios-senior、novel、rea。
- 使用官方声明式 Bundle；不复制 Harness Runtime，不添加自动安装外部工具的脚本。
- 包内技能路径必须从本包位置解析，不写死用户名、机器目录或工具版本。
- 修改配套技能时保留其 references、scripts、assets、许可证等资源。
- 更新预设后用官方解析器验证；发布安装包前运行 scripts/pack.py。
- Git 提交仅包含本仓库文件，推送后核对远端与本地 SHA；Release 需要用户单独请求。
