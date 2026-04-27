$ErrorActionPreference = "Stop"

# Core Services
npx ng g service core/auth/auth --skip-tests
npx ng g service core/auth/token --skip-tests
npx ng g guard core/auth/auth --implements CanActivateFn --skip-tests
npx ng g guard core/auth/role --implements CanActivateFn --skip-tests
npx ng g interceptor core/auth/auth --skip-tests

# Shared
npx ng g directive shared/directives/has-role --standalone --skip-tests
npx ng g component shared/components/data-table --standalone --style=css --skip-tests
npx ng g component shared/components/confirm-dialog --standalone --style=css --skip-tests

# Layouts
npx ng g component layout/system-layout --standalone --style=css --skip-tests
npx ng g component layout/tenant-layout --standalone --style=css --skip-tests

# Features - Auth
npx ng g component features/auth/login --standalone --style=css --skip-tests

# Features - System
npx ng g component features/system/dashboard --standalone --style=css --skip-tests
npx ng g component features/system/rule-engine --standalone --style=css --skip-tests
npx ng g component features/system/tenants --standalone --style=css --skip-tests
npx ng g component features/system/users --standalone --style=css --skip-tests
npx ng g component features/system/reports --standalone --style=css --skip-tests

# Features - Tenant
npx ng g component features/tenant/dashboard --standalone --style=css --skip-tests
npx ng g component features/tenant/alerts --standalone --style=css --skip-tests
npx ng g component features/tenant/cases --standalone --style=css --skip-tests
npx ng g component features/tenant/investigation --standalone --style=css --skip-tests
npx ng g component features/tenant/str --standalone --style=css --skip-tests
npx ng g component features/tenant/rule-engine --standalone --style=css --skip-tests
npx ng g component features/tenant/users --standalone --style=css --skip-tests
npx ng g component features/tenant/upload --standalone --style=css --skip-tests

Write-Host "Scaffolding Complete!"
