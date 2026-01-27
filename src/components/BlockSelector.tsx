import { CtaSection, BlogTeasers, ProductGridSection, RemoteReviews, HeroSliderBlock, GridSection } from './Blocks';

interface BlockSelectorProps {
    blocks: any[];
    entryId: string; // The ID of the page entry (e.g. LandingPage ID)
}

export const BlockSelector: React.FC<BlockSelectorProps> = ({ blocks, entryId }) => {

    return (
        <div className="block-selector">
            {blocks.map((block) => {
                switch (block.__typename) {
                    case 'Cta':
                        return <CtaSection key={block.id} data={block} entryId={entryId} />;
                    case 'ProductGrid':
                        return <ProductGridSection key={block.id} data={block} entryId={entryId} />;
                    case 'RemoteReviewsSection':
                        return <RemoteReviews key={block.id} data={block} entryId={entryId} />;
                    case 'HeroSlider':
                        return <HeroSliderBlock key={block.id} data={block} entryId={entryId} />;
                    case 'Grid':
                        return <GridSection key={block.id} data={block} entryId={entryId} />;
                    default:
                        console.warn('Unknown block type:', block.__typename);
                        return null;
                }
            })}
        </div>
    );
};
