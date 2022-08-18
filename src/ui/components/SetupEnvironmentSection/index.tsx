import { Checkbox, Col, Radio, RadioChangeEvent, Row, Tooltip } from 'antd';
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
import { BiLinkExternal } from 'react-icons/all';

type OptionInfo = {
    link: string,
    variables: Record<string, {
        defaultValue: string | null,
        example: string | null,
        description: string | null
    }>
}

function SetupEnvironmentSection() {
    const envVars = useEnvVars();
    const lecInputValue = envVars.find(envVar => envVar.name === 'LOG_EXPORT_CONTAINER_INPUT')!.value;
    const toggleEnvVars = useToggleEnvVars();
    const changeEnvVarValue = useChangeEnvVarValue();

    const getOptionAssociatedVariables = useCallback((event: CheckboxChangeEvent, optionName: string): EnvVar[] => {
        const envVarType = (event.target as any)['data-type'] as EnvVarTypes;
        const associatedVariables = (globalEnvVars[envVarType] as Record<string, OptionInfo>)[optionName].variables ?? {};
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
        changeEnvVarValue(outputEnvVarName, outputTypes.trim());
        handleToggleOption(event, optionName);
    }, [envVars, changeEnvVarValue, handleToggleOption]);

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
        changeEnvVarValue('LOG_EXPORT_CONTAINER_INPUT', event.target.value);
        toggleEnvVars(toggleVars.filter(envVar => countEnvVarsOccurrence[envVar.name] === 1));
    }, [envVars, changeEnvVarValue, handleToggleOption]);

    return (
        <Col span={8} className='section'>
            <h3>Config options</h3>

            <h4>Inputs</h4>
            <Radio.Group onChange={handleInputOnToggleOption} value={lecInputValue}>
                {Object.keys(globalEnvVars['inputs']).map(inputType => (
                    <Row>
                        <Radio key={inputType} className='radio-input' value={inputType} data-type='inputs'>
                            {inputType}
                        </Radio>
                        {
                            (globalEnvVars['inputs'] as any)[inputType]?.link &&
                            <Tooltip title='Open docs'>
                                <a className='docs-link' href={(globalEnvVars['inputs'] as any)[inputType]?.link} target='_blank'>
                                    <BiLinkExternal />
                                </a>
                            </Tooltip>
                        }
                    </Row>
                ))}
            </Radio.Group>

            <h4>Outputs</h4>
            {Object.keys(globalEnvVars['outputs']).map(option => (
                <Row>
                    <Checkbox
                        key={option}
                        onChange={(event) => handleOutputOnToggleOption(event, option)}
                        data-type='outputs'
                    >
                        {option}
                    </Checkbox>
                    {
                        (globalEnvVars['outputs'] as any)[option]?.link &&
                        <Tooltip title='Open docs'>
                            <a className='docs-link' href={(globalEnvVars['outputs'] as any)[option]?.link} target='_blank'>
                                <BiLinkExternal />
                            </a>
                        </Tooltip>
                    }
                </Row>
            ))}

            <h4>Misc</h4>
            {Object.keys(globalEnvVars['miscellaneous']).map(option => (
                <Row>
                    <Checkbox
                        key={option}
                        onChange={(event) => handleToggleOption(event, option)}
                        data-type='miscellaneous'
                    >
                        {option}
                    </Checkbox>
                    {
                        (globalEnvVars['miscellaneous'] as any)[option]?.link &&
                        <Tooltip title='Open docs'>
                            <a className='docs-link' href={(globalEnvVars['miscellaneous'] as any)[option]?.link} target='_blank'>
                                <BiLinkExternal />
                            </a>
                        </Tooltip>
                    }
                </Row>
            ))}
        </Col>
    );
}

export default SetupEnvironmentSection
