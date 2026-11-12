# Routine maintenance

Use this checklist for dependency updates and changes to the waitlist experience.

## Dependency review

- Review the affected Next.js, React, TypeScript, and type-definition release notes.
- Check the Node.js requirement in `package.json`; it currently declares Node.js 20.9.0 or later.
- Review package scripts and install hooks before installing dependencies. Keep the lockfile consistent with the manifest.
- Keep dependency updates separate from sign-up behavior or design changes where practical.

## Validation in an isolated environment

The current package scripts provide `npm run build`. There is no `test` script in `package.json`; do not report an automated test suite as passing without adding and running one.

After reviewing the checkout and dependencies, use synthetic addresses and a test-only endpoint to check:

- A valid sign-up and an invalid email address.
- The documented five-attempts-per-minute limit and hidden bot-trap field.
- The sign-up endpoint's error handling when the test destination is unavailable.
- Responsive layout and the page's animated presentation.

Use test configuration for external services. Do not send routine validation sign-ups to the production waitlist or trigger bulk emails.

## Pull request evidence

Record the package changes, commands actually run, manual checks completed, and remaining limitations. Exclude API keys, webhook URLs containing credentials, and real subscriber data from screenshots and logs.

This checklist does not certify that a dependency audit or test run has been completed.
