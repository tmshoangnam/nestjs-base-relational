# AI Coding Agent Instructions for TMC NoCode Survey Backend

## Project Overview
**NestJS 11 backend service** for a no-code survey/diagnostic platform. Three user tiers: Admin (TMC), Clients (TMC customers), End Users. Integrates with TenpinAPI for personality diagnostics. Uses PostgreSQL + Redis + TypeORM.

---

## Architecture Patterns

### Modular Domain Structure
Each domain (users, auth, roles, etc.) follows consistent structure:
```
src/<domain>/
├── <domain>.module.ts         # NestJS module - imports/exports
├── <domain>.controller.ts     # HTTP endpoints
├── <domain>.service.ts        # Business logic
├── domain/                    # Domain models (DTOs, business objects)
│   └── <entity>.ts           # Pure business entity (no ORM decorators)
├── dto/                       # Data Transfer Objects (create, update, query)
└── infrastructure/
    └── persistence/
        └── relational/
            ├── entities/      # TypeORM @Entity classes
            ├── repositories/  # Repository pattern (implements abstract repo)
            └── mappers/       # Convert domain ↔ persistence
```

**Key principle**: Domain model (`domain/user.ts`) is framework-agnostic. Mappers handle ORM ↔ domain conversion. Repository interface in `infrastructure/` is the abstraction.

### Base Entity Pattern
All entities inherit `BaseRelational` (`src/common/base-relational.ts`):
- `id`, `createdAt`, `updatedAt`, `deletedAt`, `createdBy`, `updatedBy`
- Always use this base class for new entities

### Module Imports
Core config modules defined in `src/config/core/app.module.config.ts`:
- ConfigModule (environment + validation)
- TypeOrmModule + DataSource factory
- ClsModule (request context storage - use `ClsService` for request-scoped state)
- I18nModule (i18n/en/, i18n/ja/ - use for error messages)

---

## Authorization & Security

### Role-Based Access Control (RBAC)
Three components working together:

1. **JwtAuthGuard** (`src/auth/strategies/jwt.guard.ts`)
   - Validates JWT token using Passport
   - **Always** pair with RolesGuard: `@UseGuards(JwtAuthGuard, RolesGuard)`
   - Populates `request.user` with decoded token payload (includes `roles` array)
   - Stores user ID in ClsService for audit/logging

2. **RolesGuard** (`src/roles/roles.guard.ts`)
   - Checks `@Roles(RoleEnum.admin, RoleEnum.client)` decorator
   - Matches user's roles against required roles
   - Example: `src/users/users.controller.ts:42-43`

3. **Permission-based decorator** (`src/access-control/decorators/permission.decorator.ts`)
   - Granular permission checks (less common, reserved for fine-grained control)
   - Use `@Permission('permission.name')` with PermissionGuard

**Pattern in controllers**:
```typescript
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.admin)
@ApiTags('Users')
@Controller('users')
export class UsersController { ... }
```

### Multi-Role Support
Users can have multiple roles (eager-loaded via `@ManyToMany`). Always filter by checking array membership.

---

## Exception Handling

### BusinessException Pattern
Never throw raw HttpException. Use `BusinessException` (`src/common/exception/business.exception.ts`):

```typescript
// ❌ Don't do this
throw new BadRequestException('User exists');

// ✅ Use BusinessException static methods
throw BusinessException.conflict(getMessage(MessagesEnum.EMAIL_EXISTS));
throw BusinessException.notFound(getMessage(MessagesEnum.USER_NOT_FOUND));
throw BusinessException.badRequest(getMessage(MessagesEnum.INCORRECT_PASSWORD));
```

**Available methods**: `badRequest()`, `unauthorized()`, `forbidden()`, `notFound()`, `conflict()`, `unprocessable()`, `internal()`, `businessRule()`, `external()`

**With optional details** (for client debugging):
```typescript
throw BusinessException.unprocessable(
  getMessage(MessagesEnum.VALIDATION_FAILED),
  'ValidationError',
  { fields: { email: 'Invalid format', password: 'Too short' } }
);
```

### Error Messages via I18n
Store error keys in `MessagesEnum` (`src/common/exception/messages.enum.ts`). Use `getMessage()` helper to resolve from i18n files:
```typescript
getMessage(MessagesEnum.USER_NOT_FOUND)  // Resolves from i18n/en/errors.notFound.json
getMessage(MessagesEnum.LOGIN_VIA_PROVIDER, { provider: 'google' })  // With params
```

**Message file structure** (`src/i18n/en/errors/notFound.json`):
```json
{
  "errors": {
    "notFound": "Resource not found",
    "userNotFound": "User does not exist",
    "emailNotExists": "Email is not registered",
    "loginViaProvider": "Please login via {{provider}}"
  }
}
```

### Exception Filter Response
All exceptions caught by global `ExceptionsFilter` (`src/common/exception/exception.filter.ts`) → consistent JSON response:

```typescript
// Input: throw BusinessException.notFound("User not found")
// Output:
{
  "statusCode": 404,
  "message": "User not found",
  "reason": "NotFound",
  "details": null
}

// Input: throw BusinessException.unprocessable("Validation error", "ValidationError", { fields: {...} })
// Output:
{
  "statusCode": 422,
  "message": "Validation error",
  "reason": "ValidationError",
  "details": { "fields": {...} }
}
```

**Filter catches**:
- `BusinessException` → use `statusCode`, `message`, `reason`, `details`
- `HttpException` → extract status + message
- Generic `Error` → convert to 500 internal error
- Unknown exceptions → 500 with generic message

---

## Response Format

### Standard Response Wrapper
Use `ResponseUtil` (`src/utils/ResponseUtil.ts`) for all success responses:

```typescript
// Simple success
return ResponseUtil.success();  // { statusCode: 200, message: 'Success', data: null }

// Success with data
return ResponseUtil.successWithData(user);  // { statusCode: 200, message: 'Success', data: {...} }

// Custom status
return ResponseUtil.customWithData(202, 'Accepted', data);
```

**Response format** (`src/utils/dto/ResponseData.ts`):
```typescript
{
  statusCode: number;      // HTTP status code
  message: string;         // Human-readable message
  data: T | null;         // Payload (generic type)
}
```

### Pagination Response Format

For list endpoints, use `infinityPagination()` utility:

```typescript
// Service/Repository returns list
const users = await this.usersService.findManyWithPagination({
  filterOptions: query.filters,
  sortOptions: query.sort,
  paginationOptions: { page, limit: 10 },
});

// Apply pagination wrapper (cursor-based hasNextPage)
return infinityPagination(users, { limit: 10 });

// Output:
{
  data: [...],           // Actual items
  hasNextPage: boolean   // true if data.length === limit (more items exist)
}
```

**Controller pattern**:
```typescript
@Get()
async findAll(@Query() query: QueryUserDto): Promise<InfinityPaginationResponseDto<User>> {
  const page = query?.page ?? 1;
  const limit = Math.min(query?.limit ?? 10, 50);  // Cap at 50

  const users = await this.usersService.findManyWithPagination({
    filterOptions: query.filters,
    sortOptions: query.sort,
    paginationOptions: { page, limit },
  });

  return infinityPagination(users, { limit });
}
```

**Client logic**:
- If `hasNextPage === true`, client can fetch next page with `page + 1`
- If `hasNextPage === false`, client has reached end of results

---

## Persistence Layer

### Repository Pattern
Each entity has:
1. **Abstract interface** in `infrastructure/persistence/` (defines contract)
2. **Relational implementation** (`relational-persistence.module.ts` exports the provider)
3. **Mapper** converting domain ↔ ORM entity

Example flow (`src/users/`):
- Controller calls `UsersService`
- Service calls `UserRepository` (injected)
- Repository calls TypeORM `UsersRepository` + `UserMapper`
- Mapper converts `UserEntity` ↔ `User` domain model

**When adding a repository method**:
1. Add to abstract interface (`src/users/infrastructure/persistence/user.repository.ts`)
2. Implement in `UsersRelationalRepository` (`src/users/infrastructure/persistence/relational/repositories/user.repository.ts`)
3. Use TypeORM QueryBuilder or `find()` options for complex queries

### Mapper Pattern (Domain ↔ Persistence Layer)
Mappers are **critical** for clean architecture. Always use them for conversions:

```typescript
// src/users/infrastructure/persistence/relational/mappers/user.mapper.ts
export class UserMapper {
  // Convert ORM entity → domain model (for responses)
  static toDomain(raw: UserEntity): User {
    const user = new User();
    user.id = raw.id;
    user.email = raw.email;
    // Handle multi-role mapping
    user.roles = raw.roles?.map(roleEntity => ({
      id: roleEntity.id,
      name: roleEntity.name,
    })) || [];
    return user;
  }

  // Convert domain model → ORM entity (for persistence)
  static toPersistence(domain: User): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.email = domain.email;
    // Map roles back to RoleEntity instances for TypeORM
    entity.roles = domain.roles?.map(r => {
      const roleEntity = new RoleEntity();
      roleEntity.id = Number(r.id);
      return roleEntity;
    }) || [];
    return entity;
  }
}
```

**When to use mappers**:
- Every repository method returns domain model via `UserMapper.toDomain(entity)`
- Every create/update operation converts via `UserMapper.toPersistence(domain)` before saving
- Never expose ORM entities directly to controllers (breaks abstraction)

### Complex Queries with Multi-Relations

For queries involving multiple relations (e.g., users with roles + permissions):

```typescript
// In UsersRelationalRepository
async findManyWithPagination({
  filterOptions,
  sortOptions,
  paginationOptions,
}: {
  filterOptions?: FilterUserDto | null;
  sortOptions?: SortUserDto[] | null;
  paginationOptions: IPaginationOptions;
}): Promise<User[]> {
  const where: FindOptionsWhere<UserEntity> = {};
  
  // Multi-role filter example from UserEntity @ManyToMany
  if (filterOptions?.roleIds?.length) {
    where.roles = filterOptions.roleIds.map((roleId) => ({
      id: Number(roleId),
    }));
  }

  const entities = await this.usersRepository.find({
    skip: (paginationOptions.page - 1) * paginationOptions.limit,
    take: paginationOptions.limit,
    where: where,
    // Always eager load related data needed in response
    relations: ['roles'],
    order: sortOptions?.reduce(
      (accumulator, sort) => ({
        ...accumulator,
        [sort.orderBy]: sort.order,
      }),
      {},
    ),
  });

  return entities.map((entity) => UserMapper.toDomain(entity));
}
```

**For advanced QueryBuilder scenarios** (aggregations, subqueries):
```typescript
async findUsersWithRoleCount(): Promise<User[]> {
  const entities = await this.usersRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.roles', 'role')
    .addSelect('COUNT(role.id)', 'roleCount')
    .groupBy('user.id')
    .where('user.deletedAt IS NULL') // Always exclude soft-deleted
    .getMany();
  
  return entities.map((e) => UserMapper.toDomain(e));
}
```

### Key TypeORM Config
- Entities auto-discovered: `__dirname + '/../**/*.entity{.ts,.js}'`
- Migrations: `__dirname + '/migrations/**/*{.ts,.js}'`
- **Always soft-delete**: Set `deletedAt` not physical delete (BaseRelational has `@DeleteDateColumn()`)
- Relations: Use `eager: true` for frequently-loaded relations (e.g., User.roles) or explicit `relations: ['roles']` in find options

---

## Testing & Development Workflows

### Unit Testing Pattern

Tests should focus on service layer business logic:

```typescript
// src/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { RolesService } from '../roles/roles.service';
import { BusinessException } from '../common/exception/business.exception';
import { MessagesEnum } from '../common/exception/messages.enum';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: jest.Mocked<UserRepository>;
  let mockRolesService: jest.Mocked<RolesService>;

  beforeEach(async () => {
    mockRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    } as any;

    mockRolesService = {
      findByName: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: mockRepository },
        { provide: RolesService, useValue: mockRolesService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should throw conflict exception if email already exists', async () => {
    const createUserDto = { email: 'test@example.com', firstName: 'John' };
    mockRepository.findByEmail.mockResolvedValue({ id: 1 } as any);

    await expect(service.create(createUserDto)).rejects.toThrow(
      BusinessException,
    );
    expect(mockRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
  });

  it('should hash password before creating user', async () => {
    const createUserDto = { 
      email: 'new@example.com', 
      password: 'plaintext',
      firstName: 'Jane'
    };
    
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue({ id: 1 } as any);
    mockRolesService.findByName.mockResolvedValue({ id: 1 } as any);

    const result = await service.create(createUserDto);

    // Verify password was hashed (not plain text)
    expect(mockRepository.create).toHaveBeenCalled();
    const createCall = mockRepository.create.mock.calls[0][0];
    expect(createCall.password).not.toBe('plaintext');
  });
});
```

**Testing guidelines**:
- Mock repositories, not database queries
- Test business rules: validation, defaults, cross-service calls
- Throw `BusinessException` as-is (don't test ExceptionsFilter)
- Use `jest.fn()` for mocking service dependencies
- Test error paths separately from success paths

### E2E Testing Pattern

E2E tests validate complete API flows including authentication:

```typescript
// test/admin/users.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

describe('Users E2E', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 1. Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/email/login')
      .send({ email: 'admin@example.com', password: 'password' });

    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users should return users with pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/users?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('statusCode', 200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('hasNextPage');
  });

  it('POST /users should create user if authorized', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        email: 'newuser@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roleIds: [1],
      })
      .expect(201);

    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.email).toBe('newuser@example.com');
  });

  it('POST /users should fail without authorization', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/users')
      .send({
        email: 'another@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
      })
      .expect(401);

    expect(response.body).toHaveProperty('statusCode', 401);
    expect(response.body).toHaveProperty('reason', 'Unauthorized');
  });

  it('POST /users should validate role IDs', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        roleIds: [999],  // Non-existent role
      })
      .expect(400);

    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('reason');
  });
});
```

**E2E test guidelines**:
- Use real database (or Docker container) - test actual flow
- Authenticate once per suite, reuse token
- Test error responses (401, 403, 404, 422)
- Verify response structure matches ResponseUtil format
- Test pagination, filtering with real data
- Run with: `npm run test:e2e:relational:docker`

### Database Migrations
```powershell
# Generate migration from entity changes
npm run migration:generate -- src/database/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Inside Docker
docker compose -f docker-compose.dev.yaml exec survey-nocode-be npm run migration:run
```

### Seeding
```powershell
npm run seed:run:relational  # Runs RoleSeedService, then UserSeedService (see run-seed.ts)
```

### Testing
```powershell
npm run test                 # Unit tests (.spec.ts)
npm run test:watch          # Watch mode
npm run test:cov            # Coverage
npm run test:e2e            # E2E tests in test/ directory
npm run test:e2e:relational:docker  # Full Docker E2E (recommended for CI)
```

**Test setup**: Jest in `src/` finds `*.spec.ts`; e2e tests in `test/` use separate config (`test/jest-e2e.json`).

### Local Development (Docker)
```powershell
# Start all services (PostgreSQL, Redis, MailDev, API)
docker compose -f docker-compose.dev.yaml up -d

# Watch logs
docker compose -f docker-compose.dev.yaml logs -f survey-nocode-be

# Stop
docker compose -f docker-compose.dev.yaml down
```

**What's running**:
- Postgres (5432) + Redis (6379) + MailDev SMTP (1025) + API (3000)
- Hot reload via nodemon (CHOKIDAR_USEPOLLING)
- Volumes: `./` mounted to `/app`, node_modules in separate volume

---

## Key Configuration & Constants

### Environment Variables
See `env-example-relational` for template. Critical vars:
- `DATABASE_URL` or `DATABASE_HOST/PORT/NAME/USERNAME/PASSWORD`
- `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`
- `TENPIN_API_KEY` (external personality diagnostic service)
- `REDIS_URL` (cache/session storage)
- `AWS_*` (S3 for file uploads)
- `MAIL_*` (SMTP, sender email)

**Validation**: `src/config/app.config.ts` uses class-validator for ENV vars at startup.

### Role Enum
`src/roles/roles.enum.ts` defines: `admin`, `client`, `endUser` (or custom). Used in `@Roles()` decorator.

### Redis
Global Redis client injected via `REDIS_CACHE_CLIENT` token. Used by `AppCacheService` for:
- Session storage
- Cache-manager with TTL support
- Custom cache keys (see `src/common/cache/`)

---

## Multi-Tenancy & Role-Based Data Access

**Current Status**: This codebase has **role-based user tiers** (Admin, Client, EndUser) but NOT full multi-tenancy isolation. Future scaling may require:

### Potential Multi-Tenancy Implementation

If adding tenant isolation, follow this pattern:

```typescript
// Add to BaseRelational
export abstract class BaseRelational extends BaseEntity {
  // ... existing fields ...
  @Column({ type: 'bigint', nullable: true })
  tenantId?: number;  // Which customer/organization owns this record
}

// In JwtAuthGuard + ClsService
async canActivate(context: ExecutionContext) {
  const can = (await super.canActivate(context)) as boolean;
  const request = context.switchToHttp().getRequest();
  const user = request?.user;
  
  if (user) {
    this.cls.set('userId', user.id);
    this.cls.set('tenantId', user.tenantId);  // Store tenant context
  }
  
  return can;
}

// In repository queries
async findManyWithPagination(opts): Promise<User[]> {
  const tenantId = this.cls.get('tenantId');  // Read tenant from context
  const where: FindOptionsWhere<UserEntity> = {
    tenantId,  // ALWAYS filter by tenant!
    // ... other filters ...
  };
  
  const entities = await this.usersRepository.find({ where });
  return entities.map((e) => UserMapper.toDomain(e));
}
```

**Critical rule for multi-tenant**: Every query that loads user-owned data must filter by `tenantId` from ClsService. Missing this is a **security vulnerability**.

---

## Common Patterns

### Service Layer Structure
```typescript
@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,  // Injected repository
    private rolesService: RolesService,        // Domain service dependency
    private cache: AppCacheService,            // Cache
    private configService: ConfigService,      // Config
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    // Validate input (dto class-validator decorators)
    // Check business rules (throw BusinessException)
    // Call repository
    // Cache result if needed
    // Return domain model
  }
}
```

### Creating New Modules
Generate scaffolding:
```powershell
npm run generate:resource:relational  # Hygen template (creates full module structure)
npm run add:property:to-relational    # Hygen template (adds field to entity + dto)
```

These auto-generate entity, dto, repository, mapper, service, controller with best practices.

### Custom Filters & Pagination
Query DTOs (e.g., `QueryUserDto`) define filtering/sorting:
```typescript
// In repository.findManyWithPagination()
// Filter by: filterOptions.roleIds, etc.
// Sort by: sortOptions (column + ASC/DESC)
// Paginate: skip/take from paginationOptions
```

Use `infinityPagination()` utility for cursor-based pagination (hasNextPage check).

---

## Advanced Patterns & Complex Scenarios

### Multi-Relation Filtering and Sorting

When dealing with `@ManyToMany` relationships (like users having multiple roles), filtering requires careful type handling:

**DTO Definition** (`src/users/dto/query-user.dto.ts`):
```typescript
export class FilterUserDto {
  @IsArray()
  @IsNumber({}, { each: true })
  roleIds?: number[] | null;  // Filter users by role IDs
}

export class QueryUserDto {
  @Transform(({ value }) => value ? plainToInstance(FilterUserDto, JSON.parse(value)) : undefined)
  filters?: FilterUserDto | null;

  @Transform(({ value }) => value ? plainToInstance(SortUserDto, JSON.parse(value)) : undefined)
  sort?: SortUserDto[] | null;
}
```

**Query Parameter Format** (from client):
```
GET /api/v1/users?filters={"roleIds":[1,2]}&sort=[{"orderBy":"firstName","order":"ASC"}]&page=1&limit=10
```

**Repository Implementation** (handles `@ManyToMany` filter):
```typescript
async findManyWithPagination({
  filterOptions,
  sortOptions,
  paginationOptions,
}): Promise<User[]> {
  const where: FindOptionsWhere<UserEntity> = {};
  
  // Filter users by role IDs: map each roleId to a relation object
  if (filterOptions?.roleIds?.length) {
    where.roles = filterOptions.roleIds.map((roleId) => ({
      id: Number(roleId),
    }));
  }

  const entities = await this.usersRepository.find({
    skip: (paginationOptions.page - 1) * paginationOptions.limit,
    take: paginationOptions.limit,
    where,
    relations: ['roles'],  // Must load the relation for filtering to work
    order: sortOptions?.reduce((acc, sort) => ({
      ...acc,
      [sort.orderBy]: sort.order,  // e.g., { firstName: 'ASC', email: 'DESC' }
    }), {}),
  });

  return entities.map((e) => UserMapper.toDomain(e));
}
```

**Service Wrapper** (`src/users/users.service.ts`):
```typescript
findManyWithPagination({
  filterOptions,
  sortOptions,
  paginationOptions,
}): Promise<User[]> {
  // Service delegates directly to repository
  return this.usersRepository.findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  });
}
```

**Controller Usage**:
```typescript
@Get()
async findAll(
  @Query() query: QueryUserDto,
): Promise<InfinityPaginationResponseDto<User>> {
  const page = query?.page ?? 1;
  const limit = Math.min(query?.limit ?? 10, 50);  // Cap at 50

  const users = await this.usersService.findManyWithPagination({
    filterOptions: query.filters,
    sortOptions: query.sort,
    paginationOptions: { page, limit },
  });

  return infinityPagination(users, { limit });  // hasNextPage = data.length === limit
}
```

### Service Dependency Injection & Transaction Patterns

Services often coordinate multiple repositories and external services. Example from `UsersService`:

```typescript
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UserRepository,      // Injected repo
    private readonly rolesService: RolesService,           // Cross-domain service
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 1. Validate business rules (throw BusinessException if fails)
    if (createUserDto.email) {
      const existing = await this.usersRepository.findByEmail(createUserDto.email);
      if (existing) {
        throw BusinessException.conflict(
          getMessage(MessagesEnum.EMAIL_ALREADY_EXISTS)
        );
      }
    }

    // 2. Handle password hashing (external library)
    let password: string | undefined = undefined;
    if (createUserDto.password) {
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(createUserDto.password, salt);
    }

    // 3. Cross-service lookup (roles)
    let roles: Role[] = [];
    if (createUserDto.roleIds?.length) {
      roles = createUserDto.roleIds.map((id) => ({ id }));
    } else {
      // Default role fallback
      const defaultRole = await this.rolesService.findByName(RoleEnum.user);
      if (defaultRole) roles = [{ id: defaultRole.id }];
    }

    // 4. Validate enum (StatusEnum)
    if (createUserDto.status) {
      const isValid = Object.values(StatusEnum).includes(createUserDto.status);
      if (!isValid) {
        throw BusinessException.badRequest(
          getMessage(MessagesEnum.STATUS_NOT_EXISTS)
        );
      }
    }

    // 5. Persist to repository (returns domain model)
    return this.usersRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      password,
      roles,
      status: createUserDto.status || StatusEnum.active,
      provider: createUserDto.provider ?? AuthProvidersEnum.email,
    });
  }
}
```

**Key points**:
- Inject repository + cross-service dependencies via constructor
- Service **always** validates before persisting (business rules)
- Service returns domain models, never ORM entities
- Throw `BusinessException` for validation failures, never raw errors

### Request Context & Audit Trails

All entities have `createdBy` and `updatedBy` fields (from `BaseRelational`). These are populated automatically via `AuditSubscriber`:

```typescript
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(
    private readonly cls: ClsService,
    dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this);
  }

  beforeInsert(event: InsertEvent<any>) {
    const userId = this.cls.get('userId');  // Set by JwtAuthGuard
    if (userId && !event.entity.createdBy) {
      event.entity.createdBy = userId;
    }
  }

  beforeUpdate(event: UpdateEvent<any>) {
    const userId = this.cls.get('userId');
    if (userId && !event.entity.updatedBy) {
      event.entity.updatedBy = userId;
    }
  }
}
```

**Flow**:
1. `JwtAuthGuard` validates token → extracts `user.id`
2. Guard stores in `ClsService.set('userId', user.id)` (request-scoped)
3. On any entity insert/update, `AuditSubscriber` automatically reads `cls.get('userId')`
4. Result: all auditable fields are **automatically populated** without service code

**For custom request context** (e.g., tracking feature flags, tenant):
```typescript
// In a middleware or interceptor
const context = cls.get() || {};
this.cls.set('context', { ...context, featureFlag: 'beta' });

// Access anywhere later
const context = this.cls.get('context');
```

### Caching Strategy

`AppCacheService` wraps `cache-manager` + `redis`:

```typescript
@Injectable()
export class AppCacheService implements OnModuleDestroy {
  constructor(
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
    @Inject(REDIS_CACHE_CLIENT) private redisClient: any,
  ) {}

  // Generic get/set/delete
  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key as any);
  }

  async set<T>(key: string, value: T, ttl?: number) {
    await this.cacheManager.set(key as any, value as any, ttl);
  }

  async del(key: string) {
    await this.cacheManager.del(key as any);
  }
}
```

**Example usage in service**:
```typescript
@Injectable()
export class RolesService {
  constructor(
    private rolesRepository: RoleRepository,
    private cache: AppCacheService,
  ) {}

  async findByName(name: string): Promise<Role | null> {
    // Try cache first
    const cached = await this.cache.get<Role>(`role:${name}`);
    if (cached) return cached;

    // Cache miss: query DB
    const role = await this.rolesRepository.findByName(name);
    
    // Store in cache for 1 hour (3600000ms)
    if (role) {
      await this.cache.set(`role:${name}`, role, 3600000);
    }

    return role;
  }

  // Invalidate cache after update
  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    const updated = await this.rolesRepository.update(id, dto);
    await this.cache.del(`role:${updated.name}`);  // Invalidate
    return updated;
  }
}
```

**Cache key conventions**:
- `entity:id` (e.g., `role:1`, `user:123`)
- `entity:field:value` (e.g., `role:name:admin`, `user:email:john@example.com`)
- Invalidate on create/update/delete operations

### Token & Session Management

JWT handling in `AuthService`:

```typescript
async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
  // 1. Find user, validate password
  const user = await this.usersService.findByEmail(loginDto.email);
  if (!user) throw BusinessException.notFound(...);

  const isValid = await bcrypt.compare(loginDto.password, user.password);
  if (!isValid) throw BusinessException.badRequest(...);

  // 2. Create session record
  const hash = crypto.createHash('sha256').update(randomStringGenerator()).digest('hex');
  const session = await this.sessionService.create({ user, hash });

  // 3. Generate JWT + refresh token
  const { token, refreshToken, tokenExpires } = await this.getTokensData({
    id: user.id,
    role: user.roles?.[0] || null,
    sessionId: session.id,
    hash,
    roles: user.roles?.map((r) => r.name).filter(Boolean) || [],
  });

  return {
    refreshToken,
    token,
    tokenExpires,
    user,
  };
}

private async getTokensData(payload: any) {
  const tokenExpires = this.configService.getOrThrow('auth.expiresIn');
  
  const token = await this.jwtService.signAsync(payload, {
    secret: this.configService.getOrThrow('auth.secret'),
    expiresIn: tokenExpires,
  });

  const refreshToken = await this.jwtService.signAsync(payload, {
    secret: this.configService.getOrThrow('auth.refreshSecret'),
    expiresIn: this.configService.getOrThrow('auth.refreshExpires'),
  });

  return { token, refreshToken, tokenExpires };
}
```

**Flow**:
- Access token: short-lived (e.g., 15 min), stored in Authorization header
- Refresh token: long-lived (e.g., 7 days), stored in httpOnly cookie or secure storage
- Session record: server-side record linking token hash to user (optional, for revocation)

### Soft-Delete Pattern

All entities inherit `BaseRelational` with `@DeleteDateColumn()`. **Never physically delete**:

```typescript
// ❌ Wrong
await this.usersRepository.delete(userId);  // This doesn't work, soft-delete column has no value

// ✅ Correct
const user = await this.usersRepository.findById(userId);
if (user) {
  user.deletedAt = new Date();  // Mapper converts this to ORM entity
  await this.usersRepository.update(userId, user);
}
```

**Queries automatically exclude soft-deleted rows** via `deletedAt IS NULL` in `where` clause:
```typescript
// Repository's find() call must include soft-delete filter
const where: FindOptionsWhere<UserEntity> = {
  // ... other filters
  deletedAt: IsNull(),  // TypeORM helper
};

const users = await this.usersRepository.find({ where });
```

---

## Git & Commit Conventions

**Commit messages** follow Conventional Commits (enforced by husky + commitlint):
```
feat(auth): add Google OAuth provider
fix(users): correct soft-delete query
docs(README): update setup instructions
test(e2e): add login flow tests
chore(deps): upgrade NestJS to 11.1
```

Release uses `release-it` with conventional-changelog. **Branch convention**: `feature/xxx`, `fix/xxx`, `docs/xxx` from `develop`.

---

## Red Flags & Anti-Patterns

❌ **Don't**:
- Mix domain model (business logic) with ORM decorators
- Throw `HttpException` directly; use `BusinessException`
- Skip JwtAuthGuard or RolesGuard on protected routes
- Hard-code config values; always use ConfigService
- Forget to extend `BaseRelational` for new entities
- Use `synchronize: true` in production (migrations only)
- Ignore i18n keys; always use MessagesEnum + getMessage()
- Call repository directly in controller (violate single responsibility)

✅ **Do**:
- Map ORM entity → domain model → DTO response
- Use `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)` together
- Validate input with DTOs (class-validator decorators)
- Store error messages in i18n files
- Use RequestContext (ClsService) for audit trail
- Test business logic in service; e2e for API contracts
- Cache frequently-accessed data (roles, configs)

---

## Quick Reference

| Task | Command | File |
|------|---------|------|
| New module | `npm run generate:resource:relational` | N/A |
| Add field | `npm run add:property:to-relational` | N/A |
| Generate migration | `npm run migration:generate -- src/database/migrations/Name` | `src/database/` |
| Run migrations | `npm run migration:run` | `src/database/migrations/` |
| Seed data | `npm run seed:run:relational` | `src/database/seeds/relational/` |
| Start dev | `npm run start:dev` or Docker | `src/main.ts` |
| Unit tests | `npm run test` | `src/**/*.spec.ts` |
| E2E tests | `npm run test:e2e` | `test/**/*.e2e-spec.ts` |
| Lint | `npm run lint` | `.eslintrc` |
| Format | `npm run format` | `.prettierrc` |

---

## Documentation Files
- **API responses**: `docs/api-success-responses.md`, `docs/api-error-responses.md`
- **Database schema**: `docs/database.md`
- **File uploads**: `docs/file-uploading.md`
- **Installation**: `docs/installing-and-running.md`

---

## Critical Clarifications for AI Agents

### Understanding the Mapper Pattern
**This is non-negotiable in this codebase.** Always convert ORM entities to domain models:

```
NEVER: return userEntity directly from repository to controller
CORRECT: return UserMapper.toDomain(userEntity)
```

Every repository method must use the mapper on its return value. Controllers should never see ORM entities.

### Module Dependency Injection Order
When creating new modules, always:
1. Create the module file (`xxx.module.ts`)
2. Define providers in order: `[Repository, Service]` 
3. Export: `exports: [Service, RepositoryInterface]`
4. Import parent module: `imports: [RelationalPersistenceModule]`

See `src/users/users.module.ts` for the exact pattern.

### Guard Pairing Rule
**ALWAYS use both guards together on protected endpoints:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)  // ← Both required
@Roles(RoleEnum.admin)                // ← Specify required role(s)
```

Using only `JwtAuthGuard` without `RolesGuard` skips role validation. This is a security issue.

### ClsService Request Context
Request-scoped data (userId, tenantId, etc.) is stored in ClsService automatically by guards:
- `JwtAuthGuard` sets `cls.set('userId', user.id)`
- Available anywhere in the request lifecycle
- Essential for audit trails, multi-tenancy, logging

Do NOT pass userId as method parameters - read from ClsService instead.

### Error Messages Must Be Internationalized
All user-facing error messages must:
1. Have an entry in `MessagesEnum` (`src/common/exception/messages.enum.ts`)
2. Be resolved via `getMessage()` helper
3. Have corresponding i18n files in `src/i18n/en/` and `src/i18n/ja/`

**Never** throw error messages as plain strings.

### Service Responsibilities vs Controller Responsibilities
**Service does**: Business logic, validation, cross-service coordination, error handling
**Controller does**: Parse request, call service, format response, return ResponseUtil.success*()

Controllers should never contain business logic, SQL, or repository calls.

### Soft Delete Implementation
Entities with `deletedAt` column are soft-deleted:
- Always query with `deletedAt IS NULL` filter (automatic in most repos)
- Update `user.deletedAt = new Date()` to delete
- Never use `.delete()` method on repositories

Check if repository includes soft-delete filters in queries.

### Pagination with hasNextPage
`infinityPagination()` uses cursor-based pagination:
- Returns `hasNextPage: true` if `data.length === limit`
- Returns `hasNextPage: false` if `data.length < limit`
- Clients should stop paginating when `hasNextPage === false`

Cap `limit` at 50 in controllers to prevent resource exhaustion.

### Testing Strategy
- **Unit tests** (.spec.ts in src/): Mock repositories, test service logic
- **E2E tests** (test/): Use real database, test API contracts
- Tests run with `npm run test` (unit) or `npm run test:e2e`
- E2E tests require authentication via JWT token

Never test ExceptionsFilter or global interceptors in service tests.

### Configuration Loading
All configuration comes from `ConfigService`:
```typescript
this.configService.getOrThrow('app.port')  // Returns value or throws if missing
this.configService.get('app.name', { infer: true })  // Type-safe with infer
```

Never use `process.env` directly in services. Always wrap with ConfigService.

### Database Migrations
After modifying entities:
1. Run `npm run migration:generate -- src/database/migrations/DescriptiveName`
2. Test with `npm run migration:run`
3. Commit migrations to git (in `src/database/migrations/`)
4. Never use `synchronize: true` in production

Hygen templates auto-generate migrations - use `npm run generate:resource:relational`.

### Docker Local Development
Always develop with Docker for consistency:
```powershell
docker compose -f docker-compose.dev.yaml up -d
docker compose -f docker-compose.dev.yaml logs -f survey-nocode-be
```

This ensures PostgreSQL, Redis, and MailDev are running correctly.

### Response Consistency
Every endpoint response must follow one of these patterns:

```typescript
// Success with data
return ResponseUtil.successWithData(user);
// → { statusCode: 200, message: 'Success', data: {...} }

// List with pagination
return infinityPagination(users, { limit: 10 });
// → { data: [...], hasNextPage: boolean }

// Error (thrown, caught by ExceptionsFilter)
throw BusinessException.notFound(getMessage(MessagesEnum.USER_NOT_FOUND));
// → { statusCode: 404, message: '...', reason: 'NotFound', details: null }
```

Never mix response formats or add custom HTTP status codes outside ResponseUtil.

---

## Workflow for AI Agents

**When implementing a feature:**

1. **Read the architecture first**: Understand domain model → repository → service → controller flow
2. **Check existing patterns**: Look at `UsersModule`, `UsersService`, etc. for the exact pattern to follow
3. **Use Hygen templates**: `npm run generate:resource:relational` to scaffold new modules
4. **Follow the mapper pattern**: Domain ↔ ORM conversion is mandatory
5. **Add guards and roles**: Use `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)`
6. **Error handling**: Always throw `BusinessException` with `getMessage(MessagesEnum.*)`
7. **Response format**: Use `ResponseUtil.successWithData()` for success responses
8. **Test coverage**: Add `.spec.ts` unit tests and e2e tests in `test/`
9. **Validate**: Run `npm run lint`, `npm run test`, verify migrations
10. **Commit**: Use conventional commits (feat:, fix:, test:, etc.)

**Common mistakes to avoid:**

- ❌ Returning ORM entities directly (use mapper)
- ❌ Throwing HttpException (use BusinessException)
- ❌ Business logic in controllers (move to service)
- ❌ Plain text error messages (use i18n)
- ❌ Skipping RolesGuard (security risk)
- ❌ Physical deletes (always soft-delete with deletedAt)
- ❌ process.env in services (use ConfigService)
- ❌ QueryBuilder without soft-delete filter (include deletedAt IS NULL)

