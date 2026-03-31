import os

out = '// Auto-generated — do not edit manually\n\nconst FETUS_SVGS: Record<number, string> = {\n'

for n in range(1, 16):
    path = os.path.join(os.path.dirname(__file__), '..', 'assets', 'fetus', f'fetus{n}.svg')
    with open(path, 'r', encoding='utf-8') as f:
        raw = f.read()
    backtick = '`'
    dollar_brace = '${'
    escaped = raw.replace(backtick, '\\`').replace(dollar_brace, '\\${')
    out += f'  {n}: `{escaped}`,\n'

out += '};\n\nexport default FETUS_SVGS;\n'

dest = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'fetusSvgs.ts')
with open(dest, 'w', encoding='utf-8') as f:
    f.write(out)

print(f'fetusSvgs.ts generated, size: {len(out)} bytes')
