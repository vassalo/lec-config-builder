import { createContext } from 'use-context-selector';
import { EnvVar } from '../../../core/domain/types/EnvVar';

interface Props {
    envVars: EnvVar[];
    toggleEnvVars(variables: EnvVar[]): void;
    changeEnvVarValue(name: string, value: string): void;
}

export const ConfigCTX = createContext({} as Props)
