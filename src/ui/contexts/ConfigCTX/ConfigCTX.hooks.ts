import { useContextSelector } from 'use-context-selector';
import { ConfigCTX } from './ConfigCTX';

export function useEnvVars() {
    return useContextSelector(ConfigCTX, ctx => ctx.envVars);
}

export function useToggleEnvVars() {
    return useContextSelector(ConfigCTX, ctx => ctx.toggleEnvVars);
}

export function useChangeEnvVarValue() {
    return useContextSelector(ConfigCTX, ctx => ctx.changeEnvVarValue);
}
