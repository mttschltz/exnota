import { Options } from "./options"
import { Result } from "../util/result"

type GetResultError<Type> = Type extends Result<'', infer X> ? X : never
type GetRepoMethodError<T extends () => any> = GetResultError<Awaited<ReturnType<T>>>

interface OptionsRepo {
    readonly getOptions: () => Promise<Result<Options, 'options-sync'>> 
}


export type {OptionsRepo,GetRepoMethodError }