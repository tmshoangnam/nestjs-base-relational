# GitHub Copilot Instructions - Complete Guide

> Comprehensive AI coding agent instructions for TMC NoCode Survey Backend

## 📁 Files Overview

This directory contains specialized instruction files for different GitHub Copilot Chat use cases.

### 1. **copilot-instructions.md** (Main Guide - 42 KB)
**Purpose**: General guidelines and architecture reference for AI agents
**Best for**: Understanding codebase, learning patterns, implementing features

**Contains**:
- ✅ Project overview and architecture
- ✅ Authorization & security patterns
- ✅ Exception handling & response formats
- ✅ Persistence layer & mapper pattern
- ✅ Testing & development workflows
- ✅ Configuration & constants
- ✅ Multi-tenancy guidance
- ✅ Common patterns & examples
- ✅ Advanced scenarios (complex queries, caching, audit trails)
- ✅ Critical clarifications for AI agents
- ✅ 10-step workflow for implementing features
- ✅ 40+ code examples
- ✅ **1,275 lines** of comprehensive guidance

**Key sections**:
- Architecture patterns with real examples
- Mapper pattern deep dive
- Multi-relation filtering & sorting
- Service dependency injection
- Request context & audit trails
- Caching strategy
- Token & session management
- Soft-delete pattern

**When to use**: Before starting any feature implementation

---

### 2. **copilot-code-review.md** (Code Review - 9.4 KB)
**Purpose**: Guide AI agents when reviewing code changes and pull requests
**Setting**: `github.copilot.chat.reviewSelection.instructions`
**Best for**: Code review, pull request feedback, quality checks

**Contains**:
- ✅ 15 review focus areas
- ✅ Architecture & design pattern checks
- ✅ Exception handling verification
- ✅ Response format validation
- ✅ Authorization & security checks
- ✅ Data access & query review
- ✅ Mapping pattern verification
- ✅ Configuration best practices
- ✅ Error messages & i18n validation
- ✅ Dependency injection review
- ✅ Testing coverage assessment
- ✅ Code quality standards
- ✅ Pagination & filtering verification
- ✅ Database operations review
- ✅ Soft delete pattern checking
- ✅ Multi-role support validation
- ✅ 15-point review checklist
- ✅ Critical, important, minor severity flags
- ✅ Reference commands for validation

**Key features**:
- Line-by-line pattern checks
- Security vulnerability detection
- Architecture violation detection
- Common mistakes flagged
- Green/yellow/red severity levels

**When to use**: 
- Running code review with Copilot Chat
- Selecting code in editor and asking for review
- Before merging pull requests

---

### 3. **copilot-commit-message.md** (Commit Messages - 8.5 KB)
**Purpose**: Guide AI agents when generating commit messages
**Setting**: `github.copilot.chat.commitMessageGeneration.instructions`
**Best for**: Auto-generating conventional commit messages

**Contains**:
- ✅ Conventional Commits format
- ✅ Type reference (feat, fix, docs, test, refactor, perf, chore, ci, style, revert)
- ✅ Scope reference (auth, users, roles, database, etc.)
- ✅ Subject line rules
- ✅ Body format guidelines
- ✅ Footer format (breaking changes, closes)
- ✅ 10+ real examples for each type
- ✅ Context-aware generation guidance
- ✅ Red flags to avoid
- ✅ Common patterns
- ✅ Validation checklist
- ✅ AI generation guidelines
- ✅ Integration with husky + commitlint

**Commit types supported**:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code restructuring
- `perf`: Performance improvements
- `chore`: Dependencies, build
- `ci`: CI/CD changes
- `style`: Formatting only
- `revert`: Revert commits

**When to use**:
- Generating commit messages for staged changes
- Creating meaningful commit history
- Following semantic versioning

---

### 4. **copilot-pull-request.md** (PR Descriptions - 12.6 KB)
**Purpose**: Guide AI agents when generating PR titles and descriptions
**Setting**: `github.copilot.chat.pullRequestDescriptionGeneration.instructions`
**Best for**: Creating PR titles and detailed descriptions

**Contains**:
- ✅ PR title format & examples
- ✅ PR description template
- ✅ 5 PR description examples by type
  - Feature PR (multi-role support)
  - Bug fix PR (soft-delete query)
  - Refactoring PR (mapper extraction)
  - Test PR (E2E test suite)
  - Database PR (avatar field migration)
- ✅ PR description guidelines
- ✅ Good practices & anti-patterns
- ✅ Analysis steps
- ✅ Code file patterns
- ✅ Common PR combinations
- ✅ PR template for repository
- ✅ Release notes generation

**PR description includes**:
- 🎯 Description (what & why)
- 🔧 Changes (list of modifications)
- 🧪 Testing (how to test)
- 📊 Impact/metrics
- 🚀 Breaking changes note
- 📋 Checklist (15+ items)
- 🔗 Related issues

**When to use**:
- Creating pull requests
- Drafting PR descriptions
- Generating PR titles from code changes

---

## 🎯 How to Use These Files

### For Code Generation
1. **Read**: `copilot-instructions.md` (main guide)
2. **Implement**: Follow the 10-step workflow
3. **Review**: Use `copilot-code-review.md` patterns

### For Code Review
1. **Open**: Any file in editor
2. **Select**: Relevant code section
3. **Ask**: "Review this code"
4. Uses: `copilot-code-review.md` instructions

### For Commit Messages
1. **Stage**: Your changes
2. **Ask**: "Generate commit message"
3. **Uses**: `copilot-commit-message.md` format

### For Pull Requests
1. **Create**: New PR on GitHub
2. **Ask**: "Generate PR title and description"
3. **Uses**: `copilot-pull-request.md` template

---

## 🔧 GitHub Copilot Chat Configuration

To integrate these instructions into GitHub Copilot Chat, use these settings:

### Settings Location
`.github/copilot-instructions.md` (already in use globally)

### For Specialized Instructions
Add to `.copilot-settings.json` or GitHub settings:

```json
{
  "github.copilot.chat.reviewSelection.instructions": ".github/copilot-code-review.md",
  "github.copilot.chat.commitMessageGeneration.instructions": ".github/copilot-commit-message.md",
  "github.copilot.chat.pullRequestDescriptionGeneration.instructions": ".github/copilot-pull-request.md"
}
```

### Or via VS Code Settings
`.vscode/settings.json`:
```json
{
  "[github.copilot.chat]": {
    "reviewSelection.instructions": "${workspaceFolder}/.github/copilot-code-review.md",
    "commitMessageGeneration.instructions": "${workspaceFolder}/.github/copilot-commit-message.md",
    "pullRequestDescriptionGeneration.instructions": "${workspaceFolder}/.github/copilot-pull-request.md"
  }
}
```

---

## 📊 File Statistics

| File | Size | Lines | Focus Area |
|------|------|-------|-----------|
| **copilot-instructions.md** | 42 KB | 1,275 | General guide & architecture |
| **copilot-code-review.md** | 9.4 KB | ~380 | Code review patterns |
| **copilot-commit-message.md** | 8.5 KB | ~340 | Commit format |
| **copilot-pull-request.md** | 12.6 KB | ~500 | PR titles & descriptions |
| **Total** | **72.5 KB** | **~2,500** | Complete AI guidance |

---

## 🎓 Content by Topic

### Architecture & Design
- `copilot-instructions.md`: Architecture Patterns section
- `copilot-code-review.md`: Architecture & Design Patterns check
- `copilot-pull-request.md`: Refactoring PR example

### Authorization & Security
- `copilot-instructions.md`: Authorization & Security section
- `copilot-code-review.md`: Authorization & Security check (critical)
- `copilot-pull-request.md`: Security changes example

### Exception Handling
- `copilot-instructions.md`: Exception Handling section
- `copilot-code-review.md`: Exception Handling check
- `copilot-pull-request.md`: Error handling in all PR types

### Testing
- `copilot-instructions.md`: Testing & Development Workflows section
- `copilot-code-review.md`: Testing Coverage section
- `copilot-pull-request.md`: Test Addition PR example

### Database & Persistence
- `copilot-instructions.md`: Persistence Layer section
- `copilot-code-review.md`: Data Access & Queries check
- `copilot-pull-request.md`: Database PR example

### Response Format
- `copilot-instructions.md`: Response Format section
- `copilot-code-review.md`: Response Format check
- All files emphasize consistency

---

## ✨ Key Features

### 1. **Comprehensive Coverage**
- All aspects of the codebase covered
- Real examples from actual code
- Multiple perspectives on same topic

### 2. **AI-Friendly**
- Clear, actionable guidance
- No ambiguity
- Critical rules highlighted
- Specific anti-patterns documented

### 3. **Workflow-Specific**
- Each file optimized for its use case
- Different formats for different tasks
- Focused content per instruction file

### 4. **Practical Examples**
- 40+ code examples
- Real PRs and commits
- Realistic test cases
- Actual error scenarios

### 5. **Security-Focused**
- Multi-tenancy guidance
- Authorization checks
- Soft-delete patterns
- Input validation

### 6. **Quality Metrics**
- Testing coverage guidance
- Code quality standards
- Performance considerations
- Maintenance notes

---

## 🚀 Getting Started

### Step 1: Understand Architecture
Start with: **copilot-instructions.md**
- Read "Project Overview" section
- Read "Architecture Patterns" section
- Skim "Workflow for AI Agents" section

### Step 2: Learn Code Patterns
Focus on: **copilot-instructions.md**
- Read "Persistence Layer" section (mapper pattern)
- Read "Common Patterns" section
- Check "Advanced Patterns" for complex scenarios

### Step 3: Implement Feature
Use: **copilot-instructions.md** "Workflow for AI Agents"
1. Read architecture first ✅
2. Check existing patterns ✅
3. Use Hygen templates ✅
4. Follow mapper pattern ✅
5. Add guards and roles ✅
6. Error handling ✅
7. Response format ✅
8. Add tests ✅
9. Validate ✅
10. Commit ✅

### Step 4: Review Code
Use: **copilot-code-review.md**
- Select code in editor
- Run Copilot review
- Check all 15 focus areas

### Step 5: Commit & PR
Use: **copilot-commit-message.md** + **copilot-pull-request.md**
- Generate commit message
- Create PR with AI-generated title & description

---

## 🔍 Quick Reference

### Architecture
- Domain → Repository → Service → Controller
- Mapper pattern for all ORM ↔ domain conversions
- Dependency injection via constructor

### Security
- **ALWAYS**: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)`
- **ALWAYS**: Filter by tenant/user in multi-tenant queries
- **NEVER**: Use plain `HttpException`, use `BusinessException`

### Responses
- Success: `ResponseUtil.successWithData(data)`
- List: `infinityPagination(list, { limit })`
- Error: `BusinessException.notFound(getMessage(MessagesEnum.*))`

### Testing
- Unit tests: Mock repos, test business logic
- E2E tests: Real database, test API contracts
- Both: Required for all features

### Conventions
- Commits: `feat(scope): subject` (Conventional Commits)
- Branches: `feature/xxx`, `fix/xxx`, `docs/xxx`
- PRs: Include description, testing steps, checklist

---

## ❓ FAQ

**Q: Which file should I read first?**
A: `copilot-instructions.md` - it's the main guide with all patterns.

**Q: How do I use these for code review?**
A: Select code in editor, open Copilot Chat, ask "Review this code". It uses `copilot-code-review.md`.

**Q: Can I customize these instructions?**
A: Yes, edit files and push to repository. They'll apply to all team members.

**Q: Are these for GitHub Copilot only?**
A: Primarily, but AI agents like Claude can use `copilot-instructions.md`.

**Q: How often should I update these?**
A: When new patterns emerge or architecture changes. Quarterly minimum.

**Q: What if something conflicts?**
A: `copilot-instructions.md` is the source of truth. Other files implement it.

---

## 📝 File Locations

```
.github/
├── copilot-instructions.md              (Main guide - 1,275 lines)
├── copilot-code-review.md               (Code review - 380 lines)
├── copilot-commit-message.md            (Commit messages - 340 lines)
└── copilot-pull-request.md              (PR titles/descriptions - 500 lines)
```

---

## 🎯 Success Criteria

✅ Files created and properly organized
✅ Each file focused on specific use case
✅ Real examples from codebase
✅ Comprehensive coverage of architecture
✅ Clear anti-patterns and red flags
✅ Practical workflows for AI agents
✅ Security and best practices emphasized
✅ Easy to maintain and update

---

**Last Updated**: November 20, 2025
**Status**: ✅ Complete and ready for use
**Total Content**: ~2,500 lines across 4 files
**Coverage**: All aspects of the TMC NoCode Survey backend

