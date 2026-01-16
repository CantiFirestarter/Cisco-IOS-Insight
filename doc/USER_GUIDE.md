# User Guide: How to Audit Your Cisco Network

This guide explains how to get the most out of Cisco IOS Insight.

## 1. Preparing Your Configurations
The tool works best with the output of the `show running-config` command. 
- **Single Device:** Paste the config directly or upload a `.cfg` file.
- **Multi-Device:** Upload multiple files simultaneously to trigger the **Inter-Device Conflict Detection** engine.

## 2. Running an Audit
1. Navigate to the main dashboard.
2. Select **Upload** to add files or **Paste** to enter raw CLI text.
3. Click **Audit Node** (or **Audit Network** for multiple files).
4. Wait for the Gemini AI to process the architectural data.

## 3. Interpreting Results
Results are categorized into four tabs:
- **Conflicts:** Issues arising from inconsistencies between two or more devices (e.g., VLAN pruning mismatches).
- **Issues:** Device-specific misconfigurations or security risks.
- **Cisco OK:** Configurations that were found to be compliant with best practices.
- **Advisory:** High-level architectural guidance that isn't necessarily a "fix" but an improvement.

## 4. Remediation
For every identified issue, the tool provides a **Remediation CLI** block.
- Use the **Copy** button to grab the commands.
- **Warning:** Always verify the syntax. AI may occasionally produce syntax that varies slightly between IOS versions (e.g., legacy IOS vs. IOS XE).