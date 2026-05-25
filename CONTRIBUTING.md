# Contributing

## Git Flow Branch Model

This repository uses a lightweight Git Flow model:

- `master`: production-ready code
- `develop`: integration branch for upcoming releases
- `feature/<name>`: new features, branched from `develop`
- `release/<version>`: release preparation, branched from `develop`
- `hotfix/<name>`: urgent production fixes, branched from `master`

## Day-to-Day Workflow

1. Update local branches:
   - `git checkout develop`
   - `git pull origin develop`
2. Start a feature branch:
   - `git checkout -b feature/<short-description>`
3. Commit your changes:
   - `git add .`
   - `git commit -m "feat: add <short-description>"`
4. Push and open a Pull Request to `develop`:
   - `git push -u origin feature/<short-description>`

## Releases

1. Create release branch from `develop`:
   - `git checkout develop`
   - `git pull origin develop`
   - `git checkout -b release/<version>`
2. Finalize and merge into both `master` and `develop`.
3. Tag the release on `master`:
   - `git tag -a v<version> -m "release v<version>"`
   - `git push origin v<version>`

## Hotfixes

1. Create hotfix branch from `master`:
   - `git checkout master`
   - `git pull origin master`
   - `git checkout -b hotfix/<short-description>`
2. Merge hotfix into both `master` and `develop`.
3. Tag a patch version on `master` if needed.

## Pull Request Rules

- Feature PRs target `develop`.
- Release PRs target `master` (and back-merge to `develop`).
- Hotfix PRs target `master` (and back-merge to `develop`).
- Keep PRs focused and small when possible.
