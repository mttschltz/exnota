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
                log.info('OptionsRepo: Starting optionsSync.getAll')
                const values = await optionsSync.getAll()
                log.info('OptionsRepo: Finished optionsSync.getAll')
                
                return resultOk(newOptions(values.notionIntegrationToken))
            } catch (e) {
                log.error('OptionsRepo: Could not get options from OptionsSync', unknownError(e))
                if (e instanceof Error) {
                    return resultError('OptionsRepo: Could not get options from OptionsSync', 'options-sync', e)
                }
                return resultError('OptionsRepo: Could not get options from OptionsSync', 'options-sync')
            }
        },
    }
}

export { newOptionsRepo }