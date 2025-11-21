# Pull Request Title and Description Generation Instructions

## Purpose
Guide AI agents when generating PR titles and descriptions for this NestJS backend project.

---

## PR Title Format

### Structure
```
<type>(<scope>): <subject>
```

Follows Conventional Commits pattern (same as commit messages).

### Examples

**Feature PR**:
```
feat(users): add multi-role support and role filtering
```

**Bug Fix PR**:
```
fix(auth): resolve token refresh on expired session
```

**Refactoring PR**:
```
refactor(persistence): extract mapper logic to base class
```

**Test Addition PR**:
```
test(e2e): comprehensive user CRUD and authentication tests
```

**Database PR**:
```
feat(database): add user avatar field and migration
```

### Rules
- ✅ Use Conventional Commits type
- ✅ Include scope (module affected)
- ✅ Imperative mood in subject
- ✅ Specific and descriptive
- ✅ Under 70 characters
- ✅ No period at end

---

## PR Description Structure

### Template
```markdown
## 🎯 Description
[What this PR does in 2-3 sentences]

## 🔧 Changes
- [Change 1]
- [Change 2]
- [Change 3]

## 🧪 Testing
- [How to test change 1]
- [How to test change 2]

## 📋 Checklist
- [ ] Code follows architecture patterns
- [ ] Tests added/updated
- [ ] Error handling with BusinessException
- [ ] Response format using ResponseUtil
- [ ] Mappers used for ORM conversions
- [ ] i18n error messages used
- [ ] Guards and roles properly set
- [ ] Documentation updated

## 🔗 Related Issues
Closes #123
```

---

## PR Description by Type

### Feature PR

```markdown
## 🎯 Description
Implements multi-role support for users. Users can now have multiple roles
simultaneously, enabling more flexible permission management for clients and
end-users.

## 🔧 Changes
- **Entity**: Modified `UserEntity` with `@ManyToMany` relationship to roles
- **Mapper**: Updated `UserMapper` to handle array of roles
- **Repository**: Added role ID filtering in `findManyWithPagination()`
- **Service**: Validated role IDs before assignment, added default role fallback
- **DTO**: Updated `CreateUserDto` and `UpdateUserDto` to accept `roleIds` array
- **Migration**: Created migration adding `user_roles` junction table
- **Tests**: Added unit tests for role assignment, E2E tests for role filtering

## 🧪 Testing
1. Create user with multiple role IDs: `POST /api/v1/users` with `roleIds: [1, 2, 3]`
2. Filter users by roles: `GET /api/v1/users?filters={"roleIds":[1,2]}`
3. Verify audit fields populated correctly
4. Test error when invalid role ID provided
5. Test default role assigned if none provided

## 🚀 Breaking Changes
None - backward compatible

## 📋 Checklist
- [x] Code follows mapper pattern for ORM conversions
- [x] Unit tests for service business logic
- [x] E2E tests for API endpoints
- [x] Error handling with BusinessException
- [x] i18n error messages in MessagesEnum
- [x] Response format uses ResponseUtil and infinityPagination
- [x] Guards and roles properly set on endpoints
- [x] Documentation updated with examples

## 🔗 Related Issues
Closes #156
```

### Bug Fix PR

```markdown
## 🎯 Description
Fixes query builder not excluding soft-deleted users in role filter queries.
Previously, users marked as deleted were still included in filtered results,
causing data inconsistency in role-based reports.

## 🔧 Changes
- **Repository**: Added `deletedAt: IsNull()` filter to all user queries
- **Query**: Fixed multi-role filtering to include soft-delete check
- **Migration**: None required (fixes existing logic)
- **Tests**: Added test for soft-deleted users not appearing in results

## 🧪 Testing
1. Create and delete user with role assignment
2. Filter users by role: `GET /api/v1/users?filters={"roleIds":[1]}`
3. Verify deleted user not included in results
4. Check audit trail for correct createdBy/updatedBy

## 🔍 Root Cause
Missing `where.deletedAt = IsNull()` in `findManyWithPagination()` method.

## 📋 Checklist
- [x] Follows soft-delete pattern
- [x] Unit tests verify fix
- [x] E2E tests verify fix
- [x] No other queries affected
- [x] Pagination still works correctly
- [x] Role filtering still works correctly

## 🔗 Related Issues
Fixes #145
```

### Refactoring PR

```markdown
## 🎯 Description
Extracts repetitive mapper logic into base mapper class, reducing code
duplication and improving maintainability. All entity mappers now extend
`BaseMapper` for consistent domain ↔ ORM conversions.

## 🔧 Changes
- **New**: Created `src/common/persistence/base.mapper.ts` with base logic
- **Users**: Updated `UserMapper` to extend `BaseMapper`, removed duplicate code
- **Roles**: Updated `RoleMapper` to extend `BaseMapper`, removed duplicate code
- **Sessions**: Updated `SessionMapper` to extend `BaseMapper`, removed duplicate code
- **Tests**: Added tests for base mapper, verified entity mappers still work

## 📊 Impact
- **Before**: ~500 lines of mapper code (with duplication)
- **After**: ~200 lines (extracted to base class)
- **Duplicated patterns**: `toDomain()`, `toPersistence()` methods
- **Lines saved**: ~300 lines (60% reduction)

## 🧪 Testing
1. Create user, verify `UserMapper.toDomain()` works
2. Update user, verify `UserMapper.toPersistence()` works
3. Create role, verify `RoleMapper` works
4. Run full unit test suite
5. Run E2E tests for all modules

## 🧵 Backward Compatibility
Fully backward compatible - mapper interface unchanged

## 📋 Checklist
- [x] All entity mappers updated
- [x] Unit tests for new base mapper
- [x] All existing tests still pass
- [x] No behavior changes
- [x] Code complexity reduced
- [x] Documentation updated

## 🔗 Related Issues
Related to #87 (technical debt)
```

### Test Addition PR

```markdown
## 🎯 Description
Adds comprehensive E2E tests for user CRUD operations and role management.
Tests cover happy path, error cases, pagination, filtering, and authorization.

## 🔧 Changes
- **Tests**: Added `test/admin/users.e2e-spec.ts` with 15 test cases
  - User creation with role validation
  - User listing with pagination and filtering
  - Role-based access control
  - Soft-delete verification
  - Error handling (404, 401, 403, 422)

## 📊 Coverage
- **Before**: 45% coverage on users module
- **After**: 87% coverage on users module
- **New tests**: 15 E2E scenarios
- **API endpoints covered**: 6/6 (100%)

## 🧪 Running Tests
```powershell
# Run newly added E2E tests
npm run test:e2e -- --testPathPattern=users

# Run full E2E suite
npm run test:e2e

# Run with Docker (recommended)
npm run test:e2e:relational:docker
```

## 📋 Checklist
- [x] All tests pass
- [x] Coverage threshold met (80%+)
- [x] Error paths tested
- [x] Authorization tested
- [x] Pagination tested
- [x] Test data properly cleaned up
- [x] No hardcoded values

## 🔗 Related Issues
Closes #92 (testing epic)
```

### Database Migration PR

```markdown
## 🎯 Description
Adds user avatar support by introducing new column and endpoints. Allows
users to upload profile pictures stored in AWS S3.

## 🔧 Changes
- **Entity**: Added `avatarUrl` field to `UserEntity`
- **Migration**: Created migration `AddUserAvatarField` adding nullable avatarUrl
- **DTO**: Updated `CreateUserDto` and `UpdateUserDto` with avatar field
- **Service**: Added avatar URL validation and S3 upload handling
- **Mapper**: Updated to handle avatarUrl field
- **Tests**: Added tests for avatar upload and retrieval

## 📋 Migration Instructions
```powershell
# Run migration
npm run migration:run

# If rollback needed
npm run migration:revert

# Inside Docker
docker compose exec survey-nocode-be npm run migration:run
```

## 🔍 Migration Details
- **Table**: `user`
- **Column**: `avatar_url` (VARCHAR, NULL)
- **Default value**: NULL
- **Migration name**: `1700000000000-AddUserAvatarField`
- **Rollback**: Removes column safely

## 🧪 Testing
1. Run migrations: `npm run migration:run`
2. Verify column added: Check database
3. Update user without avatar: Should work
4. Upload avatar: `POST /api/v1/users/:id/avatar`
5. Verify avatar URL stored
6. Rollback and verify: `npm run migration:revert`

## ⚠️ Breaking Changes
None - column is nullable, existing code unaffected

## 📋 Checklist
- [x] Migration generated via `npm run migration:generate`
- [x] Entity updated with new field
- [x] Mapper updated for new field
- [x] DTOs updated with validation
- [x] Tests for migration (up and down)
- [x] E2E tests for avatar endpoints
- [x] Rollback tested
- [x] Documentation updated

## 🔗 Related Issues
Closes #167
```

---

## PR Description Guidelines

### ✅ Good Practices

1. **Clear & Concise**
   - Explain what and why, not how
   - 2-3 sentences for description
   - Use bullet points for changes

2. **Specific Examples**
   - Include endpoint examples: `POST /api/v1/users`
   - Include query examples: `?filters={"roleIds":[1,2]}`
   - Show expected results

3. **Testing Instructions**
   - Step-by-step reproduction
   - Include exact API calls
   - Show expected vs actual results

4. **Checklist**
   - Architecture patterns followed
   - Tests added
   - Error handling correct
   - Response format consistent
   - Authorization checked
   - Documentation updated

5. **Context**
   - Link related issues
   - Explain business impact
   - Note breaking changes
   - Include migration instructions

### ❌ Avoid

- ❌ Generic descriptions ("Updated stuff")
- ❌ No testing instructions
- ❌ No related issues linked
- ❌ Incomplete checklist
- ❌ No migration notes for DB changes
- ❌ Vague bullet points

---

## Analysis Steps

### 1. Identify PR Type
- Check changed files
- Determine primary type (feat, fix, refactor, test)
- Identify scope (module affected)

### 2. Extract Changes
- List all modified files
- Summarize changes per file
- Note any migrations
- Identify new tests

### 3. Generate Title
- Use type + scope
- Be specific and descriptive
- Keep under 70 characters

### 4. Write Description
- Explain purpose (first paragraph)
- List key changes (bullets)
- Add testing instructions
- Include checklist items
- Link related issues

### 5. Validate
- Title follows Conventional Commits
- Description clear and complete
- Testing steps are reproducible
- All checklist items addressed
- No sensitive information

---

## Context from Code Analysis

When generating PR, consider:

### File Patterns
```
src/<domain>/
  ├── *.module.ts        → Module changes
  ├── *.service.ts       → Business logic changes
  ├── *.controller.ts    → API endpoint changes
  ├── domain/            → Domain model changes
  ├── dto/               → Request/response changes
  └── infrastructure/    → Database/persistence changes
```

### Common PR Combinations

**Feature with full stack**:
- Entity file changed → Database migration
- Mapper file changed → ORM conversion updated
- Service file changed → Business logic added
- Controller file changed → New endpoint
- DTO files changed → Request/response updated
- Spec file changed → Tests added

**Bug fix**:
- Service file changed → Logic fixed
- Repository file changed → Query fixed
- Spec file added → Regression test added

**Refactoring**:
- Multiple files in same module
- Same logic, different structure
- Tests unchanged or improved

---

## PR Template for Repository

Add to `.github/pull_request_template.md`:

```markdown
## 🎯 Description
<!-- What does this PR do? -->

## 🔧 Changes
<!-- List the changes -->
- 

## 🧪 Testing
<!-- How to test this PR? -->
1. 
2. 

## 📋 Checklist
- [ ] Code follows architecture patterns
- [ ] Tests added/updated
- [ ] Error handling with BusinessException
- [ ] Response format using ResponseUtil
- [ ] Mappers used for ORM conversions
- [ ] i18n error messages used
- [ ] Guards and roles properly set
- [ ] Documentation updated

## 🔗 Related Issues
Closes #
```

---

## Release Notes from PR

When PR merged, this can be auto-generated for CHANGELOG:

```markdown
### Features
- feat(users): add multi-role support and role filtering (#156)
- feat(database): add user avatar field and migration (#167)

### Bug Fixes
- fix(auth): resolve token refresh on expired session (#145)

### Refactoring
- refactor(persistence): extract mapper logic to base class (#87)

### Testing
- test(e2e): comprehensive user CRUD and authentication tests (#92)
```

