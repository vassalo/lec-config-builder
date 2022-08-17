import { ConfigCTX } from './ConfigCTX'
import { PropsWithChildren, useCallback, useState } from 'react';
import { EnvVar } from '../../../core/domain/types/EnvVar';

function ConfigProvider({ children }: PropsWithChildren) {
    const [envVars, setEnvVars] = useState<EnvVar[]>([
        {
            name: 'LOG_EXPORT_CONTAINER_INPUT',
            value: 'syslog-json',
            description: 'Container input format',
            readonly: true,
        },
        {
            name: 'LOG_EXPORT_CONTAINER_OUTPUT',
            value: 'stdout',
            description: 'Container output storage',
            readonly: true,
        },
    ]);

    const toggleEnvVars = useCallback((targetEnvVars: EnvVar[]) => {
        let newEnvVars = [...envVars];
        for (const envVar of targetEnvVars) {
            const exists = newEnvVars.find(v => v.name === envVar.name) !== undefined;
            if (exists) {
                newEnvVars = newEnvVars.filter((v => v.name !== envVar.name));
            } else {
                newEnvVars.push(envVar);
            }
        }
        setEnvVars(newEnvVars);
    }, [envVars]);

    const changeEnvVarValue = useCallback((name: string, value: string) => {
        const newEnvVars = [...envVars];
        const index = newEnvVars.findIndex(item => item.name === name);
        if (index >= 0) newEnvVars[index].value = value;
        setEnvVars(newEnvVars);
    }, [envVars]);

    return (
        <ConfigCTX.Provider value={{ envVars, toggleEnvVars, changeEnvVarValue }}>
            {children}
        </ConfigCTX.Provider>
    )
}

export default ConfigProvider
