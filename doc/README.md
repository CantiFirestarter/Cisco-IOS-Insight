# Cisco IOS Insight: Documentation

Welcome to the official documentation for **Cisco IOS Insight**, an AI-powered configuration auditor designed for network engineers and architects.

## Overview
Cisco IOS Insight leverages Google's Gemini Pro models to perform deep-packet inspection of Cisco IOS, IOS XE, and IOS XR configuration files. It specifically looks for:
- Security vulnerabilities (weak passwords, AAA, VTY hardening).
- Performance bottlenecks (MTU mismatches, EtherChannel hashing).
- Architectural inconsistencies (STP root placement, routing protocol timers).
- Best practice violations based on Cisco Validated Designs (CVD).

## Folder Structure
- `README.md`: This file.
- `USER_GUIDE.md`: Instructions on how to use the auditing tool effectively.
- `AUDIT_CRITERIA.md`: Detailed breakdown of the technical checks performed by the AI.
- `ARCHITECTURE.md`: High-level overview of the application's tech stack and AI integration.

## Professional Disclaimer
This tool is intended for use by **CCIE/CCNP level professionals**. Configurations generated or suggested by the AI should never be applied to a production environment without manual verification in a lab or staging environment.