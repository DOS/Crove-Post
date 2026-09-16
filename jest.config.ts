// Real Jest entrypoint. The previous config used @nx/jest's getJestProjects(),
// but this repo has no nx.json / project.json (and @nx/jest was never a
// dependency), so `pnpm test` loaded nothing and silently ran zero tests.
// The 5 bootstrap specs live in tests/ with their real config in
// tests/bootstrap.jest.cjs — reuse it instead of duplicating.
module.exports = require('./tests/bootstrap.jest.cjs');
