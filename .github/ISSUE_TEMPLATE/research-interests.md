---
name: Research Interests
about: Configure paper search topics
title: Research Interests
labels: config
assignees: ''
---

```json
{
  "sources": [
    { "type": "arxiv", "name": "arXiv" },
    { "type": "openalex", "name": "OpenAlex" },
    { "type": "crossref", "name": "Crossref" },
    {
      "type": "feed",
      "name": "Nature News",
      "url": "https://www.nature.com/nature.rss"
    },
    {
      "type": "feed",
      "name": "Nature Physics",
      "url": "https://www.nature.com/nphys.rss"
    },
    {
      "type": "feed",
      "name": "Physical Review Letters",
      "url": "https://feeds.aps.org/rss/recent/prl.xml"
    },
    {
      "type": "feed",
      "name": "Physical Review X",
      "url": "https://feeds.aps.org/rss/recent/prx.xml"
    },
    {
      "type": "feed",
      "name": "PRX Quantum",
      "url": "https://feeds.aps.org/rss/recent/prxquantum.xml"
    },
    {
      "type": "feed",
      "name": "Physical Review A",
      "url": "https://feeds.aps.org/rss/recent/pra.xml"
    },
    {
      "type": "feed",
      "name": "Physical Review B",
      "url": "https://feeds.aps.org/rss/recent/prb.xml"
    },
    {
      "type": "feed",
      "name": "Physical Review Applied",
      "url": "https://feeds.aps.org/rss/recent/prapplied.xml"
    },
    {
      "type": "feed",
      "name": "Physical Review Research",
      "url": "https://feeds.aps.org/rss/recent/prresearch.xml"
    },
    {
      "type": "feed",
      "name": "Reviews of Modern Physics",
      "url": "https://feeds.aps.org/rss/recent/rmp.xml"
    }
  ],
  "journal_highlight_sources": [
    "Nature News",
    "Nature Physics",
    "Physical Review Letters",
    "Physical Review X",
    "PRX Quantum",
    "Physical Review A",
    "Physical Review B",
    "Physical Review Applied",
    "Physical Review Research",
    "Reviews of Modern Physics"
  ],
  "conference_sources": {
    "enabled": false
  },
  "topics": [
    {
      "id": "cond_mat_quant_gas_recent",
      "name": "cond-mat.quant-gas 每日更新",
      "description": "完整跟踪 arXiv cond-mat.quant-gas recent 列表中的每日更新，作为量子气体和冷原子论文的兜底分类源。",
      "keywords": [],
      "arxiv_categories": ["cond-mat.quant-gas"]
    },
    {
      "id": "physics_atom_ph_recent",
      "name": "physics.atom-ph 每日更新",
      "description": "完整跟踪 arXiv physics.atom-ph recent 列表中的每日更新，覆盖原子物理、冷原子实验和相关量子光学方向。",
      "keywords": [],
      "arxiv_categories": ["physics.atom-ph"]
    },
    {
      "id": "quant_ph_recent",
      "name": "quant-ph 每日更新",
      "description": "完整跟踪 arXiv quant-ph recent 列表中的每日更新，覆盖量子信息、超导量子电路、circuit QED 和量子模拟方向。",
      "keywords": [],
      "arxiv_categories": ["quant-ph"]
    },
    {
      "id": "cond_mat_supr_con_recent",
      "name": "cond-mat.supr-con 每日更新",
      "description": "完整跟踪 arXiv cond-mat.supr-con recent 列表中的每日更新，覆盖超导、约瑟夫森器件和相关凝聚态方向。",
      "keywords": [],
      "arxiv_categories": ["cond-mat.supr-con"]
    },
    {
      "id": "cond_mat_mes_hall_recent",
      "name": "cond-mat.mes-hall 每日更新",
      "description": "完整跟踪 arXiv cond-mat.mes-hall recent 列表中的每日更新，覆盖介观、量子霍尔、拓扑输运和相关器件方向。",
      "keywords": [],
      "arxiv_categories": ["cond-mat.mes-hall"]
    },
    {
      "id": "cond_mat_str_el_recent",
      "name": "cond-mat.str-el 每日更新",
      "description": "完整跟踪 arXiv cond-mat.str-el recent 列表中的每日更新，覆盖强关联电子、拓扑物态和量子多体方向。",
      "keywords": [],
      "arxiv_categories": ["cond-mat.str-el"]
    },
    {
      "id": "cond_mat_mtrl_sci_recent",
      "name": "cond-mat.mtrl-sci 每日更新",
      "description": "完整跟踪 arXiv cond-mat.mtrl-sci recent 列表中的每日更新，覆盖拓扑材料和量子材料方向。",
      "keywords": [],
      "arxiv_categories": ["cond-mat.mtrl-sci"]
    },
    {
      "id": "quantum_gases_cold_atoms",
      "name": "量子气体与冷原子",
      "description": "关注 ultracold atoms、quantum gases、Bose/Fermi gases、BEC、optical lattices、Rydberg atoms、量子模拟和强关联冷原子体系。",
      "keywords": [
        "ultracold atoms",
        "quantum gas",
        "Bose-Einstein condensate",
        "degenerate Fermi gas",
        "optical lattice",
        "Rydberg atoms",
        "cold atom quantum simulation",
        "strongly correlated cold atoms",
        "many-body localization",
        "spinor condensate",
        "synthetic gauge field",
        "Feshbach resonance"
      ],
      "arxiv_categories": ["cond-mat.quant-gas", "physics.atom-ph", "quant-ph", "cond-mat.str-el"]
    },
    {
      "id": "topological_quantum_matter",
      "name": "拓扑量子物态与拓扑物理",
      "description": "关注 topological phases、topological insulators/superconductors、Chern bands、fractional Chern insulators、Majorana modes、quantum Hall、拓扑量子材料和非平衡拓扑现象。",
      "keywords": [
        "topological phase",
        "topological insulator",
        "topological superconductor",
        "Chern band",
        "fractional Chern insulator",
        "Majorana zero mode",
        "quantum Hall",
        "topological quantum matter",
        "Berry curvature",
        "topological order",
        "non-Hermitian topology",
        "Floquet topology"
      ],
      "arxiv_categories": ["cond-mat.mes-hall", "cond-mat.str-el", "cond-mat.mtrl-sci", "quant-ph"]
    },
    {
      "id": "superconducting_circuits_cqed",
      "name": "超导电路与 circuit QED",
      "description": "关注 superconducting circuits、circuit QED、transmon/fluxonium qubits、microwave resonators、量子测量、量子模拟、误差校正、参数放大和超导量子硬件。",
      "keywords": [
        "superconducting circuit",
        "circuit QED",
        "transmon qubit",
        "fluxonium",
        "microwave resonator",
        "Josephson junction",
        "superconducting qubit",
        "quantum error correction",
        "parametric amplifier",
        "bosonic qubit",
        "quantum measurement",
        "superconducting quantum processor"
      ],
      "arxiv_categories": ["quant-ph", "cond-mat.supr-con", "cond-mat.mes-hall"]
    },
    {
      "id": "quantum_simulation_platforms",
      "name": "量子模拟平台与多体动力学",
      "description": "关注冷原子、离子、超导电路和光学平台上的量子模拟，多体动力学、开放量子系统、量子相变和实验可观测量。",
      "keywords": [
        "quantum simulation",
        "many-body dynamics",
        "open quantum system",
        "quantum phase transition",
        "analog quantum simulator",
        "digital quantum simulation",
        "Hamiltonian engineering",
        "driven-dissipative quantum system",
        "quantum quench",
        "entanglement dynamics",
        "quantum many-body experiment",
        "synthetic quantum matter"
      ],
      "arxiv_categories": ["quant-ph", "cond-mat.quant-gas", "cond-mat.str-el", "physics.atom-ph"]
    }
  ]
}
```
