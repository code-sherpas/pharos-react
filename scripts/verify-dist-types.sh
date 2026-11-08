#!/bin/bash
#
# Compiles a consumer against the package as npm would install it.
#
#   bash scripts/verify-dist-types.sh      (pnpm build runs it; needs dist/)
#
# It packs the tarball, unpacks it into a throwaway project's node_modules and
# compiles `tests/dist-types/consumer.ts` there, plus one import of every
# subpath of `exports` read from `package.json`, by package name, with
# `skipLibCheck: false`, in `moduleResolution` `bundler`, `node16` and
# `nodenext`. That is what a consumer's TypeScript sees and the repository's
# own `pnpm typecheck` does not: it runs with `skipLibCheck: true` and
# `Bundler`, which hid that every release from 0.2.2 to 3.0.2 shipped `.d.ts`
# files importing each other without a file extension — 48 TS2835 errors for a
# node16/nodenext consumer, and a barrel typed as `any` with `skipLibCheck`.
#
# The peer and runtime dependencies the `.d.ts` import (`react`,
# `@base-ui/react`, `class-variance-authority`, `clsx`…) are linked from this
# repository's install, so the check needs no network.
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tsc="$repository_root/node_modules/.bin/tsc"
consumer="$(mktemp -d)"
trap 'rm -rf "$consumer"' EXIT

cd "$repository_root"
pnpm pack --pack-destination "$consumer" >/dev/null
package_dir="$consumer/node_modules/@code-sherpas/pharos-react"
mkdir -p "$package_dir"
tar -xzf "$consumer"/code-sherpas-pharos-react-*.tgz -C "$package_dir" --strip-components=1

for dependency in react react-dom @types/react @types/react-dom @base-ui/react \
    @code-sherpas/pharos-tokens class-variance-authority clsx; do
    mkdir -p "$consumer/node_modules/$(dirname "$dependency")"
    ln -s "$(realpath "node_modules/$dependency")" "$consumer/node_modules/$dependency"
done

cp tests/dist-types/consumer.ts "$consumer/consumer.ts"
node --input-type=module -e '
import { readFileSync } from "node:fs";
const { name, exports } = JSON.parse(readFileSync("package.json", "utf8"));
for (const [index, subpath] of Object.keys(exports).entries()) {
  const specifier = name + subpath.slice(1);
  console.log(subpath.endsWith(".css") ? `import "${specifier}";` : `export * as subpath${index} from "${specifier}";`);
}' > "$consumer/subpaths.ts"
echo '{ "name": "pharos-react-consumer", "private": true, "type": "module" }' > "$consumer/package.json"

failed_resolutions=()
for resolution in bundler node16 nodenext; do
    if [ "$resolution" = bundler ]; then module=esnext; else module="$resolution"; fi
    cat > "$consumer/tsconfig.json" <<TSCONFIG
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "$module",
    "moduleResolution": "$resolution",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "skipLibCheck": false,
    "noUncheckedSideEffectImports": true,
    "noEmit": true,
    "types": []
  },
  "files": ["consumer.ts", "subpaths.ts"]
}
TSCONFIG
    if "$tsc" -p "$consumer/tsconfig.json"; then
        echo "✓ dist types compile for a consumer with moduleResolution $resolution"
    else
        echo "❌ A consumer with moduleResolution $resolution cannot compile against the packed package." >&2
        failed_resolutions+=("$resolution")
    fi
done

if [ "${#failed_resolutions[@]}" -gt 0 ]; then
    echo "❌ dist types fail for moduleResolution: ${failed_resolutions[*]}" >&2
    exit 1
fi
