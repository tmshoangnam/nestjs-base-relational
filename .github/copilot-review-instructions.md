# Code Review Instructions for TMC NoCode Survey Backend

## Purpose
Guide AI agents when reviewing code changes, pull requests, and code quality issues.

---

## Review Focus Areas

### 1. Architecture & Design Patterns
**Check for**:
- ✅ Domain model → Repository → Service → Controller flow
- ✅ Mapper pattern used for all ORM ↔ domain conversions
- ✅ Module structure follows `src/<domain>/` layout
- ✅ Dependencies injected via constructor

**Red flags**:
- ❌ ORM entities exposed directly (use `UserMapper.toDomain()`)
- ❌ Business logic in controllers
- ❌ Repository calls outside of service layer
- ❌ Circular dependencies between modules

### 2. Exception Handling
**Must have**:
- ✅ Use `BusinessException` static methods (`.badRequest()`, `.notFound()`, `.conflict()`, etc.)
- ✅ Error messages from `MessagesEnum` + `getMessage()`
- ✅ No plain string error messages
- ✅ No raw `HttpException` throws

**Correct pattern**:
```typescript
throw BusinessException.conflict(
  getMessage(MessagesEnum.EMAIL_EXISTS)
);
```

**Wrong pattern**:
```typescript
throw new BadRequestException('Email already exists');
```

### 3. Response Format
**Verify**:
- ✅ Success responses use `ResponseUtil.successWithData()`
- ✅ Pagination uses `infinityPagination()` utility
- ✅ No custom response structures
- ✅ Consistent `{ statusCode, message, data }` format

**For lists**:
```typescript
// ✅ Correct
return infinityPagination(users, { limit: 10 });
// Output: { data: [...], hasNextPage: boolean }

// ❌ Wrong
return { users, page, total };
```

### 4. Authorization & Security
**Check**:
- ✅ Controllers use BOTH guards: `@UseGuards(JwtAuthGuard, RolesGuard)`
- ✅ Role specified: `@Roles(RoleEnum.admin)` or appropriate role
- ✅ `@ApiBearerAuth()` decorator on protected endpoints
- ✅ No hardcoded security decisions

**Correct pattern**:
```typescript
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.admin)
@Get()
async findAll() { }
```

**Critical rule**: Using ONLY `JwtAuthGuard` without `RolesGuard` skips role validation = **SECURITY ISSUE**

### 5. Data Access & Queries
**Verify**:
- ✅ Complex queries use QueryBuilder for performance
- ✅ Multi-relation filtering properly maps relation objects
- ✅ Soft-delete filter included (`deletedAt IS NULL`)
- ✅ Pagination capped at 50 items per request

**Example red flag**:
```typescript
// ❌ Missing soft-delete filter
const users = await this.usersRepository.find({ where: { active: true } });

// ✅ Correct
const users = await this.usersRepository.find({
  where: { active: true, deletedAt: IsNull() }
});
```

### 6. Mapping Pattern
**Required for all repositories**:
- ✅ `entity.create()` returns `UserMapper.toDomain(newEntity)`
- ✅ `entity.findOne()` returns `UserMapper.toDomain(entity)`
- ✅ `service.create()` receives domain model, not DTO
- ✅ ORM entity never exposed outside repository

**Check mapper file exists**:
- Location: `src/<domain>/infrastructure/persistence/relational/mappers/<entity>.mapper.ts`
- Has `toDomain()` method
- Has `toPersistence()` method

### 7. Configuration & Secrets
**Review**:
- ✅ Use `ConfigService.getOrThrow()` for required values
- ✅ No `process.env` direct access in services
- ✅ No hardcoded secrets or API keys
- ✅ All env vars validated via class-validator

**Correct**:
```typescript
const port = this.configService.getOrThrow('app.port', { infer: true });
```

**Wrong**:
```typescript
const port = process.env.PORT;
```

### 8. Error Messages & i18n
**Check**:
- ✅ Error message has entry in `MessagesEnum`
- ✅ Referenced via `getMessage(MessagesEnum.XXX)`
- ✅ Parameters passed as object: `getMessage(MessagesEnum.LOGIN_VIA_PROVIDER, { provider: 'google' })`
- ✅ i18n files exist in `src/i18n/en/` and `src/i18n/ja/`

**Never**:
- ❌ Hardcoded strings: `"User not found"`
- ❌ Template literals in messages
- ❌ Business logic in message generation

### 9. Dependency Injection
**Module structure**:
- ✅ Providers ordered: `[Repository, Service]`
- ✅ Exports: `exports: [Service, RepositoryInterface]`
- ✅ Imports relational module: `imports: [RelationalPersistenceModule]`
- ✅ Constructor parameters marked `readonly`

```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly rolesService: RolesService,
  ) {}
}
```

### 10. Testing Coverage
**Minimum requirements**:
- ✅ Service layer: Unit tests with mocked repositories
- ✅ Public endpoints: E2E tests with real database
- ✅ Error paths: Separate test for each error case
- ✅ Business rules: Test validation logic

**Red flags**:
- ❌ No tests
- ❌ Only happy path tests
- ❌ Testing ExceptionsFilter (not needed)
- ❌ E2E tests without authentication

### 11. Code Quality
**Check**:
- ✅ No `any` types (explicitly typed)
- ✅ No floating promises (add `await`)
- ✅ No `console.log()` (use logger)
- ✅ Proper error logging with context

**Logger usage**:
```typescript
private readonly logger = new Logger(UsersService.name);
this.logger.log(`Creating user: ${JSON.stringify(createUserDto)}`);
this.logger.error(`Failed to create user`, error);
```

### 12. Pagination & Filtering
**Verify**:
- ✅ Limit capped at 50: `Math.min(query.limit ?? 10, 50)`
- ✅ Page defaults to 1: `query.page ?? 1`
- ✅ Filter DTO properly typed with decorators
- ✅ hasNextPage logic: `data.length === limit`

**Example**:
```typescript
@Get()
async findAll(@Query() query: QueryUserDto) {
  const page = query?.page ?? 1;
  const limit = Math.min(query?.limit ?? 10, 50);
  
  const users = await this.usersService.findManyWithPagination({
    filterOptions: query.filters,
    sortOptions: query.sort,
    paginationOptions: { page, limit },
  });
  
  return infinityPagination(users, { limit });
}
```

### 13. Database Operations
**Check migrations**:
- ✅ Migration generated with descriptive name
- ✅ Migration file in `src/database/migrations/`
- ✅ Use TypeORM query builder for complex changes
- ✅ No `synchronize: true` in production config

**For entity changes**:
```powershell
# Generate migration (auto-generates based on entity changes)
npm run migration:generate -- src/database/migrations/AddUserAvatarField

# Then commit the migration
```

### 14. Soft Delete Pattern
**Every query should include**:
```typescript
where: { deletedAt: IsNull() }
```

**Never**:
```typescript
// ❌ Wrong - exposes deleted records
await this.usersRepository.find({ where: { status: 'active' } });

// ✅ Correct
await this.usersRepository.find({
  where: { status: 'active', deletedAt: IsNull() }
});
```

**For deleting**:
```typescript
// ❌ Wrong
await this.usersRepository.delete(userId);

// ✅ Correct (soft delete)
const user = await this.usersRepository.findById(userId);
user.deletedAt = new Date();
await this.usersRepository.update(userId, user);
```

### 15. Multi-Role Support
**Check**:
- ✅ User roles loaded via eager loading: `@ManyToMany(() => RoleEntity, { eager: true })`
- ✅ Role filter properly maps IDs: `where.roles = roleIds.map(id => ({ id }))`
- ✅ Roles array handled in mapper
- ✅ Default role assigned if none provided

---

## Review Checklist

Before approving code, verify:

- [ ] No ORM entities exposed outside repository layer
- [ ] All exceptions use `BusinessException`
- [ ] Error messages from `MessagesEnum`
- [ ] Responses use `ResponseUtil` or `infinityPagination`
- [ ] Protected endpoints have `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)`
- [ ] Service constructor has all dependencies injected
- [ ] Mappers used for all domain/ORM conversions
- [ ] ConfigService used instead of `process.env`
- [ ] Soft-delete filter in queries
- [ ] Pagination limit capped at 50
- [ ] Tests include error cases and E2E flows
- [ ] No hardcoded secrets or API keys
- [ ] Logger used instead of `console.log`
- [ ] Code follows TypeScript strict mode
- [ ] Migration files committed if schema changed

---

## Common Issues to Flag

### 🔴 Critical
- ORM entity returned directly to controller
- Missing RolesGuard on protected endpoint
- Hard-coded error messages
- No soft-delete filter in queries
- Direct `process.env` usage in services
- Circular dependencies between modules

### 🟡 Important
- Business logic in controllers
- Missing tests for error cases
- Response format inconsistency
- Hardcoded configuration values
- Missing i18n entries
- Incomplete mapper implementation

### 🟢 Minor
- Unused imports
- Inconsistent naming conventions
- Missing JSDoc comments
- Console logs left in code
- Type `any` instead of explicit type

---

## Helpful References

**Key files to check**:
- Pattern examples: `src/users/users.service.ts`, `src/users/users.controller.ts`
- Exception handling: `src/common/exception/business.exception.ts`
- Mappers: `src/users/infrastructure/persistence/relational/mappers/user.mapper.ts`
- Response utilities: `src/utils/ResponseUtil.ts`
- Guards: `src/auth/strategies/jwt.guard.ts`, `src/roles/roles.guard.ts`

**Commands for validation**:
```powershell
npm run lint          # Check code style
npm run test          # Run unit tests
npm run test:e2e      # Run E2E tests
npm run migration:generate -- src/database/migrations/Name
```

