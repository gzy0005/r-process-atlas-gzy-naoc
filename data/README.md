# R过程增丰恒星文献星表与网站

核查日期：2026-11-03。

本版 RPA 主表 344 颗，其他高分辨率主表 410 颗；两类交集 30 颗，合并后 724 颗不同恒星，共 841 条逐文献记录、88 个丰度来源标签。这里是本版已收录数量，不代表完成所有历史文献、所有卫星星系和最新预印本的穷尽普查。

## 两个主文件

- `RPA_confirmed_RPE_stars.csv`：原始光谱/丰度研究属于RPA的对象，每颗一行。
- `Other_highres_confirmed_RPE_stars.csv`：其他高分辨率研究，每颗一行。

同一恒星可以在两表各出现一次。`star_id`是本版统一身份，`overlap`标识交集；不要直接把两表行数相加当作唯一星数。RPA合作作者参与的其他项目不会仅因作者重叠就归为RPA。RPA主导的文献汇编也不等于RPA自测。

## 分类证据及收录边界

网页主分类、图表、筛选和下载均采用统一标准：r-I 为 0.3 < [Eu/Fe] ≤ 0.7；r-II 为 [Eu/Fe] > 0.7；两类均要求 [Ba/Eu] < 0。依据 Holmbeck et al. (2020)：https://arxiv.org/abs/2007.00749。分类仅用同一条文献的 Eu、Ba 点值；不以缺失或限值推定。

原文 r-III 在统一分类中并入 r-II，CEMP 属性独立保留。Eu = 0.30 标记 boundary（阈值边界）；缺值或限值标记 unavailable（待判定）；其余不满足条件标记 outside。不因统一分类删除原文库成员，严格统一样本应筛选 r-I 或 r-II。

1. 收录原作者明确r-I、r-II、r-III、CEMP-r、广义RPE的记录。原始标签保存在 published_class 与 literature_r_class，主分类采用统一边界。
2. 较早资料的一部分来自Shank2023公开高分辨率文献汇编；`classification_basis=Shank2023 compilation`明确区别于原作者直接证认。网页可筛选仅原文分类。
3. Shah2026部分分类依据作者在正文给出的阈值和其Eu/Ba条件重建，标记为author criteria applied。
4. limited-r、r/s混合增强、带问号且未解决的原作者类别不直接升级为主r增强。
5. 两颗后续测量按作者判为non-RPE的历史记录（J19192768−5959140、J19445483−4039459）从当前主表移出，保存在support/historical_RPE_reclassified.csv。第一颗依据Shah2026作者准则重建，第二颗Agnos2026明确改判。
6. Li2022仅按数值阈值挑出的68条另存候选附件，不与主表相加；本次仅补正文逐名明确认定的3条历史测量。正式发表正文与CDS表存在个别Eu数值/数量差异，保留说明。
7. 部分核球对象的原作者分类依据La/Ce等元素，即使Ba/Eu=0仍保留作者类别；文献结论保留在原始分类字段；统一分类则严格依据同条测量的 Eu、Ba 条件。

证据分层（每个来源类别内按恒星计）：

- RPA：有原文分类或作者准则支持 342 颗；仅本版已导入汇编分类支持 2 颗。
- Other：有原文分类或作者准则支持 174 颗；仅本版已导入汇编分类支持 236 颗。

## 代表值与字段

| 字段 | 含义 |
|---|---|
| star_id / name / aliases | 本版身份、代表名称、其他已知名称；内部ID不保证跨未来版本永久不变 |
| ra_deg / dec_deg | J2000坐标（度）；少数原表坐标粗略，见note和coordinate_precision_arcsec |
| Teff_K / logg_dex / FeH_dex | 代表测量的大气参数，缺失为空，不填零 |
| Eu_Fe_dex / Ba_Fe_dex | 代表文献的丰度比，不是你的DR13测量，也未施加DR13修正 |
| Ba_Eu_dex | 仅同一条测量中Eu、Ba均有点值时，用Ba_Fe−Eu_Fe计算 |
| eu_status / ba_status | 检出、限值或缺失状态 |
| r_class / uniform_threshold_class | 统一主分类：r-I、r-II、boundary、unavailable 或 outside；两字段一致 |
| literature_r_class / published_class | 保留的原文规范类别与原始分类文字 |
| uniform_class_status / uniform_class_note | 分类计算状态与边界、缺值、限值或未满足条件的说明 |
| uniform_classification_rule | 可追溯的统一阈值规则；不替代文献证据等级 |
| classification_basis | 原文分类、按作者规则重建、或Shank2023汇编分类 |
| source / reference / year | 丰度原始来源标签、可核对链接及年份 |
| solar_scale / note | 太阳标尺、LTE/NLTE、FeI/FeII分母、异常与表格差异 |
| record_ids / n_records / all_sources | 对应逐文献记录及收录文献数量 |
| host_system | 已核实的宿主系统；未核对的不作确定分类 |
| source_citation_needs_review | 原始引文仍需复核（Naidu来源18条），直接链接到已核对Shank汇编 |
| publication_status | 已确认预印本等状态；见原论文 |

统一分类的计算状态独立于原文证据等级。统一阈值不意味着不同论文太阳标尺、LTE/NLTE、Fe I/Fe II 分母已同质化。代表记录变更见 support/uniform_classification_changes.csv。

代表值不做跨论文平均。每个来源类别内优先原文分类记录，其次Eu/Ba均为检出的记录，再选较新年份；所有已导入的独立论文测量保留在support/publication_measurements.csv。相同论文被Shank再次摘录时不算新独立测量，备份在duplicate_compilation_variants.csv。优先顺序是一项检索展示约定，不表示所选论文必然最准确。网页选择某一文献后会改显示该文献的测量。

## 身份合并与已修正的问题

- 优先已核实恒星ID、Gaia字符串ID和恒星别名；再检查3角秒近邻。已知不同Gaia ID不按坐标强制合并。
- 同一J名称不同小数位、RAVE/2MASS写法作规范化；对粗坐标不机械使用3角秒规则。
- 两组Shank名称/坐标与原论文不一致：J173602.30−514529.6对应2MASSJ17360167−5145296；J152139.00−353809.0对应Cain2020的2MASSJ15213995−3538094，按同文献对象证据合并。
- GHOST的GDR3 1760与Ji2016 DESJ033607−540235按原文交叉身份合并。
- Racca2025两颗J2106/J2109的CDS文件关联与正文按星名表列不一致，采用论文Table7对应值，并保留说明。
- SALT J130404.1−240837原表/CDS赤纬与星名矛盾，采用名称编码坐标−24.1436111度并标注。
- Naidu18条的旧bibcode指向另一篇文章，本版不把推测的新DOI当成已核实逐星出处；以Shank表为直接可验证来源，保留待复核字段。

## 原始数据与覆盖

- RPA：5次主要发布与已核实的单星/小样本研究。没有把未公开RPA2K/DR6当作已收录数据。
- 较早高分辨率文献：Shank2023的582星分支，逐条恢复原始Ref；不包含其1194颗GALAH统计选样分支。
- 新补：Lin2026、Xie系列、Caffau2026、SALT原始分类表、Ji2016及GHOST的Reticulum II、核球对象等。
- SALT原表逐星Class与摘要总数不完全一致，按原表Class而非凑摘要数量；Rasmussen两条仅有后续Shank分类支持的记录明确保留为汇编证据层。
- 仍有未完整逐表核查的来源/对象，见research_other_highres.md；本版不声称全历史完备。

参考入口：

- RPA官方文献清单：https://sites.google.com/view/rprocessalliance/news-publications
- Shank2023：https://cdsarc.cds.unistra.fr/viz-bin/cat/J/ApJ/943/23
- Rasmussen2020：https://cdsarc.cds.unistra.fr/viz-bin/cat/J/ApJ/905/20
- Zepeda2022：https://cdsarc.cds.unistra.fr/viz-bin/cat/J/ApJ/927/13
- Hypatia界面参考：https://www.hypatiacatalog.com/hypatia/default/help

## 网站

https://gzy0005.github.io/r-process-atlas-gzy-naoc/

提供星名/别名检索、类别与证据层筛选、文献筛选、Fe/H与Eu/Fe范围、交互散点图、逐星文献记录及CSV下载。当前为公开访问；沿用现有网站项目。提供分类诊断图、悬浮详情、SVG 和高分辨率 PNG 导出。没有上传你的DR13私人测量。

## 2026-11-03 文献遗漏核查增补

补入 Saraf2023、daSilva2025、Kane2026 银河盘小样本、Hansen2017/Tucana III、Marshall2019/Tucana III、Hansen2020/Grus II、Hansen2024/Tucana V 共27条测量，净增22颗不同恒星。Kane2026仍是公开预印本，作者 r-II 与表列 Eu=0.70 的统一 r-I 分开保存。Tuc V-2 的 Ba/Fe 在同篇表中转换到与 Eu 相同的 Fe I 分母，原 Ba/Fe II 数值和误差保留在 published_ba_fe、published_ba_fe_error；ba_derivation 明确给出推导。未将线间散度伪装成总误差。

RPA749条原始光谱记录已逐项对照；两颗历史撤回对象仍不回填。DR5 J17041197+1626552（原 CEMP-no，数值满足 r-I）和 DR3 J18272432-5655165（原 r-I?）进入独立候选附件。另有 MINCE II 27条、MINCE III 20条数值候选，仍遵守本库作者证据边界，不计入724颗和841条主表总数；附件49条不是49颗新恒星。MINCE离化元素使用Fe II，模型Fe/H和丰度分母不同字段分别保留。

核查报告及可复现清单：[literature_audit_20261103.md](literature_audit_20261103.md)、[literature_additions.csv](literature_additions.csv)、[threshold_candidates.csv](threshold_candidates.csv)、[literature_source_checks.csv](literature_source_checks.csv)、[rpa_screening.csv](rpa_screening.csv)。完整未决范围和逐文献决定见报告。本库仍不宣称所有历史文献/矮星系结果均已穷尽。
