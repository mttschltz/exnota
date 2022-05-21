import { createLog } from "../../util/log"
import { FunctionError, Result, resultOk } from "../../util/result"
import { OptionsRepo } from "../repo"

type UseCaseOptionsError = FunctionError<OptionsRepo['setNotionIntegrationToken']>

type SetTokenRepo = Pick<OptionsRepo, 'setNotionIntegrationToken'>

const log = createLog('background', 'SetTokenUsecase')
interface SetTokenInteractor {
    readonly setToken: (token: string) => Promise<Result<string | undefined, UseCaseOptionsError>>
}

const newSetTokenInteractor = (repo: SetTokenRepo): SetTokenInteractor => {
    const SetToken: SetTokenInteractor = {
        async setToken(token): Promise<Result<string | undefined, UseCaseOptionsError>> {
            log.info('Calling repo.setNotionIntegrationToken: Start')
            const result = await repo.setNotionIntegrationToken(token)
            log.info('Calling repo.setNotionIntegrationToken: Finish')
            
            if (!result.ok) {
                log.info('Error result', result)
                return result
            }
            return resultOk(result.value.notionIntegrationToken)
        }
    }
    return SetToken
}

export type { UseCaseOptionsError, SetTokenInteractor, SetTokenRepo }
export { newSetTokenInteractor }