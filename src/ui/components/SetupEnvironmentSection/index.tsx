import { Checkbox, Col, Radio, RadioChangeEvent } from 'antd';
import { useCallback } from 'react';
import {
    useChangeEnvVarValue,
    useEnvVars, useToggleEnvVars
} from '../../contexts/ConfigCTX/ConfigCTX.hooks';
import globalEnvVars from '../../../data/fixtures/variables-db.json';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { EnvVar } from '../../../core/domain/types/EnvVar';
import { EnvVarTypes } from '../../../core/domain/types/EnvVarTypes';
import './styles.scss';

function SetupEnvironmentSection() {
    const envVars = useEnvVars();
    const lecInputValue = envVars.find(envVar => envVar.name === 'LOG_EXPORT_CONTAINER_INPUT')!.value;
    const toggleEnvVars = useToggleEnvVars();
    const changeVariableValue = useChangeEnvVarValue();

    const getOptionAssociatedVariables = useCallback((event: CheckboxChangeEvent, optionName: string): EnvVar[] => {
        const envVarType = (event.target as any)['data-type'] as EnvVarTypes;
        const associatedVariables = (globalEnvVars[envVarType] as Record<string, Record<string, {
            defaultValue: string | null,
            example: string | null,
            description: string | null
        }>>)[optionName];
        return Object.entries(associatedVariables)
            .map(([name, varData]) => ({
                name,
                value: varData.defaultValue ?? '',
                example: varData.example ?? '',
                description: varData.description ?? ''
            }));
    }, []);

    const handleToggleOption = useCallback((event: CheckboxChangeEvent, optionName: string) => {
        toggleEnvVars(getOptionAssociatedVariables(event, optionName));
    }, [envVars]);

    const handleOutputOnToggleOption = useCallback((event: CheckboxChangeEvent | RadioChangeEvent, optionName: string) => {
        const outputEnvVarName = 'LOG_EXPORT_CONTAINER_OUTPUT'
        let outputType = optionName.toLowerCase().replace(' ', '-');
        const outputEnvVar = envVars.find(envVar => envVar.name === outputEnvVarName)!
        let outputTypes;
        if (outputEnvVar.value!.includes(outputType)) {
            outputTypes = outputEnvVar.value?.replace(new RegExp(` ?${outputType}`), '') ?? '';
        } else {
            outputTypes = outputEnvVar.value! + ` ${outputType}`;
        }
        changeVariableValue(outputEnvVarName, outputTypes.trim());
        handleToggleOption(event, optionName);
    }, [envVars, changeVariableValue, handleToggleOption]);

    const handleInputOnToggleOption = useCallback((event: RadioChangeEvent) => {
        const prevInputType = envVars.find(item => item.name === 'LOG_EXPORT_CONTAINER_INPUT')!.value as string;
        const toggleVars = [
            ...getOptionAssociatedVariables(event, prevInputType),
            ...getOptionAssociatedVariables(event, event.target.value)
        ];
        const countEnvVarsOccurrence: Record<string, number> = {};
        for (const envVar of toggleVars) {
            countEnvVarsOccurrence[envVar.name] = (countEnvVarsOccurrence[envVar.name] ?? 0) + 1;
        }
        changeVariableValue('LOG_EXPORT_CONTAINER_INPUT', event.target.value);
        toggleEnvVars(toggleVars.filter(envVar => countEnvVarsOccurrence[envVar.name] === 1));
    }, [envVars, changeVariableValue, handleToggleOption]);

    return (
        <Col span={8} className='section'>
            <h3>Config options</h3>

            <h4>Inputs</h4>
            <Radio.Group onChange={handleInputOnToggleOption} value={lecInputValue}>
                {Object.keys(globalEnvVars['inputs']).map(inputType => (
                    <Radio className='radio-input' value={inputType} data-type='inputs'>
                        {inputType}
                    </Radio>
                ))}
            </Radio.Group>

            <h4>Outputs</h4>
            {Object.keys(globalEnvVars['outputs']).map(output => (
                <Checkbox
                    key={output}
                    onChange={(event) => handleOutputOnToggleOption(event, output)}
                    data-type='outputs'
                >
                    {output}
                </Checkbox>
            ))}

            <h4>Misc</h4>
            {Object.keys(globalEnvVars['miscellaneous']).map(option => (
                <Checkbox
                    key={option}
                    onChange={(event) => handleToggleOption(event, option)}
                    data-type='miscellaneous'
                >
                    {option}
                </Checkbox>
            ))}
        </Col>
    );
}

export default SetupEnvironmentSection
