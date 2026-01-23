# System Prompt Setup Guide for Cline

**Purpose:** Configure Cline to automatically read and follow project-specific rules defined in `.cline/golden_rules.md`.

---

## Overview

This guide will help you add a generic instruction to Cline's system prompt that works across ALL your projects. The instruction tells Cline to:

1. Look for `.cline/golden_rules.md` in any project
2. Read it automatically at the start of each session
3. Treat those rules as absolute requirements
4. Reference detailed rules in `.cline/project_rules.md` when needed

---

## Method 1: Cline Custom Instructions (Easiest)

Cline provides a "Custom Instructions" feature that allows you to add project-independent instructions.

### Steps:

1. **Open Cline Settings**
   - In VS Code, click the Cline icon in the sidebar
   - Click the settings gear icon (⚙️) in the Cline panel
   - Or: `Cmd+Shift+P` → "Cline: Open Settings"

2. **Find Custom Instructions Section**
   - Look for "Custom Instructions" or "System Prompt Override"
   - This may be under an "Advanced" section

3. **Add This Instruction:**

```
PROJECT RULES AUTO-DETECTION:

At the start of each project interaction, check if .cline/golden_rules.md exists.

If it exists:
1. Read .cline/golden_rules.md IMMEDIATELY before starting any task
2. Treat ALL rules in that file as ABSOLUTE requirements
3. These project rules override general guidance when they conflict
4. For detailed implementation, reference .cline/project_rules.md
5. For quick lookup, reference .cline/ai_quick_reference.md

The golden_rules.md file contains non-negotiable project-specific workflow requirements that must be followed at all times.
```

4. **Save Settings**
   - Cline will now apply this instruction to all projects

---

## Method 2: Modify Cline Extension Settings (More Technical)

If Method 1 doesn't work or you want more control:

### Find Cline Settings File

**macOS:**

```bash
~/Library/Application Support/Code/User/settings.json
```

**Linux:**

```bash
~/.config/Code/User/settings.json
```

**Windows:**

```
%APPDATA%\Code\User\settings.json
```

### Add to settings.json:

```json
{
  "cline.customInstructions": "PROJECT RULES AUTO-DETECTION:\n\nAt the start of each project interaction, check if .cline/golden_rules.md exists.\n\nIf it exists:\n1. Read .cline/golden_rules.md IMMEDIATELY before starting any task\n2. Treat ALL rules in that file as ABSOLUTE requirements\n3. These project rules override general guidance when they conflict\n4. For detailed implementation, reference .cline/project_rules.md\n5. For quick lookup, reference .cline/ai_quick_reference.md\n\nThe golden_rules.md file contains non-negotiable project-specific workflow requirements that must be followed at all times."
}
```

---

## Method 3: Global MCP Server (Advanced)

Create a global MCP server that provides project rules as a resource.

### Steps:

1. **Create MCP Server Config**
   - Location: `~/.config/cline/mcp_settings.json` (or similar)

2. **Add Project Rules Server:**

```json
{
  "mcpServers": {
    "project-rules": {
      "command": "node",
      "args": ["/path/to/project-rules-mcp-server.js"]
    }
  }
}
```

3. **Server Implementation:**
   - The server would expose `.cline/golden_rules.md` as a resource
   - Cline would auto-load it when available
   - This is the most robust but requires custom development

---

## Method 4: Workspace-Specific Settings (Per Project)

If you want project-specific configuration:

### Create `.vscode/settings.json` in your project:

```json
{
  "cline.customInstructions": "Read .cline/golden_rules.md at the start of this session and follow all rules absolutely."
}
```

**Pros:**

- Project-specific
- Committed to repo
- Team members get same settings

**Cons:**

- Must be added to every project
- Not truly "automatic"

---

## Verification

Test if it's working:

1. **Start a new Cline conversation in your project**

2. **Ask Cline:** "What are the golden rules for this project?"

3. **Expected Response:**
   - Cline should reference `.cline/golden_rules.md`
   - Should list the 11 rules
   - Should mention reading the file

4. **If Cline doesn't know:**
   - Settings not applied correctly
   - Try reloading VS Code: `Cmd+Shift+P` → "Reload Window"
   - Check if custom instructions were saved

---

## Troubleshooting

### "Cline doesn't have custom instructions field"

- **Solution:** Update Cline extension to latest version
- Check: Extensions panel → Cline → Update

### "Settings don't seem to apply"

- **Solution 1:** Reload VS Code window
- **Solution 2:** Restart VS Code completely
- **Solution 3:** Check syntax in settings.json (no trailing commas)

### "Cline reads rules but doesn't follow them"

- **Solution:** Make rules more explicit in golden_rules.md
- Ensure rules are marked as ABSOLUTE/MANDATORY
- Consider adding examples to ai_quick_reference.md

### "Want different rules per project"

- **Solution:** Use Method 4 (workspace settings)
- Or: Keep golden_rules.md but customize per project
- Project-specific rules override global settings

---

## Alternative: Manual Workflow

If automatic reading doesn't work, create a workflow:

### Template First Message:

```
Hi Cline! Before we start:

1. Please read .cline/golden_rules.md
2. Confirm you understand the 11 rules
3. Then we can begin

Ready?
```

### Or Create a Slash Command:

In Cline settings, create custom slash command:

```
/rules → Read .cline/golden_rules.md and confirm understanding
```

---

## Best Practices

### 1. Keep golden_rules.md Concise

- One screen maximum
- Link to detailed docs
- Focus on absolute requirements

### 2. Use Consistent Naming

- Always `.cline/golden_rules.md`
- Makes automation easier
- Works across all projects

### 3. Version Control

- Commit `.cline/` directory
- Team members get same rules
- Rules evolve with project

### 4. Test Regularly

- Verify Cline follows rules
- Update rules based on violations
- Refine language for clarity

### 5. Document Exceptions

- If rules must be broken, document why
- Update golden_rules.md if pattern emerges
- Keep rules realistic and achievable

---

## For Teams

### Onboarding New Developers:

1. **Clone repository** (includes `.cline/` directory)
2. **Install Cline extension**
3. **Follow this guide** to set up custom instructions
4. **Test with verification steps**
5. **Start development** with AI assistance

### Keeping Rules in Sync:

- Rules are committed to repo
- Pull latest changes gets updated rules
- No manual sync needed
- Cline reads latest version automatically

---

## Future Improvements

### Potential Enhancements:

1. **MCP Server for Rules**
   - Auto-expose project rules
   - Version checking
   - Team-wide consistency

2. **VS Code Extension**
   - One-click rule setup
   - Validation of rule files
   - Real-time rule checking

3. **Rule Templates**
   - Starter templates for common project types
   - Best practices collection
   - Community-contributed rules

---

## Summary

**Recommended Approach:**

1. Use **Method 1** (Custom Instructions) - easiest and most reliable
2. Keep `.cline/golden_rules.md` under 100 lines
3. Reference detailed docs for implementation
4. Test with every new project
5. Update rules based on experience

**Key Instruction to Add:**

```
At the start of each project, check if .cline/golden_rules.md exists.
If it does, read it immediately and treat all rules as absolute requirements.
```

This simple instruction ensures Cline knows your project's specific requirements from the start, leading to better collaboration and fewer mistakes.

---

## Need Help?

- Check Cline documentation: https://github.com/cline/cline
- Cline Discord community
- VS Code extension issues page
- This project's `.cline/` directory for examples

---

**Last Updated:** 2026-01-23  
**Applies to:** Cline v2.0+ (adjust for your version)
