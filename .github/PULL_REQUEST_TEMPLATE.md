# What kind of change does this PR introduce?

<!-- [ ] Bug fix | [ ] Feature | [ ] Architecture & Docs | [ ] Refactor | [ ] CI/CD -->
<!-- Name the change type, scope/component, and summary of changes. -->

# Why was this change needed?

<!-- Please describe the problem solved or requirement fulfilled, focusing on WHY rather than just WHAT. -->

# Technical Details & Scope

<!-- Summary of changes across backend, frontend, database schema, or infrastructure. -->

# Verification & Testing

<!-- Describe how this change was tested (e.g. Unit tests, Playwright E2E, manual API testing). -->

# QA

<!--
Write the steps here, replacing this whole comment. Leaving it as is, or writing
"N/A" / "TBD" / a bare empty checkbox as the whole section, counts as no QA at all.

Write real steps a reviewer can follow without asking you anything: setup, action,
expected result. Keep them as numbered checkboxes so a reviewer can tick them off -
the numbering is what the review board extracts, the checkbox is for the reviewer.
Steps inside a fenced code block are ignored, so keep them as plain lines.

Example of what it should look like:

1. [ ] Link a webhook endpoint pointing at http://localhost:9999 (nothing listening)
2. [ ] Approve an application to trigger a delivery
3. [ ] Delivery should show 4 attempts, roughly 1m / 5m / 30m apart, then stop
-->

# Checklist:

- [ ] My code follows the project's code style and architectural conventions.
- [ ] Local build passes (`pnpm run build`).
- [ ] Branding guard validation passes (`pnpm dlx tsx scripts/branding-guard.ts`).
- [ ] Tests and typecheck have been verified without errors.
- [ ] Documentation has been updated (if applicable).
- [ ] No secrets or sensitive credentials are included in this PR.
- [ ] I have filled in the QA / Verification section above with real steps to verify this change.
