# Claude Rules for This Project

## Commits
- Never add `Co-Authored-By` lines to commit messages

## README
- Update README only when something significant changes
- Always ask the user for confirmation before updating README
- Before every push, check if README needs updating — if yes, ask the user, update it first, then push

## Code comments
- All function comments and JSDoc must be written in English

## Writing code
- Do not write code directly into files
- Do not show code suggestions unless the user explicitly asks
- When asked, show what to write and where (file path + line number), let them write it themselves

## "проверь" command
Triggers: "проверь", "проверяй", "check", "чекни", "ghjdthm"
- Immediately read the file, no confirmation needed
- Do not fix anything, just read and report back

## "читай" command
Triggers: "читай", "прочитай"
- Immediately read the file, no confirmation needed

## "некст" command
Triggers: "некст", "next", "дальше", "lfkmit", "ytrcn"
- Continue to the next step without asking for confirmation
