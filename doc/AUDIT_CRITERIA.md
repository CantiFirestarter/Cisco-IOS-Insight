# Audit Criteria and Logic

Cisco IOS Insight uses a CCIE-level system instruction to guide the Gemini model. Below are the primary domains of inspection.

## 1. Security & Hardening
- **Management Plane:** Verification of SSH v2, VTY line ACLs, and console timeouts.
- **Authentication:** Checks for `service password-encryption`, `secret` instead of `password`, and AAA configuration.
- **Control Plane:** Detection of Control Plane Policing (CoPP) and unauthorized services (e.g., small servers, source-route).

## 2. Layer 2 Infrastructure
- **Spanning Tree:** Validation of Root Guard, BPDU Guard on Edge ports, and Root Bridge priority.
- **Trunking:** Checking for Native VLAN mismatches and allowed VLAN lists.
- **EtherChannel:** Auditing for hashing algorithm consistency and PAgP/LACP mode alignment.

## 3. Layer 3 & Routing
- **OSPF/EIGRP/BGP:** Consistency of timers (Hello/Hold), MTU alignment across neighbors, and passive-interface application.
- **FHRP:** Optimization of HSRP/VRRP priorities and tracking.
- **IP Addressing:** Detection of duplicate IPs or overlapping subnets in multi-config audits.

## 4. System & Services
- **NTP:** Verification of synchronized time sources and stratum levels.
- **Logging:** Presence of buffered logging and external syslog server configuration.
- **SNMP:** Auditing for secure community strings and SNMPv3 usage.