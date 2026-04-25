# Claude Rules for This Project

## Commits
- Never add `Co-Authored-By` lines to commit messages

## README
- Update README only when something significant changes
- Always ask the user for confirmation before updating README
- Update README before pushing, not after

## Code comments
- All function comments and JSDoc must be written in English

## Writing code
- Do not write code directly into files
- Show the user what to write and where (file path + line number), let them write it themselves

## "проверь" command
Triggers: "проверь", "проверяй", "check", "ghjdthm"
- Immediately read the file, no confirmation needed
- Do not fix anything, just read and report back
