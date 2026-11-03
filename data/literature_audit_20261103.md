# 文献遗漏核查记录：2026-11-03

本轮以现有版本为基线，核对 RPA 官方文献入口、RPA 标题 arXiv 查询、749 条 RPA 原始光谱记录及 2023–2026 年新增线索，并追查矮星系的原始高分辨率研究。它是一轮有明确证据和未决队列的增补核查，不是全球文献完备性证明。

## 已执行的主表补录

补入 **27 条逐文献测量、7 个来源标签**。其中四颗 Saraf2023 对象已有 Bandyopadhyay2020 测量，BPS CS 29529-0089 已有 RPA 的 Shah2026 测量；因此净增 **22 颗不同恒星**。旧的 814 条记录、record_id、star_id 和丰度均保留。四颗旧星的新名称作为别名加入；同星跨组共享编号。

| 来源 | 新增测量数 |
|---|---:|
| Saraf2023_HESP_GOMPA | 4 |
| daSilva2025_pair | 2 |
| Kane2026_disk | 14 |
| Hansen2017_TucIII | 1 |
| Marshall2019_TucIII | 4 |
| Hansen2020_GrusII | 1 |
| Hansen2024_TucV | 1 |

更新后：RPA **344** 颗，其他高分辨率来源 **410** 颗，跨组重叠 **30** 颗，合并 **724** 颗不同恒星；共 **841** 条逐文献记录、**88** 个来源标签。至少一条原文分类/原作者准则证据覆盖 **489** 颗不同恒星，其余证据层仍明确保留 Shank 汇编身份。主表成员数包含历史报道但不满足当前阈值或缺值的对象；严格统一样本需要继续筛选 r-I/r-II。

### 原始数据与边界核查

- [Saraf et al. 2023](https://doi.org/10.1093/mnras/stad2206)：Tables 1/5/6 和附录。第一作者是 Saraf；Susmitha 是合作者，未以错误第一作者建立来源。四颗星都与旧坐标匹配，属于新测量，不算四颗新恒星。
- [da Silva & Smiljanic 2025](https://doi.org/10.1051/0004-6361/202453295)：Tables 2/4/5/6。BPS CS 29529-0089 与 2MASS J04141624-6009048 以 Gaia DR3 4678520146255821952 合并；新增 Other 组测量而不重复建立身份。采用明确注明的 LTE 列，不混入另一列 NLTE 丰度。
- [Kane et al. 2026](https://arxiv.org/abs/2609.36013)：公开预印本，仍标记 submitted to MNRAS。17 颗 Eu 增丰对象仅补 14 颗 Ba/Eu<0 的作者 r-II 对象；另三颗带 dagger 且 Ba/Eu≥0，已列入排除表。Gaia DR3 **6649156522981897216** 的表列 Eu/Fe=0.70，因此统一分类为 r-I，作者 r-II 标签仍保存。Ba/Fe 由同一论文 Eu/Fe+Ba/Eu 重建，误差不猜测；Eu 为 Korg 新分析，Ba 是该文采用的 GALAH DR4 值，并非全元素同质重分析。
- [Hansen et al. 2017](https://arxiv.org/abs/1702.07430) 与 [Marshall et al. 2019](https://arxiv.org/abs/1812.01022)：Tucana III 共五颗独立观测对象。2019 年重复引用的 2017 对象不再记为一条新测量。2019 年四颗作者描述为中等 r 增丰的对象保留广义 RPE 标签，其中 J235738 的 Eu/Fe=0.22，在统一分类中为 outside，不人为改成 r-I。
- [Hansen et al. 2020](https://arxiv.org/abs/2005.10767)：Grus II 只补 J220423，Eu/Fe=0.31、Ba/Fe=-0.49，Ba/Eu=-0.80。其余两颗只有 Eu 上限，未补为确认星。
- [Hansen et al. 2024](https://arxiv.org/abs/2403.13060)：Tucana V 只补 Tuc V-2（Gaia DR3 6486519060804598016）。表中 Ba/Fe II=-0.32 与 Eu/Fe I=0.36 的铁基准不同；使用同表 Ba/H=-2.76、Fe I/H=-2.41 重建 Ba/Fe I=-0.35，得到一致的 Ba/Eu=-0.71。原 Ba/Fe II 数值及误差另列，未丢弃。另两颗 Eu 上限不用于分类。

## RPA 专项结果

749 条原始光谱记录来自 24 个来源标签；逐条以 source+稳定 RPA 身份检查。**原作者明确主 r 标签未收录的仅两条**：J19192768-5959140 和 J19445483-4039459，均为此前按 Shah2026/Agnos2026 后续改判移出的历史对象，不是本轮漏收。逐条决定见 [rpa_screening.csv](rpa_screening.csv)。

另发现两条必须保留为候选的情况：

1. **2MASS J17041197+1626552**，DR5 Table 4：Eu/Fe=+0.62±0.16，Ba/Fe=-0.31±0.22，Ba/Eu=-0.93。点值满足统一 r-I；原标签却为 **CEMP-no**。这是“数值层与原分类层不一致”，不能宣称作者已标为 r-I。保存在本轮候选附件。
2. **2MASS J18272432-5655165**，DR3 原标签 **r-I?**；Eu/Fe=+0.40、Ba/Fe=0.00。保留问号，待核，不从数值自动升级为作者确认。

[Roederer et al. 2022 universality](https://arxiv.org/abs/2210.15105) 已补查：八星比较的 Eu/Ba 来自既有研究；BD+17 3248 附录重测的是其他元素，未发现新增独立 Eu/Ba 配对，因此不凭论文标题增加测量数。动力学汇编、中分辨率目标验证、数值模拟不算新的高分辨率 Eu/Ba 独立测量。

官方入口与本次标题查询未找到可下载的正式 RPA 第六次发布表；这只是本轮检索结果，不据会议报告提到的 2000 目标数推定其已经公开。

## 数值候选附件：49 条，未并入主表计数

为遵守已有“作者证认/原作者准则/显式汇编”主表边界，新建 [threshold_candidates.csv](threshold_candidates.csv)：RPA 上述两条，MINCE II 27 条，MINCE III 20 条。这是本轮候选测量条数，**不等于 49 颗新恒星**；其中 3 条匹配到现有主表身份。MINCE 作者没有逐星分配 r-I/r-II 标签，附件明确写为 uniform thresholds applied，不冒充作者原分类。既有 Li2022 的 68 条数值候选不包括在这个新文件内。

MINCE III Section 3 指定离化元素相对 Fe II。用 Tables 10–12 的 Fe II/H 重建 Eu/Fe、Ba/Fe 可得 20 条达标记录；误用模型 Fe I/H 会得到 26 条，且改变部分分型。附件保留模型 Fe/H、丰度分母 Fe II/H、Eu/H、Ba/H，避免混淆。MINCE II 同时保留 Fe I 和 Fe II 的重建结果，待决定是否另建面向完整数值筛选的产品层。单线 Eu 的零线间散度不当作零总误差。

## 尚未关闭的覆盖缺口

- Ou2024 的 43 颗 GSE 高分辨率星：目前恢复的表有 Eu/H、Mg/H、Fe/H，没有 Ba；Eu 增丰本身不满足本网站的 Ba/Eu 条件。未将 43 颗整体计入 RPE，需追查完整表及同分析的 Ba。
- Hansen2017 Tables 4–5 引用的 Ursa Minor、Draco、Sculptor、Fornax、Carina 等历史矮星系对象：需要逐篇回溯原表及身份，不能把该文采用的他人测量再算成新的独立光谱结果。
- 早期 Shank 汇编条目的逐篇原文复核、旧 Naidu 引文问题及 Li2022 正文/CDS 个别数值和数量差异仍在队列中。既有候选或存在引文疑问的条目没有被本轮洗成原文确认。
- 公共低/中分辨率候选、GALAH 批量统计选样与尚未公开的 RPA2K 数据不被本轮“确认高分辨率”计数吸收。

## 可复现文件

- [literature_additions.csv](literature_additions.csv)：27 条新增主表测量，含原始标签、表号、方法、别名和统一类别。
- [threshold_candidates.csv](threshold_candidates.csv)：49 条单列候选，含是否匹配已有主表及待核原因。
- [literature_source_checks.csv](literature_source_checks.csv)：逐来源决定与未决队列。
- [excluded_candidates.csv](excluded_candidates.csv)：Kane 三颗仅富 Eu 而 Ba/Eu≥0 的排除实例。
- [audit_summary.json](audit_summary.json)：前后数量与同星匹配日志。

原始 HTML/PDF、SHA-256 下载清单、关键 PDF 表格渲染和更新前备份保存在本地 literature_audit_20261103 目录。网页公开的是核查结果与引用，不转载完整论文 PDF。
