export function getGlyphOffsetX(font, fontSize, glyphInfo, prevGlyphId) {
    const kerning = prevGlyphId == null ? 0 : font.getKerning(prevGlyphId, glyphInfo.id);
    return (kerning + glyphInfo.xoffset) * fontSize;
}
//order is important here as we need to check vh and vw last
const vhSymbols = ['dvh', 'svh', 'lvh', 'vh'];
const vwSymbols = ['dvw', 'svw', 'lvw', 'vw'];
export function toAbsoluteNumber(value, getRelativeValue, root) {
    if (typeof value === 'number') {
        return value;
    }
    const number = parseFloat(value);
    if (isNaN(number)) {
        throw new Error(`Invalid number: ${value}`);
    }
    if (getRelativeValue != null && value.endsWith('%')) {
        return (getRelativeValue() * number) / 100;
    }
    if (root != null && vhSymbols.some((symbol) => value.endsWith(symbol))) {
        return ((root.component.size.value?.[1] ?? 0) * number) / 100;
    }
    if (root != null && vwSymbols.some((symbol) => value.endsWith(symbol))) {
        return ((root.component.size.value?.[1] ?? 0) * number) / 100;
    }
    return number;
}
export function getGlyphOffsetY(fontSize, lineHeight, glyphInfo) {
    //glyphInfo undefined for the caret, which has no yoffset
    return (glyphInfo?.yoffset ?? 0) * fontSize + (lineHeight - fontSize) / 2;
}
export function getOffsetToNextGlyph(fontSize, glyphInfo, letterSpacing) {
    return glyphInfo.xadvance * fontSize + letterSpacing;
}
export function getOffsetToNextLine(lineHeight) {
    return lineHeight;
}
export function getGlyphLayoutWidth(layout) {
    return Math.max(...layout.lines.map(({ nonWhitespaceWidth }) => nonWhitespaceWidth));
}
export function getGlyphLayoutHeight(linesAmount, lineHeight) {
    return Math.max(linesAmount, 1) * lineHeight;
}
