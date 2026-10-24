# ExtStats · VS Code 插件数据站

**前 2,000 个 VS Code Marketplace 扩展**(按安装量,官方 gallery 接口免鉴权),每扩展一页:安装量、评分、版本、排名、类目 + **逐日安装量时序**(本站独家——chrome-stats 不覆盖 VS Code 市场,历史从开跑之日起积累,绝不回填)。2,027 个静态页。

三个不掺假的事,与站群其他站同一套纪律:

- 数值全部来自 Visual Studio Marketplace 公开接口(extensionquery,sortBy=4 安装量降序实测)。
- 安装量历史是每日快照序列,第一天只有一点,页面如实说"历史从开跑之日起积累";跌出前 2000 的扩展从数据中消失(时序对留存 id 连续)。
- 增长榜需要至少两个快照点才出现,之前如实显示空态说明。

## 站点结构

| 路径 | 内容 | SEO 角色 |
|---|---|---|
| `/extension/[pub.name]` | 扩展页 ×1,998:安装/评分/版本/排名 + 时序火花线 | 长尾主力:"X vscode extension installs" |
| `/category/[slug]` | 类目页 ×~15:按安装量排序 | "best vscode themes" |
| `/rankings` | 总安装榜 / 高分榜 / 周增长榜 | "most installed vscode extensions" |
| `/extensions` | 全量 2,000 表 | 站内最大内链枢纽 |
| `/api/extension` | JSON(CORS 全开,?id= 含时序 / ?q= 搜索) | agent/MCP 数据口 |

## 数据流

```
marketplace.visualstudio.com extensionquery(20 页 × 100,温和限速)
  └─ scripts/sync-marketplace.mjs(GitHub Actions 每日 06:20 UTC + 手动)
       └─ data/marketplace.json(~650KB,时序日增;超 180 点隔点抽稀)
            └─ 站点只读仓库内 JSON,渲染路径零外呼
```

- 时序独家性:每天一个 [date, installs] 点,周增长榜(fastestGrowing)从第二天起开始有数据,这是别的站给不出的东西。
- JetBrains Marketplace(plugins.jetbrains.com 公开 API)留作二期,同一骨架加一个源即可。

## 本地跑起来

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_SITE_URL 部署时填
npm run dev
```

## 部署

1. GitHub 建仓推送(Vercel 导入,零配置);~2k 页构建十几秒。
2. Actions secrets:`SITE_URL`(体检用)。
3. 广告:AdSense 过审后配 `NEXT_PUBLIC_ADSENSE_CLIENT`,广告位即刻激活。

## 已知限制,如实说

- 只覆盖安装量前 2,000(EXT_TOP_N 可调);长尾小扩展不在册。
- Marketplace 接口无官方文档,字段变更由体检金丝雀兜底报警。
- 评分是全期平均,Marketplace 不提供时间分布。
