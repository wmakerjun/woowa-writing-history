import { execFileSync } from 'node:child_process'

const steps = [
  {
    label: 'Restore generation 1 missing PRs',
    args: ['--input-type=module', '-e', 'import("./scripts/restore-generation-1-missing-prs.mjs")']
  },
  {
    label: 'Restore generation 2-5 missing PR authors',
    args: ['--input-type=module', '-e', 'import("./scripts/restore-missing-pr-authors-2to5.mjs")']
  },
  {
    label: 'Reconcile shared repository generations 6-7',
    args: ['--input-type=module', '-e', 'import("./scripts/reconcile-shared-repo-generations-6-7.mjs")']
  },
  {
    label: 'Regenerate archive summary data and pages',
    args: ['--input-type=module', '-e', 'import("./scripts/update-archive-summary-pages.mjs")']
  }
]

for (const step of steps) {
  console.log(`\n== ${step.label} ==`)
  execFileSync(process.execPath, step.args, {
    stdio: 'inherit'
  })
}
