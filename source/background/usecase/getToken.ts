import { createLog } from "../../util/log"
import { FunctionError, Result, resultOk } from "../../util/result"
import { OptionsRepo } from "../repo"

type UseCaseOptionsError = FunctionError<OptionsRepo['getOptions']>

type GetTokenRepo = Pick<OptionsRepo, 'getOptions'>

const log = createLog('background', 'GetTokenUsecase')
interface GetTokenInteractor {
    readonly getToken: () => Promise<Result<string | undefined, UseCaseOptionsError>>
}

const newGetTokenInteractor = (repo: GetTokenRepo): GetTokenInteractor => {
    const GetToken: GetTokenInteractor = {
        async getToken(): Promise<Result<string | undefined, UseCaseOptionsError>> {
            log.info('Calling repo.getOptions: Start')
            const result = await repo.getOptions()
            log.info('Calling repo.getOptions: Finish')
            
            if (!result.ok) {
                log.info('Error result', result)
                return result
            }
            return resultOk(result.value.notionIntegrationToken)
        }
    }
    return GetToken
}

export type { UseCaseOptionsError, GetTokenInteractor, GetTokenRepo }
export { newGetTokenInteractor }