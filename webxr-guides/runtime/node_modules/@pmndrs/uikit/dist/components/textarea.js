import { Input } from './input.js';
export class Textarea extends Input {
    constructor(inputProperties, initialClasses, config) {
        super(inputProperties, initialClasses, { multiline: true, ...config });
    }
}
