# 🗺️ Cisco IOS Insight: Strategic Roadmap

This document outlines the development trajectory for **Cisco IOS Insight**. Our goal is to evolve from a configuration auditor into a comprehensive AI-driven Network Reliability Engineering (NRE) platform.

---

## 🟢 Phase 1: Foundation (Current - v1.0.0)
*Focus: CCIE-Level Static Configuration Auditing*

- [x] **Multi-OS Support:** Native parsing for Cisco IOS, IOS XE, and IOS XR.
- [x] **Inter-Device Conflict Detection:** Automated identification of MTU, VLAN, and Routing Protocol mismatches between nodes.
- [x] **Gemini 3 Integration:** Utilizing high-context windows for large-scale network configuration sets.
- [x] **Structured Remediation:** Generation of valid Cisco CLI for security hardening and architectural alignment.
- [x] **Client-Side Security:** Local storage persistence for API keys and zero-server-side config storage.

---

## 🟡 Phase 2: Enhanced Analysis (Next 3-6 Months)
*Focus: Reporting, Differencing, and Multi-Vendor Breadth*

- [ ] **PDF Executive Reports:** Generate professional audit summaries with charts and impact analysis for management.
- [ ] **Config Diffing Engine:** Visual "Before vs. After" view for proposed remediation CLI.
- [ ] **Extended Vendor Support:** Initial support for Arista EOS and Juniper Junos to accommodate heterogeneous environments.
- [ ] **Offline Mode (Local LLM):** Integration options for local models (e.g., Llama 3 via Ollama) for high-security air-gapped environments.
- [ ] **GitHub/GitLab Integration:** Pull configuration files directly from infrastructure-as-code (IaC) repositories.

---

## 🟠 Phase 3: Intelligent Operations (6-12 Months)
*Focus: Dynamic Troubleshooting and Topology*

- [ ] **Visual Topology Mapping:** Dynamic generation of network diagrams based on LLM reasoning of LLDP/CDP and routing table configurations.
- [ ] **Live API Integration:** Real-time troubleshooting via the Gemini Live API for voice/text guided "show command" sequences.
- [ ] **Compliance Profiles:** Pre-built audit profiles for specific standards (PCI-DSS, HIPAA, NIST 800-53) tailored for Cisco hardware.
- [ ] **Interactive Remediation Terminal:** A safe, sandboxed terminal to test CLI commands against virtual network instances before production deployment.

---

## 🔴 Phase 4: Autonomous NRE (Long-Term Vision)
*Focus: Predictive Modeling and Closed-Loop Remediation*

- [ ] **Predictive Impact Analysis:** Simulate the "blast radius" of a configuration change before it is applied.
- [ ] **Closed-Loop Automation:** Integration with Cisco DNA Center / Catalyst Center for automated, human-approved remediation pushing.
- [ ] **Natural Language Querying:** "Ask your network" anything (e.g., *"Which switches in the Dallas DC are missing VTP transparent mode?"*).

---

## 🛠️ Contribution & Feedback
We value the input of the Cisco community. If you have feature requests or identified an architectural gap:
1. Contact the development team at [canti@firestartforge.dev](mailto:canti@firestartforge.dev).
2. Follow our updates at [firestarterforge.dev](https://firestarterforge.dev).

**Disclaimer:** All roadmap items are subject to change as AI capabilities and network engineering requirements evolve.