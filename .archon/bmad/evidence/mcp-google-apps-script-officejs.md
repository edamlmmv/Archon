# Google Apps Script And OfficeJS MCP Awareness

## Summary

Archon preserves Google Apps Script, OfficeJS, Context7, and live Office MCP
mentions as advisory `mcpAwareness` route evidence. It does not claim local MCP
configuration, authorization, runtime calls, credentials, Office host state,
Apps Script deployment state, or verifier authority unless a captured artifact
proves those facts.

## BMAD Capability IDs

- `host.mcp.context7.google-apps-script.docs`: scoped Context7 docs evidence for
  Apps Script guide, reference, samples, REST API, and `@google/clasp mcp`.
- `host.mcp.context7.office-js-live.docs`: scoped Context7 docs evidence for
  Office JavaScript API, Outlook add-ins, OfficeDev docs/samples, `office-js`,
  Microsoft Learn, Microsoft MCP catalog, and office4ai candidate context.
- `host.mcp.office-js.live`: operator-granted live Office document MCP candidate
  evidence. This may write `office-document/content` only when explicitly
  granted and locally configured.

## Source Refs

- Google Apps Script Context7 docs:
  `/websites/developers_google_apps-script`,
  `/websites/developers_google_apps-script_reference`,
  `/googleworkspace/apps-script-samples`.
- Apps Script REST API:
  `https://developers.google.com/apps-script/api/reference/rest`.
- `@google/clasp mcp`:
  `https://github.com/google/clasp`.
- OfficeJS Context7 source:
  `/officedev/office-js-docs-reference`.
- Office and Outlook add-in source refs:
  `https://github.com/OfficeDev/office-js-docs-pr`,
  `https://github.com/OfficeDev/Office-Add-in-samples`,
  `https://github.com/OfficeDev/office-js`,
  `https://learn.microsoft.com/en-us/office/dev/add-ins/overview/office-add-ins`.
- Live Office MCP candidate refs:
  `https://github.com/microsoft/mcp`, `https://pypi.org/project/office4ai/`.

## Local Evidence Refs

- `/Users/edam/Documents/TODA/BMAD-METHOD/docs/workspace/mcp/context7-google-apps-script-planning.md`
- `/Users/edam/Documents/TODA/BMAD-METHOD/docs/workspace/mcp/context7-office-js-live-planning.md`
- `/Users/edam/Documents/TODA/BMAD-METHOD/docs/workspace/templates/capability-request.context7-google-apps-script.example.json`
- `/Users/edam/Documents/TODA/BMAD-METHOD/docs/workspace/templates/capability-request.context7-office-js-live.example.json`
- `/Users/edam/Documents/TODA/BMAD-METHOD/docs/workspace/templates/capability-request.office-js-live-mcp.example.json`
- `/Users/edam/Documents/TODA/BMAD-METHOD/test/fixtures/cpf/context7-google-apps-script/forge-request.json`
- `/Users/edam/Documents/TODA/BMAD-METHOD/test/fixtures/cpf/context7-office-js-live/forge-request.json`
- `/Users/edam/Documents/TODA/BMAD-METHOD/test/fixtures/cpf/office-js-live-mcp/forge-request.json`

## Boundary

These refs are route evidence only. They do not install Context7, `clasp`,
office4ai, Office Add-ins, certificates, OAuth, Microsoft Graph permissions, or
MCP servers. They do not grant access to Google Apps Script, Outlook mailbox
state, Office documents, mailboxes, secret stores, or target repositories. Forge output remains draft
only until review and promotion.
