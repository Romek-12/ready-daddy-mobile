"""
Preprocesses fetus SVGs: inlines CSS class-based styles as element attributes,
then regenerates fetusSvgs.ts with the processed SVG strings.

react-native-svg's SvgXml does not support <style> CSS class selectors,
so we must convert class="d" → fill="#dd8f8c" etc.
"""
import os
import re

def parse_css_classes(style_block):
    """Extract {classname: {property: value}} from a CSS style block."""
    rules = {}
    for match in re.finditer(r'\.([\w-]+)\s*\{([^}]+)\}', style_block):
        classname = match.group(1)
        props = {}
        for decl in match.group(2).split(';'):
            decl = decl.strip()
            if ':' in decl:
                prop, val = decl.split(':', 1)
                props[prop.strip()] = val.strip()
        if props:
            rules[classname] = props
    return rules

def inline_styles(svg_content):
    """Replace class="x" attributes with inline SVG presentation attributes."""
    # Extract style block
    style_match = re.search(r'<style[^>]*>(.*?)</style>', svg_content, re.DOTALL)
    if not style_match:
        return svg_content

    css_rules = parse_css_classes(style_match.group(1))

    # Remove the <defs>...</defs> block (contains the style)
    svg_content = re.sub(r'\s*<defs>.*?</defs>', '', svg_content, flags=re.DOTALL)

    def replace_class(m):
        tag_open = m.group(0)
        classes = re.search(r'class="([^"]+)"', tag_open)
        if not classes:
            return tag_open
        class_names = classes.group(1).split()
        inline = {}
        for cls in class_names:
            if cls in css_rules:
                inline.update(css_rules[cls])
        # Always remove class attribute (SvgXml can't process CSS classes)
        result = re.sub(r'\s*class="[^"]*"', '', tag_open)
        if inline:
            # Build inline attribute string (convert opacity to separate attr)
            attrs = ' '.join(f'{k}="{v}"' for k, v in inline.items())
            result = re.sub(r'(\s*/?>)$', f' {attrs}\\1', result)
        return result

    # Replace class attributes on all opening tags (including multiline)
    svg_content = re.sub(r'<[a-zA-Z][^>]*class="[^"]*"[^>]*/?>',
                         replace_class, svg_content, flags=re.DOTALL)

    return svg_content

script_dir = os.path.dirname(os.path.abspath(__file__))
assets_dir = os.path.join(script_dir, '..', 'assets', 'fetus')
out_path = os.path.join(script_dir, '..', 'src', 'data', 'fetusSvgs.ts')

out = '// Auto-generated — do not edit manually\n// Run: python3 scripts/process-fetus-svgs.py\n\nconst FETUS_SVGS: Record<number, string> = {\n'

for n in range(1, 16):
    path = os.path.join(assets_dir, f'fetus{n}.svg')
    with open(path, 'r', encoding='utf-8') as f:
        raw = f.read()
    processed = inline_styles(raw)
    backtick = '`'
    dollar_brace = '${'
    escaped = processed.replace(backtick, '\\`').replace(dollar_brace, '\\${')
    out += f'  {n}: `{escaped}`,\n'

out += '};\n\nexport default FETUS_SVGS;\n'

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(out)

print(f'Done. fetusSvgs.ts: {len(out)} bytes')
