interface EnvVar {
    name: string;
    value: string;
    example?: string;
    description?: string;
    readonly?: boolean;
}

export type { EnvVar }
