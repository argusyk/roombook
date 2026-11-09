<!-- English override of apps/web/AGENTS.md for readers of the English edition
     of "Developing with Codex". Installed as apps/web/AGENTS.override.md by
     tools/en/use-english-agents.sh; mirrors apps/web/AGENTS.md on main (ch18-end).
     Source: tools/en/agents/apps-web.AGENTS.override.md -->
# apps/web: rules for agents

- Reply to the user in English. The UI labels, messages and test names are
  in Ukrainian; their English meaning is in docs/en/ui-strings.md.
- Form validation: only safeParse of the schemas from packages/shared. Do not
  write custom field checks in components. Error texts are in Ukrainian (the
  RoomBook UI language), on the web side.
- Accessibility: every field has a label with htmlFor; the error under the
  field has an id and is tied through aria-describedby; a field with an error
  has aria-invalid. After a failed submit, focus goes to the first field with
  an error. Do not put role="alert" on individual field messages.
- Do not change button or link texts without a direct request:
  e2e tests find elements by accessible name. Do not translate them
  into English either.
- Tests: pnpm --filter @roombook/web test; e2e only if routes
  or the page scenario changed.
