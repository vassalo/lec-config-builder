import { Button, Col, Input, message, Tooltip, Form } from 'antd';
import { useChangeEnvVarValue, useEnvVars } from '../../contexts/ConfigCTX/ConfigCTX.hooks';
import { AiOutlineDownload, AiOutlineInfoCircle, MdFileCopy } from 'react-icons/all';
import './styles.scss';
import { useCallback, useEffect } from 'react';

function EditEnvironmentSection() {
    const [form] = Form.useForm();
    const envVars = useEnvVars();
    const changeEnvVarValue = useChangeEnvVarValue();

    useEffect(() => {
        const formValues: Record<string, string> = {};
        for (const envVar of envVars) {
            formValues[envVar.name] = envVar.value;
        }
        form.setFieldsValue(formValues);
    }, [envVars]);

    const getFormattedEnvVars = useCallback((values: Record<string, string>) => {
        return Object.entries(values).map((([name, value]) => `${name}=${value}\n`)).join('');
    }, [envVars]);

    const validateForm = useCallback(async (): Promise<Record<string, string> | undefined> => {
        try {
            return await form.validateFields();
        } catch (e: any) {
            const firstErrorField = document.querySelector(`input#${e['errorFields'][0]['name'][0]}`) as HTMLInputElement;
            if (firstErrorField) {
                firstErrorField.focus();
            }
            message.error('There are still some empty variables.')
        }
        return undefined;
    }, [form]);

    const handleCopyEnvVars = useCallback(async () => {
        const formValues = await validateForm();
        if (!formValues) {
            return;
        }
        await navigator.clipboard.writeText(getFormattedEnvVars(formValues));
        message.success('Copied successfully!');
    }, [getFormattedEnvVars]);

    const handleDownloadEnvFile = useCallback(async () => {
        const formValues = await validateForm();
        if (!formValues) {
            return;
        }
        const hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:attachment/text,' + encodeURI(getFormattedEnvVars(formValues));
        hiddenElement.target = '_blank';
        hiddenElement.download = 'env-file';
        hiddenElement.click();
        message.success('Download started!');
    }, [getFormattedEnvVars]);

    return (
        <Col span={16} className='section'>
            <h3>
                <span>Final environment file</span>

                <Tooltip placement="left" title="Copy env file">
                    <Button type="primary" shape="circle" icon={<MdFileCopy/>} onClick={handleCopyEnvVars}/>
                </Tooltip>

                <Tooltip placement="left" title="Download env file">
                    <Button type="primary" shape="circle" icon={<AiOutlineDownload/>} onClick={handleDownloadEnvFile}/>
                </Tooltip>
            </h3>

            <div className='env-file'>
                <Form
                    layout='vertical'
                    form={form}
                >
                    {envVars?.map(envVar => {
                        let className = 'variable-input';
                        if (envVar.readonly) {
                            className += ' readonly'
                        }
                        return (
                            <Form.Item
                                key={envVar.name}
                                className='variable-container'
                                rules={[{ required: true }]}
                                label={envVar.name}
                                name={envVar.name}
                            >
                                <Input
                                    className={className}
                                    value={envVar.value}
                                    placeholder={envVar.example}
                                    onChange={(event) => changeEnvVarValue(envVar.name, event.target.value)}
                                    readOnly={envVar.readonly}
                                    suffix={
                                        <Tooltip placement='left' title={envVar.description}>
                                            <AiOutlineInfoCircle style={{ color: 'rgba(0,0,0,.45)' }}/>
                                        </Tooltip>
                                    }
                                />
                            </Form.Item>
                        );
                    })}
                </Form>
            </div>
        </Col>
    )
}

export default EditEnvironmentSection;