import React from 'react';
import Column from './Column';
import { KanbanCardData } from './Card';

interface KanbanBoardProps {
    cards: KanbanCardData[];
    onCardClick?: (id: string) => void;
    onStageTransition?: (cardId: string, fromStage: string, toStage: string) => void;
}

const STAGES = [
    { id: 'NEW', title: 'New Leads' },
    { id: 'UNDER_REVIEW', title: 'Document Review' },
    { id: 'DOCUMENT_CHECK', title: 'Checklist Verification' },
    { id: 'ENTRANCE_EXAM', title: 'Entrance Exams' },
    { id: 'INTERVIEW', title: 'Interview Panel' },
    { id: 'MERIT_LIST', title: 'Merit List' },
    { id: 'OFFER_SENT', title: 'Offers Sent' },
    { id: 'FEES_PENDING', title: 'Fees Verification' },
    { id: 'ENROLLED', title: 'SIS Enrollment' }
];

export function KanbanBoard({ cards, onCardClick, onStageTransition }: KanbanBoardProps) {
    const getCardsForStage = (stageId: string) => {
        return cards.filter(card => {
            // Fuzzy match stage names
            const s = card.slaStatus; // just a placeholder check if we need to filter by status or others
            return true; // We'll map them inside the caller's filtered data structure
        });
    };

    const handleCardDragStart = (e: React.DragEvent, cardId: string) => {
        e.dataTransfer.setData('text/plain', cardId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleCardDrop = (cardId: string, targetStageId: string) => {
        const card = cards.find(c => c.id === cardId);
        if (!card) return;

        // Determine current stage of the card (e.g. from routing, props, or card object)
        // Find if they are different and call transition handler
        if (onStageTransition) {
            onStageTransition(cardId, 'CURRENT', targetStageId);
        }
    };

    // Construct columns map based on stages
    const columnsData = STAGES.map(stage => {
        // filter cards matching this specific stage
        // In real CRM, the stage matches card's current status field.
        // We will assume card has a status property or we map it based on status mapping
        return {
            ...stage,
            cards: cards.filter(c => {
                // Map card metadata status or fallback
                const status = (c as any).status || 'NEW';
                return status.toUpperCase() === stage.id;
            })
        };
    });

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar items-start select-none h-[calc(100vh-220px)] min-h-[500px]">
            {columnsData.map(col => (
                <Column
                    key={col.id}
                    id={col.id}
                    title={col.title}
                    cards={col.cards}
                    onCardClick={onCardClick}
                    onCardDragStart={handleCardDragStart}
                    onCardDrop={handleCardDrop}
                />
            ))}
        </div>
    );
}

export default KanbanBoard;
