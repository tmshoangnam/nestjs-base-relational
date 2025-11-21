# Commit Message Generation Instructions for TMC NoCode Survey Backend

## Purpose
Guide AI agents when generating commit messages following Conventional Commits format.

---

## Commit Message Format

All commits follow **Conventional Commits** (enforced by husky + commitlint).

### Basic Structure
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (Required)
Must be one of:

| Type | Usage | Example |
|------|-------|---------|
| `feat` | New feature | `feat(auth): add Google OAuth provider` |
| `fix` | Bug fix | `fix(users): correct soft-delete query` |
| `docs` | Documentation | `docs(README): update setup instructions` |
| `test` | Tests | `test(e2e): add login flow tests` |
| `refactor` | Code restructuring | `refactor(users): extract validation logic` |
| `perf` | Performance | `perf(auth): optimize token generation` |
| `chore` | Dependencies, build | `chore(deps): upgrade NestJS to 11.1` |
| `ci` | CI/CD changes | `ci: add GitHub Actions workflow` |
| `style` | Formatting (no logic) | `style: fix linting errors` |
| `revert` | Revert previous | `revert: revert "feat(auth): add OAuth"` |

### Scope (Recommended)
Domain or module affected:
- `auth` - Authentication module
- `users` - Users management
- `roles` - Role-based access control
- `database` - Database/migrations
- `mail` - Email sending
- `cache` - Redis/caching
- `config` - Configuration
- `api` - API endpoints
- `tests` - Test infrastructure

### Subject (Required)
**Rules**:
- ✅ Imperative mood ("add" not "adds" or "added")
- ✅ Lowercase first letter
- ✅ No period at end
- ✅ Max 50 characters
- ✅ Specific and descriptive

**Examples**:
- ✅ `feat(users): add email verification`
- ✅ `fix(auth): handle missing password gracefully`
- ✅ `docs(api): update authentication guide`
- ❌ `feat: Updates the user module` (too vague)
- ❌ `Fix users service.` (ends with period)
- ❌ `feat(users): ADDED new email feature` (wrong mood)

### Body (Optional but recommended for non-trivial)
**When to include**:
- Explains the "why" not the "what"
- Provides context for future developers
- Links related issues
- Migration notes for breaking changes

**Format**:
```
fix(auth): handle expired refresh token

Previously, expired refresh tokens caused a 500 error. Now they return
401 Unauthorized with appropriate message.

Fixes #123
```

### Footer (For breaking changes, closes issues)
**Breaking change**:
```
feat(users)!: remove deprecated email field

BREAKING CHANGE: The `email_old` field has been removed. Use `email` instead.
```

**Closes issues**:
```
fix(users): correct password validation

Closes #456
```

---

## Examples by Type

### Feature (feat)
```
feat(auth): add Google OAuth provider

- Integrate Google Auth library
- Add configuration options
- Create OAuth callback handler
- Update user model with socialId

Relates to #100
```

### Bug Fix (fix)
```
fix(users): correct soft-delete query filter

Previously, soft-deleted users were included in list responses.
Added deletedAt IS NULL filter to all user queries.
```

### Documentation (docs)
```
docs(api): document pagination parameters

Added examples for limit, page, and hasNextPage in API docs.
Includes client-side pagination logic.
```

### Test Addition (test)
```
test(e2e): add user creation and role assignment tests

- Test creating user with single role
- Test creating user with multiple roles
- Test default role assignment
- Test role validation errors
```

### Refactoring (refactor)
```
refactor(users): extract validation to separate service

Moved duplicate validation logic from UsersService to ValidatorService.
Improves code reuse and testability.
```

### Performance (perf)
```
perf(auth): cache roles for 1 hour

Added Redis caching for role lookups during login.
Reduces database queries by ~70%.
```

### Chore (chore)
```
chore(deps): upgrade NestJS from 11.0 to 11.1

- Update package.json
- Fix deprecation warnings
- Update authentication strategy
```

### CI Changes (ci)
```
ci: add GitHub Actions for PR validation

- Lint checks on PR
- Run unit tests
- Run E2E tests
- Fail if coverage below 80%
```

---

## Context-Aware Generation

### When user changes files:

**Single file change**:
```
fix(users): add email validation to create user

Added email format validation and duplicate check before creating user.
```

**Multiple related files in one module**:
```
feat(auth): implement password reset flow

- Add password reset endpoint
- Generate secure reset token
- Add email notification service
- Add password update validation
```

**Changes across multiple modules**:
```
refactor: move audit logic to shared service

- Extract AuditSubscriber logic to AuditService
- Update users module to use new service
- Update roles module to use new service
- Improves consistency and testability
```

**Migration + entity changes**:
```
feat(users): add user avatar support

- Add avatar URL field to user entity
- Create migration for avatar column
- Add avatar upload endpoint
- Update user mapper for avatar field
```

---

## AI Generation Guidelines

### 1. Analyze the Changes
- ✅ Read commit diff
- ✅ Identify primary type (feat, fix, test, etc.)
- ✅ Determine scope (which module)
- ✅ List key changes

### 2. Generate Subject
- ✅ Use imperative mood
- ✅ Be specific (not "update user", but "add email validation")
- ✅ Keep under 50 characters
- ✅ Lowercase first letter

### 3. Create Body (if needed)
- ✅ Explain WHY (not WHAT - that's in the code)
- ✅ List major changes as bullets
- ✅ Include issue numbers (#123)
- ✅ Note breaking changes

### 4. Add Footer
- ✅ Mark breaking changes with `!`
- ✅ Reference related issues
- ✅ Note migration instructions if needed

---

## Red Flags - Don't Generate These

### ❌ Too vague
- `feat: update stuff`
- `fix: bugs`
- `chore: changes`

### ❌ Wrong format
- `Updated the user service` (wrong mood)
- `feat(users): Added email feature.` (period)
- `FEAT(USERS): ADD EMAIL` (wrong case)

### ❌ Missing scope
- `feat: add validation` (which module?)
- `fix: correct query` (which query?)

### ❌ Incomplete for breaking changes
- `feat: remove email field` (needs BREAKING CHANGE footer)

### ❌ Wrong type
- `feat: fix typo` (should be `style` or `fix`)
- `test: add new validation` (should be `feat` with tests)

### ❌ Multiple unrelated changes
- `feat(users): add role filter, fix soft-delete, update cache`
- Split into separate commits instead

---

## Common Patterns

### Adding New Feature
```
feat(<module>): add <feature name>

- <what was added>
- <what was added>
- <what was added>
```

### Fixing a Bug
```
fix(<module>): <what was wrong>, now <what's correct>

Fixes #<issue_number>
```

### Writing Tests
```
test(<module>): add tests for <feature>

- Test case 1
- Test case 2
- Test case 3
```

### Refactoring
```
refactor(<module>): <before pattern> → <after pattern>

<benefits of refactoring>
```

### Database Changes
```
feat(database): add <new table/column>

- Created migration: <migration_name>
- Updated entity: <entity_name>
- Updated mapper: <mapper_name>
```

---

## Validation Checklist

Before generating commit message:

- [ ] Type is valid (feat, fix, test, etc.)
- [ ] Scope matches actual changed module
- [ ] Subject is specific and descriptive
- [ ] Subject uses imperative mood
- [ ] Subject is under 50 characters
- [ ] No period at end of subject
- [ ] Body explains WHY not WHAT
- [ ] Breaking changes marked with `!`
- [ ] Related issues referenced
- [ ] No multiple unrelated changes

---

## Examples to Follow

**Good commits from codebase**:
```
feat(auth): add email confirmation flow
fix(users): correct role filtering in multi-role queries
docs(readme): update development setup instructions
test(e2e): add user creation and authentication tests
refactor(services): extract validation logic to dedicated service
chore(deps): upgrade TypeORM to 0.3.27
```

---

## After Commit

- Follows husky pre-commit hook validation
- Follows commitlint rules
- Triggers release-it for version bumping
- Converted to CHANGELOG entry
- Used for semantic versioning (semver)

**If validation fails**:
```powershell
# husky/commitlint will reject message
# Fix and try again:
git commit --amend

# Check commitlint config:
cat commitlint.config.js
```

