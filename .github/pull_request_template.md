## What this changes

<!-- The extension and what it does, or what the change fixes. -->

## Checklist

- [ ] One extension per pull request
- [ ] Readable source: no minified or obfuscated code
- [ ] No remote code (`eval`, remote scripts, dynamic `import()`)
- [ ] No analytics or tracking
- [ ] Outside services are needed and listed under "Network" in the README
- [ ] The fewest permissions and the narrowest `matches` that work, each explained in the README
- [ ] `version` bumped for every change to an existing extension
- [ ] An OSI license compatible with GPL-3.0
- [ ] English in the code, with translations through `key[<locale>]`
- [ ] `python3 tools/validate.py --base origin/main` passes

## Testing

Tested in Kondor <version> with Install from File…
