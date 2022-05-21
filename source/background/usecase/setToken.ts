import { createLog } from "../../util/log"
import { FunctionError, Result, resultOk } from "../../util/result"
import { Options } from "../options"
import { OptionsRepo } from "../repo"

type SetTokenError = FunctionError<OptionsRepo['setNotionIntegrationToken']>

type SetTokenRepo = Pick<OptionsRepo, 'setNotionIntegrationToken'>

const log = createLog('background', 'SetTokenUsecase')
interface SetTokenInteractor {
    readonly setToken: (token: string) => Promise<Result<Options, SetTokenError>>
}

const newSetTokenInteractor = (repo: SetTokenRepo): SetTokenInteractor => {
    const SetToken: SetTokenInteractor = {
        async setToken(token): Promise<Result<Options, SetTokenError>> {
            log.info('Calling repo.setNotionIntegrationToken: Start')
            const result = await repo.setNotionIntegrationToken(token)
            log.info('Calling repo.setNotionIntegrationToken: Finish')
            
            if (!result.ok) {
                log.info('Error result', result)
                return result
            }
            return resultOk(result.value)
        }
    }
    return SetToken
}

export type { SetTokenError, SetTokenInteractor, SetTokenRepo }
export { newSetTokenInteractor }