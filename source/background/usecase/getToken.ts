import { createLog } from "../../util/log"
import { Result, resultOk } from "../../util/result"
import { GetRepoMethodError, OptionsRepo } from "../repo"

type UseCaseOptionsError = GetRepoMethodError<OptionsRepo['getOptions']>

type GetTokenRepo = Pick<OptionsRepo, 'getOptions'>

const log = createLog('background', 'GetTokenUsecase')
interface GetTokenInteractor {
    readonly getToken: () => Promise<Result<string | undefined, UseCaseOptionsError>>
}

const newGetTokenInteractor = (repo: GetTokenRepo): GetTokenInteractor => {
    const GetToken: GetTokenInteractor = {
        async getToken(): Promise<Result<string | undefined, UseCaseOptionsError>> {
            log.info('Starting repo.getOptions')
            const result = await repo.getOptions()
            log.info('Finished repo.getOptions')
            
            if (!result.ok) {
                return result
            }
            return resultOk(result.value.notionIntegrationToken)
        }
    }
    return GetToken
}

export type { UseCaseOptionsError, GetTokenRepo }
export { newGetTokenInteractor }