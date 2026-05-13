# Context7 WebGL Fundamentals Evidence

Role:

- `host.mcp.context7.webgl-fundamentals.docs` is the BMAD capability for scoped WebGL Fundamentals docs evidence through Context7.
- It is the route for user language such as "WebGL2 MCP" when the requested scope is docs/capability awareness, not live runtime testing.
- The canonical Context7 library ID is `/websites/webglfundamentals`.
- The upstream WebGL2 reference is `https://webgl2fundamentals.org`, but it is a caveat only.

BMAD source refs:

- `/Users/edam/Documents/TODA/BMAD-METHOD/docs/workspace/mcp/context7-webgl-fundamentals-planning.md`
- `/Users/edam/Documents/TODA/BMAD-METHOD/docs/workspace/templates/capability-request.context7-webgl-fundamentals.example.json`
- `/Users/edam/Documents/TODA/BMAD-METHOD/docs/workspace/templates/context7-webgl-fundamentals-operator-evidence.template.json`
- `/Users/edam/Documents/TODA/BMAD-METHOD/test/fixtures/cpf/context7-webgl-fundamentals/forge-request.json`

Boundary:

- Do not claim a live WebGL2 MCP is installed, connected, authorized, or called.
- Do not claim WebGL runtime proof, browser GPU state proof, or local Context7 config proof.
- Do not claim a separate `host.mcp.context7.webgl2-fundamentals.docs` capability or separate `/websites/webgl2fundamentals` Context7 source.
- For WebGL2-specific answers, require retrieved evidence that names WebGL2 features, APIs, or upstream WebGL2 Fundamentals guidance.

Validation:

- `bmad workspace verify-capability --input docs/workspace/templates/capability-request.context7-webgl-fundamentals.example.json`
- `node test/test-capability-pack-forge.js`
- `node test/test-workspace-contracts.js`
- `npm run validate:refs`
- `npm run validate:graphify-manifests`
- `npm run validate:skills`
