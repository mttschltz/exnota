import { createLog } from "../../util/log"
import { Result, resultError, resultOk } from "../../util/result"
import { OptionsError } from "../options"
import { OptionsRepo } from "../repo"


type UseCaseOptionsError = OptionsError | 'getting-options'

type GetTokenRepo = Pick<OptionsRepo, 'getOptions'>

const log = createLog('background')
interface GetTokenInteractor {
    readonly getToken: () => Promise<Result<string | undefined, UseCaseOptionsError>>
}

const newGetTokenInteractor = (repo: GetTokenRepo): GetTokenInteractor => {
    const GetToken: GetTokenInteractor = {
        async getToken(): Promise<Result<string | undefined, UseCaseOptionsError>> {
            log.info('GetTokenUsecase: Starting repo.getOptions')
            const result = await repo.getOptions()
            log.info('GetTokenUsecase: Finished repo.getOptions')
            
            if (!result.ok) {
                return resultError('Could not get options', 'getting-options')
            }
            return resultOk(result.value.notionIntegrationToken)
        }
    }
    return GetToken
}

export type { UseCaseOptionsError, GetTokenRepo }
export { newGetTokenInteractor }