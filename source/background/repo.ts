import { Options } from "./options"
import { Result } from "../util/result"

interface OptionsRepo {
    readonly getOptions: () => Promise<Result<Options, 'options-sync'>> 
}

export type {OptionsRepo }