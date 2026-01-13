import { BreakallWrapper, NowrapWrapper, WordWrapper } from './wrapper/index.js';
import { getGlyphLayoutHeight, toAbsoluteNumber } from './utils.js';
import { Signal, computed } from '@preact/signals-core';
import { MeasureMode } from 'yoga-layout/load';
function buildGlyphOutProperties(font, text, { fontSize: fontSizeString, letterSpacing, lineHeight: lineHeightString, wordBreak }) {
    const fontSize = toAbsoluteNumber(fontSizeString);
    let lineHeight;
    if (typeof lineHeightString === 'string' && lineHeightString.endsWith('px')) {
        lineHeight = parseFloat(lineHeightString);
    }
    else {
        lineHeight = fontSize * toAbsoluteNumber(lineHeightString, () => 1);
    }
    return { font, text, fontSize, letterSpacing: toAbsoluteNumber(letterSpacing), lineHeight, wordBreak };
}
const collapseRegex = /[\t\n ]+/gm;
const preLineCollapseNonLinefeedWhitespaceRegex = /[\t ]+/g;
const preLineCollapseLinefeedRegex = /[\t ]*\n[\t ]*/gm;
const preLineTrimNonLinefeedWhitespaceRegex = /^[ \t]+|[ \t]+$/g;
export function computedCustomLayouting(properties, fontSignal, propertiesRef) {
    return computed(() => {
        const font = fontSignal.value;
        if (font == null) {
            return undefined;
        }
        const textProperty = properties.value.text;
        let text = Array.isArray(textProperty) ? textProperty.map(toString).join('') : toString(textProperty);
        const tabSize = properties.value.tabSize;
        const whiteSpace = properties.value.whiteSpace;
        switch (whiteSpace) {
            case 'pre':
                //since we preserve everything, we convert tabs to spaces
                text = text.replaceAll('\t', ' '.repeat(tabSize));
                break;
            case 'pre-line':
                //preserving line feeds
                text = text
                    .replaceAll(preLineCollapseNonLinefeedWhitespaceRegex, ' ')
                    .replaceAll(preLineCollapseLinefeedRegex, '\n')
                    .replaceAll(preLineTrimNonLinefeedWhitespaceRegex, '');
                break;
            default:
                text = text.replaceAll(collapseRegex, ' ').trim();
                break;
        }
        const layoutProperties = buildGlyphOutProperties(font, text, properties.value);
        propertiesRef.current = layoutProperties;
        const { width: minWidth } = measureGlyphLayout(layoutProperties, 0);
        const { height: minHeight } = measureGlyphLayout(layoutProperties, undefined);
        return {
            minHeight,
            minWidth,
            measure: (width, widthMode) => measureGlyphLayout(layoutProperties, widthMode === MeasureMode.Undefined ? undefined : width),
        };
    });
}
function toString(value) {
    if (value instanceof Signal) {
        value = value.value;
    }
    if (value == null) {
        return '';
    }
    return String(value);
}
const wrappers = {
    'keep-all': NowrapWrapper,
    'break-all': BreakallWrapper,
    'break-word': WordWrapper,
};
const lineHelper = {};
export function measureGlyphLayout(properties, availableWidth) {
    const wrapper = wrappers[properties.wordBreak];
    const text = properties.text;
    let width = 0;
    let lines = 0;
    let charIndex = 0;
    while (charIndex < text.length) {
        wrapper(properties, availableWidth, charIndex, lineHelper);
        width = Math.max(width, lineHelper.nonWhitespaceWidth);
        lines += 1;
        charIndex = lineHelper.charLength + lineHelper.charIndexOffset;
    }
    if (text[text.length - 1] === '\n') {
        lines += 1;
    }
    return { width, height: getGlyphLayoutHeight(lines, properties.lineHeight) };
}
export function buildGlyphLayout(properties, availableWidth, availableHeight) {
    const lines = [];
    const wrapper = wrappers[properties.wordBreak];
    const text = properties.text;
    let charIndex = 0;
    while (charIndex < text.length) {
        const line = {};
        wrapper(properties, availableWidth, charIndex, line);
        lines.push(line);
        charIndex = line.charLength + line.charIndexOffset;
    }
    if (lines.length === 0 || text[text.length - 1] === '\n') {
        lines.push({
            charLength: 0,
            nonWhitespaceWidth: 0,
            whitespacesBetween: 0,
            charIndexOffset: text.length,
            nonWhitespaceCharLength: 0,
        });
    }
    return {
        lines,
        availableHeight,
        availableWidth,
        ...properties,
    };
}
