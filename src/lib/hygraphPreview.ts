export function createPreviewAttributes({
    entryId,
    modelApiId,
    fieldApiId,
    componentChain,
    richTextFormat,
}: {
    entryId: string;
    modelApiId?: string;
    fieldApiId?: string;
    componentChain?: Array<{ fieldApiId: string; instanceId?: string }>;
    richTextFormat?: 'html' | 'markdown' | 'text';
}) {
    const attrs: Record<string, string> = {
        'data-hygraph-entry-id': entryId,
    };
    if (modelApiId) attrs['data-hygraph-model-api-id'] = modelApiId;
    if (fieldApiId) attrs['data-hygraph-field-api-id'] = fieldApiId;
    if (richTextFormat) attrs['data-hygraph-rich-text-format'] = richTextFormat;
    if (componentChain) attrs['data-hygraph-component-chain'] = JSON.stringify(componentChain);

    return attrs;
}
