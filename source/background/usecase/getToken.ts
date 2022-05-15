import { options } from "../../util/options"
import { Result, resultError, resultOk } from "../../util/result"
import { OptionsError } from "../options"
import type { Options } from "../options"


type UseCaseOptionsError = OptionsError | 'getting-options'

interface GetTokenRepo {
    readonly getOptions: () => Promise<Result<Options, 'error'>> 
}

interface GetTokenInteractor {
    readonly getToken: () => Promise<Result<string | undefined, UseCaseOptionsError>>
}

const newGetTokenInteractor = (repo: GetTokenRepo): GetTokenInteractor => {
    const GetToken: GetTokenInteractor = {
        async getToken(): Promise<Result<string | undefined, UseCaseOptionsError>> {
            const result = await repo.getOptions()

            if (!result.ok) {
                return resultError('Could not get options', 'getting-options')
            }
            // TODO: outside this, implement options dependency as repo taht returns Options domain object
            return resultOk(result.value.notionIntegrationToken)
        }
    }
    return GetToken
}

export { newGetTokenInteractor }