import shell from 'shelljs';
import fs from 'fs';

function main() {
    shell.exec('git clone https://github.com/strongdm/log-export-container -b docs/standardize-docs-for-config-builder ./temp/log-export-container');

    const baseDocsPath = './temp/log-export-container/docs/';
    const variablesDb = {
        inputs: extractInputVariables(),
        outputs: extractVariablesFromPath(baseDocsPath + 'outputs/'),
        miscellaneous: {
            ...extractVariablesFromPath(baseDocsPath + 'monitoring/'),
            ...extractVariablesFromPath(baseDocsPath + 'audit/')
        }
    };

    fs.writeFileSync('./src/data/fixtures/variables-db.json', JSON.stringify(variablesDb, null, 2));
}

function extractAssociatedVariablesData(textData) {
    const linesWithVariables = textData
        .split('\n')
        .filter(line => line.match(/^[*-] \*\*.+\*\*/));
    const associatedVariables = linesWithVariables.map(line => line.match(/(?<=\* \*\*).+(?=\*\*)/)[0]);
    const defaultValues = linesWithVariables.map(line => line.match(/(?<=\. Default = `)[^`]+(?=`\.)/)?.[0]);
    const examples = linesWithVariables.map(line => line.match(/(?<=\. E\.g\., `)[^`]+(?=`\.)/)?.[0]);
    const descriptions = linesWithVariables.map(line => line.match(/(?<=\*\*\. ).+/i)?.[0]);
    return [
        associatedVariables,
        defaultValues,
        examples,
        descriptions
    ]
}

function mountExtractedVariables(textData) {
    const [associatedVariables, defaultValues, placeholders, descriptions] = extractAssociatedVariablesData(textData);
    if (!associatedVariables.length) {
        return undefined
    }
    const extractedVariables = {}
    for (let i = 0; i < associatedVariables.length; i++) {
        const defaultValue = defaultValues[i] ?? null;
        const example = placeholders[i] ?? null;
        let description = descriptions[i] ?? null;
        if (description) {
            if (defaultValue != null) {
                description = description.replace(` Default = \`${defaultValue}\`.`, '');
            }
            if (example != null) {
                description = description.replace(` E.g., \`${example}\`.`, '');
            }
        }
        extractedVariables[associatedVariables[i]] = {
            defaultValue,
            example,
            description: description?.trim() ?? null
        };
    }
    return extractedVariables;
}

function extractInputVariables() {
    const extractedVariables = {
        'syslog-json': {},
        'syslog-csv': {},
        'tcp-json': {},
        'tcp-csv': {}
    };

    const path = './temp/log-export-container/docs/inputs/';
    const files = fs.readdirSync(path);
    for (const fileName of files) {
        const textData = fs.readFileSync(path + fileName, 'utf8');
        const mountedVariables = mountExtractedVariables(textData);
        if (!mountedVariables) {
            continue;
        }
        const lecInputValues = textData.match(/(?<=`LOG_EXPORT_CONTAINER_INPUT=)[^`]+(?=`)/g);
        for (const inputValue of lecInputValues) {
            extractedVariables[inputValue] = mountedVariables;
        }
    }

    return extractedVariables;
}

function extractVariablesFromPath(path) {
    const extractedVariables = {};
    const files = fs.readdirSync(path);
    for (const fileName of files) {
        const textData = fs.readFileSync(path + fileName, 'utf8');
        const mountedVariables = mountExtractedVariables(textData);
        if (!mountedVariables) {
            continue;
        }
        const parsedFileName = parseFileName(fileName);
        extractedVariables[parsedFileName] = mountedVariables;
    }

    return extractedVariables;
}

function parseFileName(fileName) {
    return fileName
        .replace(/(?<=[A-Z])_(?=[A-Z])/g, ' ')
        .substring(0, fileName.length - 3)
        .replace('CONFIGURE ', '');
}

main();
