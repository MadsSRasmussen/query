export class NoClauseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NoClauseError";
    }
}
