import WebExtOptionsSync from 'webext-options-sync';
import { createLog, unknownError } from '../../util/log';
import { Result, resultError, resultOk } from '../../util/result';
import { newOptions, Options } from '../options';
import { OptionsRepo } from '../repo';

type OptionsSync = WebExtOptionsSync<Options>

const newOptionsRepo = (optionsSync: OptionsSync): OptionsRepo => {
    return {
        getOptions: async (): Promise<Result<Options, "options-sync">> => {
            const log = createLog('background', 'GetOptionsRepo')
            try {
                log.info('Calling optionsSync.getAll: Start')
                const values = await optionsSync.getAll()
                log.info('Calling optionsSync.getAll: Finish')
                
                return resultOk(newOptions(values.notionIntegrationToken))
            } catch (e) {
                log.error('Could not get options from OptionsSync', unknownError(e))
                if (e instanceof Error) {
                    return resultError('Could not get options from OptionsSync', 'options-sync', e)
                }
                return resultError('Could not get options from OptionsSync', 'options-sync')
            }
        },
    }
}

export { newOptionsRepo }