import fs from 'fs';

const baseLECPath = './log-export-container/';
const baseLECGithubURL = 'https://github.com/strongdm/log-export-container/tree/main/';

function main() {
    const variablesDb = {
        inputs: extractInputVariables(),
        outputs: extractVariablesFromPath('docs/outputs/'),
        miscellaneous: {
            ...extractVariablesFromPath('docs/monitoring/'),
            ...extractVariablesFromPath('docs/audit/')
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

    const docsPath = 'docs/inputs/';
    const files = fs.readdirSync(baseLECPath + docsPath);
    for (const fileName of files) {
        const textData = fs.readFileSync(baseLECPath + docsPath + fileName, 'utf8');
        const mountedVariables = mountExtractedVariables(textData);
        if (!mountedVariables) {
            continue;
        }
        const lecInputValues = textData.match(/(?<=`LOG_EXPORT_CONTAINER_INPUT=)[^`]+(?=`)/g);
        for (const inputValue of lecInputValues) {
            extractedVariables[inputValue] = {
                link: `${baseLECGithubURL}${docsPath}${fileName}`,
                variables: mountedVariables
            };
        }
    }

    return extractedVariables;
}

function extractVariablesFromPath(docsPath) {
    const extractedVariables = {};
    const files = fs.readdirSync(baseLECPath + docsPath);
    for (const fileName of files) {
        const textData = fs.readFileSync(baseLECPath + docsPath + fileName, 'utf8');
        const mountedVariables = mountExtractedVariables(textData);
        if (!mountedVariables) {
            continue;
        }
        const parsedFileName = parseFileName(fileName);
        extractedVariables[parsedFileName] = {
            link: `${baseLECGithubURL}${docsPath}${fileName}`,
            variables: mountedVariables
        };
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
