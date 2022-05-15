import { Result, resultError } from "../../util/result"
import { OptionsError } from "../options"


type UseCaseOptionsError = OptionsError

interface GetTokenInteractor {
    readonly getToken: () => Promise<Result<string | undefined, UseCaseOptionsError>>
}

const newGetTokenInteractor = (/* TODO: options repo */): GetTokenInteractor => {
    const GetToken: GetTokenInteractor = {
        getToken() {
            // TODO: Make options repo dependency that returns domain object
            // TODO: fetch here and return
            // TODO: outside this, implement options dependency as repo taht returns Options domain object
            const result = resultError<string, UseCaseOptionsError>('Not implemented', 'missing-notion-integration-token')
            return Promise.resolve(result)
        }
    }
    return GetToken
}

export { newGetTokenInteractor }